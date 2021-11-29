﻿using System;
using System.Collections.Generic;
using System.Linq;
using Utility.Entity.Implementations;

namespace Utility.Evaluatable
{
    public delegate IAsyncEnumerable<Entity.Entity> EntityMutator(Entity.Entity entity, Entity.Entity parameters);

    public class EvaluatorConfig
    {
        public EntityMutator EntityMutator { get; init; }
        public RoslynWrapper<Entity.Entity, Entity.Entity> RoslynWrapper { get; internal set; }

        public EvaluatorConfig(EntityMutator entityMutator = null, RoslynWrapper<Entity.Entity, Entity.Entity> roslynWrapper = null)
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

        public async IAsyncEnumerable<Entity.Entity> Evaluate(Entity.Entity entity, Entity.Entity parameters)
        {
            var stack = new Stack<(Entity.Entity entity, bool handled)>();
            stack.Push((entity, false));

            while (stack.Any())
            {
                var current = stack.Pop();

                if (!current.handled)
                {
                    await foreach (var child in HandleEntity(current.entity, parameters))
                    {
                        stack.Push((child, true));
                    }
                }
                else
                {
                    Entity.Entity evaluationResult;
                    if (current.entity.Document is IEvaluatable evaluatable)
                    {
                        evaluationResult = await evaluatable.Evaluate(current.entity, parameters);
                    }
                    else
                    {
                        var evaluate = await current.entity.EvalE("$evaluate", defaultValue: null);
                        if (evaluate == null)
                        {
                            // Entity has no evaluate method, short-cut for a constant
                            yield return current.entity;
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
                                evaluate = await evaluate.EvalE("$evaluate", defaultValue: null);
                            }

                            var stackedParameters = new EntityDocumentStack();
                            if (parameters != null)
                            {
                                stackedParameters.Push(parameters);
                            }

                            foreach (var stackItem in evaluateStack)
                            {
                                var actualParameters = await stackItem.EvalE("actualParameters", defaultValue: null);
                                if (actualParameters != null)
                                {
                                    stackedParameters.Push(actualParameters);
                                }
                            }

                            var id = await lastEvaluate.EvalGuid("$meta.id", defaultValue: null);
                            var code = await lastEvaluate.EvalS("code");
                            var evaluationParameters = entity.Create(new
                            {
                                parameters = stackedParameters
                            });

                            if (id.HasValue)
                            {
                                evaluationResult = await _config.RoslynWrapper.Evaluate(id.Value, code, evaluationParameters);
                            }
                            else
                            {
                                evaluationResult = await _config.RoslynWrapper.Evaluate(code, evaluationParameters);
                            }
                        }
                    }

                    var currentComplete = await evaluationResult.EvalE("Complete", defaultValue: null);
                    if (currentComplete == null)
                    {
                        throw new InvalidOperationException("Evaluation did not return Complete flag");
                    }

                    if (!currentComplete.Value<bool>())
                    {
                        stack.Push(current);
                    }

                    var next = await evaluationResult.EvalE("Entity", defaultValue: null);
                    if (next != null)
                    {
                        if (current.entity.Equals(next))
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
    }
}