using Framework.Core.ProcessManagement;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    public static class SchedulerEvaluatable
    {
        public static Task<object> Evaluate(IGenericEntity s)
        {
            var scheduler = Scheduler.Instance;

            var completed = new[] {
                // ManageProcess(s, Keywords.ThreadComplete, processManager.ThreadComplete),
                Schedule(s, Keywords.RaiseSignal, scheduler.RaiseSignal),
                Schedule(s, Keywords.RaiseInterrupt, scheduler.RaiseInterrupt),
                Schedule(s, Keywords.ReadySetItem, scheduler.ReadySetItem)
            }.Any(result => result == true);

            return Task.FromResult((object)new Dictionary<string, object>()
            {
                { Keywords.Completed, completed },
                { Keywords.Result, scheduler }
            });
        }

        private static bool Schedule(IGenericEntity s, string key, Action<string> work)
        {
            var valueList = s.GetS(key);
            var hasItems = !valueList.IsNullOrWhitespace();
            if (hasItems)
            {
                var values = valueList.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var value in values)
                    work(value);
            }
            return hasItems;
        }
    }
}
