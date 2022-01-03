using System.Collections.Generic;
using Utility.Evaluatable;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class NestedDescentSelector : Selector
    {
        protected override async IAsyncEnumerable<Entity> Load(EvaluatableSequenceBase selector, Entity targetEntity, EvaluatableRequest request)
        {
            await foreach (var target in targetEntity.Document.EnumerateArray())
            {
                await foreach (var child in GetChildren(target))
                {
                    yield return child;
                }
            }
        }

        private static async IAsyncEnumerable<Entity> GetChildren(Entity entity)
        {
            if (entity.Document.IsObject)
            {
                yield return entity;
                await foreach (var (name, value) in entity.Document.EnumerateObject())
                {
                    await foreach (var child in GetChildren(value))
                    {
                        yield return child;
                    }
                }
            }
            else if (entity.Document.IsArray)
            {
                yield return entity;
                await foreach (var item in entity.Document.EnumerateArray())
                {
                    await foreach (var child in GetChildren(item))
                    {
                        yield return child;
                    }
                }
            }
            else
            {
                yield return entity;
            }
        }

        public override string ToString() => ".";
    }
}
