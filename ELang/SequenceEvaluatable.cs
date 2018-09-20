using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    // This will get moved to dynamic code once it is available
    internal static class SequenceEvaluatable
    {
        private static async Task<IDictionary<string, object>> Evaluate(Request request, DictionaryStack parameters)
        {
            var readMemoryLocation = parameters.Get<Guid>("ReadLocation");
            var writeMemoryLocation = parameters.Get<Guid>("WriteLocation");

            var calls = parameters.Get<dynamic>("Calls");

            var currentIndex = (int)await calls.MemoryGet(readMemoryLocation, "CurrentIndex", -1);
            var childContinuationPointer = (Guid)await calls.MemoryGet(readMemoryLocation, "ChildContinuationPointer", Guid.Empty);

            var slots = parameters.GetList("Slots");

            if (childContinuationPointer == Guid.Empty)
            {
                currentIndex++;
            }

            Guid nextChildContinuationPointer = Guid.Empty;

            // TODO: PostCompletionBehavior
            if (currentIndex < slots.Count)
            {
                var currentSlot = slots[currentIndex];
                var childEntityId = currentSlot.Get<Guid>("EntityId");

                var childParameters = new DictionaryStack(parameters);
                childParameters.Push();
                childParameters["ContinuationPointer"] = childContinuationPointer;


                var childResult = await Evaluator.Evaluate(childEntityId, request, childParameters);
                nextChildContinuationPointer = childResult.Get("ContinuationPointer", Guid.Empty);

                // ** Test Code
                //nextChildContinuationPointer =  Guid.NewGuid();
                // ** Test Code - replace with commented out lines above to call child
                
                await calls.MemorySet(writeMemoryLocation, "CurrentIndex", currentIndex);
                await calls.MemorySet(writeMemoryLocation, "ChildContinuationPointer", nextChildContinuationPointer);
            }

            var completed = currentIndex == (slots.Count - 1) && nextChildContinuationPointer == Guid.Empty;
            var result = new Dictionary<string, object>()
            {
                { "Completed", completed },
            };

            return result;
        }
    }
}
