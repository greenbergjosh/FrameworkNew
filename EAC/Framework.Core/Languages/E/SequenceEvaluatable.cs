using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    public static class SequenceEvaluatable
    {
        public static async Task<object> Evaluate(IGenericEntity s)
        {
            var currentIndex = s.Get(Keywords.CurrentIndex, -1);
            var childContinuationPointer = s.Get(Keywords.ChildContinuationPointer, Guid.Empty);

            var slots = s.GetL(Keywords.Slots);

            if (childContinuationPointer == Guid.Empty)
                currentIndex++;

            var slotsCount = slots.Count();

            var state = (State)s;
            var contextList = s.Get(Keywords.Sequence, new List<IDictionary<string, object>>());

            if (contextList.Count == 0)
            {
                for (var i = 0; i < slotsCount; i++)
                    contextList.Add(new Dictionary<string, object>());
                s.Set(Keywords.Sequence, contextList);
            }

            IDictionary<string, object> result = null;
            // TODO: PostCompletionBehavior
            if (currentIndex < slotsCount)
            {
                var currentSlot = slots.ElementAt(currentIndex);
                var currentContext = contextList.ElementAt(currentIndex);
                currentSlot.TryGetValue(Keywords.Memory, out var memory, Keywords.Stack);

                state.PushContext(currentContext);
                state.PushStackFrame(currentContext);

                result = (IDictionary<string, object>)await Trampoline.Evaluate(memory, s, currentSlot);

                state.PopStackFrame();
                state.PopContext();

                s.Set(Keywords.CurrentIndex, currentIndex);
            }

            var completed = currentIndex == (slotsCount - 1);
            if (result == null)
                result = new Dictionary<string, object>();
            if (completed)
                result[Keywords.Completed] = completed;
            return result;
        }
    }
}
