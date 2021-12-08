using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Utility.Evaluatable
{
    public abstract class EvaluatableSequenceBase : IEvaluatable
    {
        private bool _loaded;
        private IList<Entity.Entity> _items;
        private int _itemIndex;

        public async Task<EvaluatableResponse> Evaluate(Entity.Entity entity, Entity.Entity parameters)
        {
            var sequence = entity.Value<EvaluatableSequenceBase>();

            if (!sequence._loaded)
            {
                var (found, targetEntity) = await parameters.Document.TryGetProperty("target", false);
                if (!found)
                {
                    throw new InvalidOperationException($"{nameof(EvaluatableSequenceBase)} requires a parameter named `target`");
                }

                _items = await Load(sequence, targetEntity, parameters).ToList();

                sequence._loaded = true;
            }

            if (sequence._itemIndex < sequence._items.Count)
            {
                return new EvaluatableResponse(
                    Entity: sequence._items[sequence._itemIndex++],
                    Complete: sequence._itemIndex >= sequence._items.Count
                );
            }

            return new EvaluatableResponse(Complete: true);
        }

        protected abstract IAsyncEnumerable<Entity.Entity> Load(EvaluatableSequenceBase sequence, Entity.Entity targetEntity, Entity.Entity parameters);
    }
}
