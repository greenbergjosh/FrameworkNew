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

        public async Task<EvaluateResponse> Evaluate(EvaluateRequest request)
        {
            var sequence = request.Entity.Value<EvaluatableSequenceBase>();

            if (!sequence._loaded)
            {
                var (found, targetEntity) = await request.Parameters.Document.TryGetProperty("target", false);
                if (!found)
                {
                    throw new InvalidOperationException($"{nameof(EvaluatableSequenceBase)} requires a parameter named `target`");
                }

                _items = await Load(sequence, targetEntity, request).ToList();

                sequence._loaded = true;
            }

            if (sequence._itemIndex < sequence._items.Count)
            {
                return new EvaluateResponse(
                    Entity: sequence._items[sequence._itemIndex++],
                    Complete: sequence._itemIndex >= sequence._items.Count
                );
            }

            return new EvaluateResponse(Complete: true, Entity: Entity.Entity.Undefined);
        }

        protected abstract IAsyncEnumerable<Entity.Entity> Load(EvaluatableSequenceBase sequence, Entity.Entity targetEntity, EvaluateRequest request);
    }
}
