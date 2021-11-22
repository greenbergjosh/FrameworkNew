using System;
using System.Collections.Generic;
using System.Linq;

namespace Utility.Evaluatable
{
    public delegate IAsyncEnumerable<Entity.Entity> EntityMutator(Entity.Entity entity);

    public record EvaluatorConfig(EntityMutator EntityMutator = null);

    public class Evaluator
    {
        private readonly EvaluatorConfig _config;

        private Evaluator(EvaluatorConfig config) => _config = config;

        public static Evaluator Create(EvaluatorConfig config) => new(config ?? throw new ArgumentNullException(nameof(config)));

        public async IAsyncEnumerable<Entity.Entity> Evaluate(Entity.Entity entity)
        {
            var stack = new Stack<(Entity.Entity entity, bool handled)>();
            stack.Push((entity, false));

            while (stack.Any())
            {
                var current = stack.Pop();

                if (!current.handled)
                {
                    await foreach (var child in HandleEntity(current.entity))
                    {
                        stack.Push((child, true));
                    }
                }
                else if (!current.entity.IsEvaluatable)
                {
                    yield return current.entity;
                }
                else
                {
                    var evaluationResult = await current.entity.Evaluate();
                    var currentComplete = await evaluationResult.EvalB("Complete");
                    if (!currentComplete)
                    {
                        stack.Push(current);
                    }

                    var next = await evaluationResult.EvalE("Entity", null);
                    if (next != null)
                    {
                        stack.Push((next, false));
                    }
                }
            }
        }

        private async IAsyncEnumerable<Entity.Entity> HandleEntity(Entity.Entity entity)
        {
            var hadMutations = false;
            if (_config.EntityMutator != null)
            {
                await foreach (var child in _config.EntityMutator(entity))
                {
                    await foreach (var handledChild in HandleEntity(child))
                    {
                        hadMutations = true;
                        yield return handledChild;
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