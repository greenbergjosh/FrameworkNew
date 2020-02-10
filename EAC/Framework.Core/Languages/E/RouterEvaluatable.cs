using Framework.Core.ProcessManagement;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    public static class RouterEvaluatable
    {
        public static async Task<object> Evaluate(IGenericEntity s)
        {
            var state = (State)s;
            var processManager = ProcessManager.Instance;
            var cp = processManager.LoadContinuationPointer(s);
            var parameters = new Dictionary<string, object>()
            {
                [Keywords.ContinuationPointer] = cp.Id
            };

            foreach (var parameter in state.Stack)
                parameters.Add(parameter.Key, parameter.Value);

            Debug.WriteLine($"ThreadId: {cp.ThreadId}");

            var entityId = ((IDictionary<string, object>)state.Memory[Guid.Empty]).Get<Guid>(Keywords.EntityId);

            var result = (IDictionary<string, object>)await Trampoline.Evaluate(s, entityId, parameters);

            processManager.SaveState(cp.ThreadId, state);
            
            var completed = result.Get(Keywords.Completed, false);
            var g = result.Get(Keywords.ContinuationPointer, Guid.Empty);

            var previousG = result.Get(Keywords.PreviousContinuationPointer, Guid.Empty);

            if (previousG != Guid.Empty)
                processManager.SaveContinuationPointer(previousG, cp.ThreadId);

            if (!completed && g != cp.Id)
                processManager.SaveContinuationPointer(g, cp.ThreadId);

            return result;
        }
    }
}
