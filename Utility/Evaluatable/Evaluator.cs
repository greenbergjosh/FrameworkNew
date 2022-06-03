using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.Evaluatable.CodeProviders;
using Utility.Evaluatable.MemoryProviders;

namespace Utility.Evaluatable
{
    public delegate IAsyncEnumerable<Entity.Entity> EntityMutator(Entity.Entity entity, Entity.Entity parameters);

    public class EvaluatorConfig
    {
        public EntityMutator EntityMutator { get; init; }

        public IDictionary<string, IEvalProvider> EvalProviders { get; init; }

        public IEvalProvider DefaultEvalProvider { get; init; }

        public IMemoryProvider MemoryProvider { get; init; }

        public EvaluatorConfig(IMemoryProvider memoryProvider, EntityMutator entityMutator = null, IDictionary<string, IEvalProvider> evalProviders = null, IEvalProvider defaultEvalProvider = null)
        {
            MemoryProvider = memoryProvider;
            EntityMutator = entityMutator;
            EvalProviders = evalProviders;
            DefaultEvalProvider = defaultEvalProvider;
        }
    }

    public class Evaluator : IEvaluator
    {
        private readonly EvaluatorConfig _config;

        private Evaluator(EvaluatorConfig config) => _config = config;

        public static Evaluator Create(EvaluatorConfig config) => new(config ?? throw new ArgumentNullException(nameof(config)));

        public IAsyncEnumerable<Entity.Entity> Evaluate(Entity.Entity entity, Entity.Entity parameters) => Evaluate(entity, default, parameters);

        public IAsyncEnumerable<Entity.Entity> Evaluate(Guid g, Entity.Entity parameters) => Evaluate((Entity.Entity)default, g, parameters);

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
                    if (next != null && next != Entity.Entity.Undefined)
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

        private readonly Dictionary<string, Guid> _callTable = new();

        public async Task<EvaluateResponse> Evaluate(string variableName, Entity.Entity entity, Entity.Entity parameters)
        {
            ArgumentNullException.ThrowIfNull(variableName);
            ArgumentNullException.ThrowIfNull(entity);

            string entityKey = null;

            var (metaFound, meta) = await entity.Document.TryGetProperty("$meta");
            if (metaFound)
            {
                var (idFound, id) = await meta.Document.TryGetProperty("id");
                if (idFound)
                {
                    entityKey = id.Value<string>();
                }
            }

            if (entityKey == null)
            {
                entityKey = Hashing.CalculateMD5Hash(entity.ToString());
            }

            var memoryMapKey = variableName + entityKey;

            if (!_callTable.TryGetValue(memoryMapKey, out var historicalG))
            {
                historicalG = Guid.NewGuid();
                var historical = await _config.MemoryProvider.CreateNode(historicalG);

                var continualG = Guid.NewGuid();
                _ = await _config.MemoryProvider.CreateNode(continualG);

                var threadStateG = Guid.NewGuid();
                _ = await _config.MemoryProvider.CreateNode(threadStateG);

                var processStateG = Guid.NewGuid();
                _ = await _config.MemoryProvider.CreateNode(processStateG);

                historical["$meta.continualG"] = continualG;
                historical["$meta.threadStateG"] = threadStateG;
                historical["$meta.processStateG"] = processStateG;

                await _config.MemoryProvider.Serialize(historicalG, historical);
            }

            var response = await Evaluate(historicalG, entity, parameters);

            _callTable[memoryMapKey] = response.OutG;

            return response;
        }

        public async Task<EvaluateResponse> Evaluate(Guid historicalG, Entity.Entity entity, Entity.Entity parameters)
        {
            IDictionary<string, Entity.Entity> historicalMemory;
            IDictionary<string, Entity.Entity> continualMemory;
            IDictionary<string, Entity.Entity> threadStateMemory;
            IDictionary<string, Entity.Entity> processStateMemory;

            Guid continualG = default;
            Guid threadStateG = default;
            Guid processStateG = default;

            if (historicalG == default)
            {
                historicalMemory = new Dictionary<string, Entity.Entity>();
                continualMemory = new Dictionary<string, Entity.Entity>();
                threadStateMemory = new Dictionary<string, Entity.Entity>();
                processStateMemory = new Dictionary<string, Entity.Entity>();
            }
            else
            {
                bool found;
                (found, historicalMemory) = await _config.MemoryProvider.TryDeserialize(entity, historicalG);
                if (!found)
                {
                    throw new InvalidOperationException($"Unable to find historical memory at g-location {historicalG}");
                }

                (continualG, continualMemory) = await GetMemory("$meta.continualG", "continual");
                (threadStateG, threadStateMemory) = await GetMemory("$meta.threadStateG", "thread");
                (processStateG, processStateMemory) = await GetMemory("$meta.processStateG", "process");

                async Task<(Guid g, IDictionary<string, Entity.Entity> memory)> GetMemory(string key, string name)
                {
                    if (!historicalMemory.TryGetValue(key, out var gEntity))
                    {
                        throw new InvalidOperationException($"Historical node {historicalG} has no {name} pointer");
                    }

                    var g = gEntity.Value<Guid>();
                    var (found, memory) = await _config.MemoryProvider.TryDeserialize(entity, g);
                    if (!found)
                    {
                        throw new InvalidOperationException($"Unable to find {name} memory at g-location {g}");
                    }

                    return (g, memory);
                }
            }

            var (evaluateFound, evaluate) = await entity.Document.TryGetProperty("$evaluate");
            if (evaluateFound)
            {
                var handledEvaluate = await Process(evaluate);
                if (!handledEvaluate.Complete)
                {
                    throw new InvalidOperationException($"Iterating $evaluate is not supported, it must complete on first evaluation");
                }

                evaluate = handledEvaluate.Entity;
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

                var handledProvider = await Process(providerName);
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

            var evaluateRequest = new EvaluateRequest(
                Entity: entity,
                Parameters: parameters,
                Memory: new EvaluateMemory(
                    Historical: historicalMemory,
                    Continual: continualMemory,
                    Thread: threadStateMemory,
                    Process: processStateMemory
                )
            );

            var evaluateResponse = await provider.Evaluate(evaluateRequest);

            // TODO: Different memory models
            evaluateResponse = evaluateResponse with { InG = historicalG, OutG = historicalG };

            if (historicalG != default)
            {
                await _config.MemoryProvider.Serialize(historicalG, evaluateRequest.Memory.Historical);
                await _config.MemoryProvider.Serialize(continualG, evaluateRequest.Memory.Continual);
                await _config.MemoryProvider.Serialize(threadStateG, evaluateRequest.Memory.Thread);
                await _config.MemoryProvider.Serialize(processStateG, evaluateRequest.Memory.Process);
            }

            return evaluateResponse;

            async Task<EvaluateResponse> Process(Entity.Entity child)
            {
                var response = await child.Document.ProcessReference(default);
                if (response.Entity.ValueType != Entity.EntityValueType.Unhandled)
                {
                    // TODO: memory set p
                    return await Process(response.Entity);
                }

                // TODO: memory setup
                return await Evaluate(Guid.Empty, child, parameters);
            }
        }
    }
}