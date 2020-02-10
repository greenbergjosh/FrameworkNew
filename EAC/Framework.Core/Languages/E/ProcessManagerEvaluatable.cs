using Framework.Core.ProcessManagement;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    public static class ProcessManagerEvaluatable
    {
        public static Task<object> Evaluate(IGenericEntity s)
        {
            var processManager = ProcessManager.Instance;

            var completed = new[] {
                // ManageProcess(s, Keywords.ThreadComplete, processManager.ThreadComplete),
                ManageProcess(s, Keywords.KillProcess, processManager.KillProcess),
                ManageProcess(s, Keywords.KillThread, processManager.KillThread),
                ManageProcess(s, Keywords.MoveProcessToExceptionQueue, processManager.MoveProcessToExceptionQueue),
                ManageProcess(s, Keywords.HardKillProcess, processManager.KillProcess),
                ManageProcess(s, Keywords.HardMoveToExceptionQueue, processManager.KillProcess)
            }.Any(result => result == true);

            return Task.FromResult((object)new Dictionary<string, object>()
            {
                { Keywords.Completed, completed },
                { Keywords.Result, processManager }
            });
        }

        private static bool ManageProcess(IGenericEntity s, string key, Action<Guid> work)
        {
            if (s.TryGetValue(key, out Guid id))
            {
                work(id);
                return true;
            }

            return false;
        }
    }
}
