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
        public RoslynWrapper<Entity.Entity, EvaluatableResponse> RoslynWrapper { get; internal set; }

        public EvaluatorConfig(EntityMutator entityMutator = null, RoslynWrapper<Entity.Entity, EvaluatableResponse> roslynWrapper = null)
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
                    EvaluatableResponse evaluationResult;
                    if (current.entity.Document is IEvaluatable evaluatable)
                    {
                        evaluationResult = await evaluatable.Evaluate(current.entity, parameters);
                    }
                    else
                    {
                        var evaluateFound = false;
                        Entity.Entity evaluate = null;

                        if (current.entity.IsObject)
                        {
                            (evaluateFound, evaluate) = await current.entity.Document.TryGetProperty("$evaluate");
                        }

                        if (!evaluateFound)
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
                                (_, evaluate) = await evaluate.Document.TryGetProperty("$evaluate");
                            }

                            var stackedParameters = new EntityDocumentStack();
                            if (parameters != null)
                            {
                                stackedParameters.Push(parameters);
                            }

                            foreach (var stackItem in evaluateStack)
                            {
                                var (actualParametersFound, actualParameters) = await stackItem.Document.TryGetProperty("actualParameters");
                                if (actualParametersFound && actualParameters != null)
                                {
                                    stackedParameters.Push(actualParameters);
                                }
                            }

                            Guid? id = default;
                            var (metaFound, meta) = await lastEvaluate.Document.TryGetProperty("$meta");
                            if (metaFound)
                            {
                                var (idFound, idString) = await meta.Document.TryGetProperty("id");
                                if (idFound)
                                {
                                    if (Guid.TryParse(idString.Value<string>(), out var result))
                                    {
                                        id = result;
                                    }
                                }
                            }

                            var (codeFound, code) = await lastEvaluate.Document.TryGetProperty("code");
                            if (!codeFound)
                            {
                                throw new InvalidOperationException("No code found");
                            }

                            var evaluationParameters = entity.Create(new
                            {
                                parameters = stackedParameters
                            });

                            if (id.HasValue)
                            {
                                evaluationResult = await _config.RoslynWrapper.Evaluate(id.Value, code.Value<string>(), evaluationParameters);
                            }
                            else
                            {
                                evaluationResult = await _config.RoslynWrapper.Evaluate(code.Value<string>(), evaluationParameters);
                            }
                        }
                    }

                    if (!evaluationResult.Complete)
                    {
                        stack.Push(current);
                    }

                    var next = evaluationResult.Entity;
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