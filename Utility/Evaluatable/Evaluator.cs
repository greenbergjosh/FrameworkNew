using System;
using System.Collections.Generic;
using System.Linq;
using Utility.Entity.Implementations;

namespace Utility.Evaluatable
{
    public delegate IAsyncEnumerable<Entity.Entity> EntityMutator(Entity.Entity entity, Entity.Entity parameters);

    public class EvaluatorConfig
    {
        public EntityMutator EntityMutator { get; init; }
        public RoslynWrapper<EvaluateRequest, EvaluateResponse> RoslynWrapper { get; internal set; }

        public EvaluatorConfig(EntityMutator entityMutator = null, RoslynWrapper<EvaluateRequest, EvaluateResponse> roslynWrapper = null)
        {
            EntityMutator = entityMutator;
            RoslynWrapper = roslynWrapper;
        }
    }

    public class Evaluator
    {
        private readonly EvaluatorConfig _config;

        private Evaluator(EvaluatorConfig config) => _config = config;

        public static Evaluator Create(EvaluatorConfig config) => new(config ?? throw new ArgumentNullException(nameof(config)));

        public IAsyncEnumerable<Entity.Entity> Evaluate(Entity.Entity entity, Entity.Entity parameters) => Evaluate(entity, default, parameters);

        public IAsyncEnumerable<Entity.Entity> Evaluate(Guid g, Entity.Entity parameters) => Evaluate(default, g, parameters);

        private static Dictionary<Guid, Dictionary<Guid, Dictionary<string, Entity.Entity>>> _gToThreadState = new();

        public async IAsyncEnumerable<Entity.Entity> Evaluate(Entity.Entity entity, Guid g, Entity.Entity parameters)
        {
            if (entity == default && g == default)
            {
                throw new InvalidOperationException($"One of {nameof(entity)} or {nameof(g)} must be provided.");
            }

            Dictionary<Guid, Dictionary<string, Entity.Entity>> threadState = null;
            if (entity == default)
            {
                threadState = _gToThreadState[g];
            }

            Guid CreateStackFrame()
            {
                var memoryLocation = Guid.NewGuid();

                if (threadState == null)
                {
                    threadState = new Dictionary<Guid, Dictionary<string, Entity.Entity>>();
                    _gToThreadState[memoryLocation] = threadState;
                }

                threadState.Add(memoryLocation, new Dictionary<string, Entity.Entity>());
                return memoryLocation;
            }

            var stack = new Stack<(Entity.Entity entity, bool handled, Guid memoryLocation)>();
            stack.Push((entity, false, g));

            while (stack.Any())
            {
                var (currentEntity, handled, memoryLocation) = stack.Pop();

                if (!handled)
                {
                    await foreach (var child in HandleEntity(currentEntity, parameters))
                    {
                        stack.Push((child, true, child == currentEntity ? memoryLocation : default));
                    }
                }
                else
                {
                    EvaluateResponse evaluationResult;
                    if (currentEntity.Document is IEvaluatable evaluatable)
                    {
                        if (memoryLocation == default)
                        {
                            memoryLocation = CreateStackFrame();
                        }
                        evaluationResult = await evaluatable.Evaluate(new EvaluateRequest(Entity: currentEntity, Parameters: parameters, currentEntity.Create(threadState[memoryLocation]).AsReadOnly(), WriteLocation: threadState[memoryLocation]));
                    }
                    else
                    {
                        Entity.Entity evaluate = null;

                        if (currentEntity.IsObject)
                        {
                            evaluate = await currentEntity.Eval("$evaluate").SingleOrDefault();
                        }

                        if (evaluate == null)
                        {
                            // Entity has no evaluate method, short-cut for a constant
#if DEBUG
                            if (memoryLocation != default)
                            {
                                throw new InvalidOperationException("Allocated memory for a constant");
                            }
#endif
                            yield return currentEntity;
                            continue;
                        }
                        else
                        {
                            var evaluateStack = new Stack<Entity.Entity>();
                            var lastEvaluate = evaluate;

                            while (evaluate != null)
                            {
                                evaluateStack.Push(evaluate);
                                lastEvaluate = evaluate;
                                // TODO: Formalize how an evaluate points to another entity,
                                // it is via EntityPath's ref feature, and thus maybe transparent here?
                                //(_, evaluate) = await evaluate.Document.TryGetProperty("$evaluate");
                                evaluate = await evaluate.Eval("$evaluate").SingleOrDefault();
                            }

                            var stackedParameters = new EntityDocumentStack();
                            if (parameters != null)
                            {
                                stackedParameters.Push(parameters);
                            }

                            foreach (var stackItem in evaluateStack)
                            {
                                var actualParameters = await stackItem.Eval("actualParameters").SingleOrDefault();
                                if (actualParameters != null)
                                {
                                    stackedParameters.Push(actualParameters);
                                }
                            }

                            var (codeFound, code) = await lastEvaluate.Document.TryGetProperty("code");
                            if (!codeFound)
                            {
                                throw new InvalidOperationException("No code found");
                            }

                            if (memoryLocation == default)
                            {
                                memoryLocation = CreateStackFrame();
                            }

                            var evaluatableRequest = new EvaluateRequest(Entity: currentEntity, Parameters: currentEntity.Create(stackedParameters), ReadLocation: currentEntity.Create(threadState[memoryLocation]).AsReadOnly(), WriteLocation: threadState[memoryLocation]);
                            evaluationResult = await _config.RoslynWrapper.Evaluate(code.Value<string>(), evaluatableRequest);
                        }
                    }

                    if (!evaluationResult.Complete)
                    {
                        stack.Push((currentEntity, handled, memoryLocation));
                    }
                    else
                    {
                        _ = threadState.Remove(memoryLocation);
                    }

                    var next = evaluationResult.Entity;
                    if (next != null)
                    {
                        if (currentEntity.Equals(next))
                        {
                            yield return next;
                        }
                        else
                        {
                            stack.Push((next, false, default));
                        }
                    }
                }
            }

#if DEBUG
            if (threadState?.Count > 0)
            {
                throw new InvalidOperationException("ThreadState not empty");
            }
#endif
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
    }
}