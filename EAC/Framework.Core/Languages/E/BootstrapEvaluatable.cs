using Framework.Core.ProcessManagement;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    public static class BootstrapEvaluatable
    {
        public static async Task<object> Evaluate(IGenericEntity s)
        {
            var result = (IDictionary<string, object>)await SchedulerEvaluatable.Evaluate(s);
            if (result.Get(Keywords.Completed, false))
                return result;

            result = (IDictionary<string, object>)await ProcessManagerEvaluatable.Evaluate(s);
            if (result.Get(Keywords.Completed, false))
                return result;

            var processManager = result.Get<IProcessManager>(Keywords.Result);

            try
            {
                return await RouterEvaluatable.Evaluate(s);
            }
            catch(Exception)
            {
                // TODO: Set thread in exception
                throw;
            }
            finally
            {
                // TODO: Perform process/thread cleanup. 
                // Cleanup could also be performed globally on a scheduled period.

                ((State)s).ClearServices();
            }
        }
    }
}
