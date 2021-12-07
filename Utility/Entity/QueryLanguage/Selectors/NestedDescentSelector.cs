using System.Collections.Generic;
using Utility.Evaluatable;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class NestedDescentSelector : Selector
    {
#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        protected override async IAsyncEnumerable<Entity> Load(EvaluatableSequenceBase selector, Entity targetEntity, Entity parameters)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            foreach (var target in targetEntity.Document.EnumerateArray())
            {
                foreach (var child in GetChildren(target))
                {
                    yield return child;
                }
            }
        }

        private static IEnumerable<Entity> GetChildren(Entity entity)
        {
            if (entity.Document.IsObject)
            {
                yield return entity;
                foreach (var (name, value) in entity.Document.EnumerateObject())
                {
                    foreach (var child in GetChildren(value))
                    {
                        yield return child;
                    }
                }
            }
            else if (entity.Document.IsArray)
            {
                yield return entity;
                foreach (var item in entity.Document.EnumerateArray())
                {
                    foreach (var child in GetChildren(item))
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
