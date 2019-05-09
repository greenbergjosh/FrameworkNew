using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Utility;

namespace QueueProcessorLib
{
    public sealed class QueueProcessor
    {
        private static FrameworkWrapper _fw = null;
        private readonly List<QueueItemProducer> _producers = new List<QueueItemProducer>();

        private int _discriminatorsInRetryRefreshCycleMilliseconds;
        private readonly bool _runImmediateQueue;
        private readonly bool _runScheduledQueue;
        private readonly bool _runRestartQueue;
        private readonly bool _runRetryQueue;

        public void Config(FrameworkWrapper fw)
        {
            try
            {
                _fw = fw;
                _fw.TraceLogging = fw.StartupConfiguration.GetS("Config/Trace").ParseBool() ?? false;

                _discriminatorsInRetryRefreshCycleMilliseconds = int.Parse(_fw.StartupConfiguration.GetS("Config/DiscriminatorsInRetryRefreshCycleMilliseconds").IfNullOrWhitespace("1000"));

            }
            catch (Exception ex)
            {
                _fw?.Error(nameof(Config), ex.UnwrapForLog());
                throw;
            }
        }

        public void OnStart()
        {

        }
        public Task Run(HttpContext context) => context.Response.WriteAsync("Hello");
    }
}
