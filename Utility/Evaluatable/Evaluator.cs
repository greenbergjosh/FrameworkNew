using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.Evaluatable.CodeProviders;

namespace Utility.Evaluatable
{
    public delegate IAsyncEnumerable<Entity.Entity> EntityMutator(Entity.Entity entity, Entity.Entity parameters);

    public class EvaluatorConfig
    {
        public EntityMutator EntityMutator { get; init; }

        public IDictionary<string, IEvalProvider> EvalProviders { get; init; }

        public IEvalProvider DefaultEvalProvider { get; init; }

        public EvaluatorConfig(EntityMutator entityMutator = null, IDictionary<string, IEvalProvider> evalProviders = null, IEvalProvider defaultEvalProvider = null)
        {
            EntityMutator = entityMutator;
            EvalProviders = evalProviders;
            DefaultEvalProvider = defaultEvalProvider;
        }
    }

    public class Evaluator
    {
        private readonly EvaluatorConfig _config;

        private Evaluator(EvaluatorConfig config) => _config = config;

        public static Evaluator Create(EvaluatorConfig config) => new(config ?? throw new ArgumentNullException(nameof(config)));

        public IAsyncEnumerable<Entity.Entity> Evaluate(Entity.Entity entity, Entity.Entity parameters) => Evaluate(entity, default, parameters);

        public IAsyncEnumerable<Entity.Entity> Evaluate(Guid g, Entity.Entity parameters) => Evaluate(default, g, parameters);

        private static readonly Dictionary<Guid, Dictionary<Guid, Dictionary<string, Entity.Entity>>> _gToThreadState = new();

        public async IAsyncEnumerable<Entity.Entity> Evaluate(Entity.Entity entity, Guid g, Entity.Entity parameters)
        {
            if (entity == default && g == default)
            {
                throw new InvalidOperationException($"One of {nameof(entity)} or {nameof(g)} must be provided.");
            }

            var stack = new Stack<(Entity.Entity entity, bool handled)>();
            stack.Push((entity, false));

            while (stack.Any())
            {
                var (currentEntity, handled) = stack.Pop();

                if (!handled)
                {
                    await foreach (var child in HandleEntity(currentEntity, parameters))
                    {
                        stack.Push((child, true));
                    }
                }
                else
                {
                    EvaluateResponse evaluationResult;
                    if (currentEntity.Document is IEvaluatable evaluatable)
                    {
                        evaluationResult = await evaluatable.Evaluate(new EvaluateRequest(Entity: currentEntity, Parameters: parameters));
                    }
                    else
                    {
                        Entity.Entity evaluate = null;

                        if (currentEntity.IsObject)
                        {
                            evaluate = await currentEntity.Eval("$evaluate").SingleOrDefault();
                        }

                        IEvalProvider provider;

                        if (evaluate == null)
                        {
                            provider = _config.DefaultEvalProvider;
                        }
                        else
                        {
                            var providerName = await evaluate.EvalS("provider");

                            if (!_config.EvalProviders.TryGetValue(providerName, out provider))
                            {
                                throw new InvalidOperationException($"No eval provider with the name `{providerName}`");
                            }
                        }

                        var evaluatableRequest = new EvaluateRequest(Entity: currentEntity, Parameters: parameters);
                        evaluationResult = await provider.Evaluate(evaluatableRequest);
                    }

                    if (evaluationResult?.Complete == false)
                    {
                        stack.Push((currentEntity, handled));
                    }

                    var next = evaluationResult?.Entity;
                    if (next != null)
                    {
                        if (currentEntity.Equals(next))
                        {
                            yield return next;
                        }
                        else
                        {
                            stack.Push((next, false));
                        }
                    }
                }
            }
        }

        private async IAsyncEnumerable<Entity.Entity> HandleEntity(Entity.Entity entity, Entity.Entity parameters)
        {
            var hadMutations = false;
            if (_config.EntityMutator != null)
            {
                await foreach (var child in _config.EntityMutator(entity, parameters))
                {
                    hadMutations = true;
                    if (entity.Equals(child))
                    {
                        yield return child;
                    }
                    else
                    {
                        await foreach (var handledChild in HandleEntity(child, parameters))
                        {
                            yield return handledChild;
                        }
                    }
                }
            }

            if (!hadMutations)
            {
                yield return entity;
            }
        }

        public async Task<EvaluateResponse> Evaluate2(Entity.Entity entity, Entity.Entity parameters, Guid g)
        {
            if (entity == default)
            {
                throw new InvalidOperationException($"{nameof(entity)} cannot be null.");
            }

            // TODO: Setup memory
            Entity.Entity evaluate = null;
            var evaluateFound = false;

            if (entity.IsObject)
            {
                (evaluateFound, evaluate) = await entity.Document.TryGetProperty("$evaluate");
                if (evaluateFound)
                {
                    Guid evaluateG = default; // we only want a single response, so no memory
                    var handledEvaluate = await Process(evaluate, evaluateG);
                    if (!handledEvaluate.Complete)
                    {
                        throw new InvalidOperationException($"Iterating $evaluate is not supported, it must complete on first evaluation");
                    }
                    evaluate = handledEvaluate.Entity;
                }
            }

            IEvalProvider provider;

            if (evaluate == null)
            {
                provider = _config.DefaultEvalProvider;
            }
            else
            {
                var (providerNameFound, providerName) = await evaluate.Document.TryGetProperty("provider");
                if (!providerNameFound)
                {
                    throw new InvalidOperationException($"`provider` missing in `$evaluate`");
                }

                Guid providerG = default; // we only want a single response, so no memory
                var handledProvider = await Process(providerName, providerG);
                if (!handledProvider.Complete)
                {
                    throw new InvalidOperationException($"Iterating $evaluate.provider is not supported, it must complete on first evaluation");
                }
                providerName = handledProvider.Entity;

                if (!_config.EvalProviders.TryGetValue(providerName.Value<string>(), out provider))
                {
                    throw new InvalidOperationException($"No eval provider with the name `{providerName}`");
                }
            }

            var evaluatableRequest = new EvaluateRequest(Entity: entity, Parameters: parameters);
            var evaluationResult = await provider.Evaluate(evaluatableRequest);

            if (provider is ConstantEvalProvider || evaluationResult.Entity == null)
            {
                // Base case
                return evaluationResult;
            }
            else
            {
                // Setup memory
                Guid childG = default;
                return await Evaluate2(evaluationResult.Entity, parameters, childG);
            }

            async Task<EvaluateResponse> Process(Entity.Entity child, Guid g)
            {
                var response = await child.Document.ProcessReference(g);
                if (response.Entity.ValueType != Entity.EntityValueType.Unhandled)
                {
                    // Do memory set up
                    Guid nestedG = default;
                    return await Process(response.Entity, nestedG);
                }

                // Set up memory for this call
                Guid childG = default;
                return await Evaluate2(child, parameters, childG);
            }
        }
    }
}