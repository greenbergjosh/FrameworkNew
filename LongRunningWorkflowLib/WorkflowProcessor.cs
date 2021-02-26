using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Utility;
using Utility.DataLayer;
using Utility.LongRunningWorkflow;

namespace LongRunningWorkflowLib
{
    public class WorkflowProcessor
    {
        private FrameworkWrapper _fw;
        private CancellationTokenSource _cancellationTokenSource = new CancellationTokenSource();
        private Task _workerTask;

        public void Config(FrameworkWrapper fw)
        {
            try
            {
                _fw = fw;
                _fw.TraceLogging = fw.StartupConfiguration.GetS("Config/Trace").ParseBool() ?? false;
            }
            catch (Exception ex)
            {
                _fw?.Error(nameof(Config), ex.UnwrapForLog());
                throw;
            }
        }

        public void OnStart()
        {
            _ = _fw.Log("LongRunningWorkflowProcessor.OnStart", "Starting...");

            _workerTask = Task.Run(async () =>
            {
                await _fw.Log("LongRunningWorkflowProcessor.OnStart", "Started.");
                while (!_cancellationTokenSource.Token.IsCancellationRequested)
                {
                    var result = await Data.CallFn("lrw", "processReadyQueue", JsonConvert.SerializeObject(new { batch_size = 20 }));
                    var threads = result?.GetL("");

                    if (threads?.Any() == true)
                    {
                        foreach (var thread in threads)
                        {
                            var threadId = Guid.Parse(thread.GetS("thread_id"));
                            var apartmentId = Guid.Parse(thread.GetS("apartment_id"));
                            var exclusive = thread.GetB("exclusive");
                            var waitId = Guid.Parse(thread.GetS("wait_id"));

                            var waitPayload = thread.GetE("payload");

                            var payloadRunnerEntityId = Guid.Parse(waitPayload.GetS("payloadRunnerEntityId"));
                            var payload = waitPayload.GetE("payload");

                            var waitWriter = new WaitWriter(threadId, apartmentId, exclusive, payloadRunnerEntityId, payload);

                            var runnerEntity = await _fw.Entities.GetEntity(payloadRunnerEntityId);
                            await _fw.RoslynWrapper.Evaluate(payloadRunnerEntityId, runnerEntity.GetS(""), new
                            {
                                threadId,
                                apartmentId,
                                exclusive,
                                payload,
                                waitWriter
                            }, new StateWrapper());

                            await Data.CallFn("lrw", "deleteRunningJob", JsonConvert.SerializeObject(new { wait_id = waitId }));
                            if (waitWriter.HasWaits)
                            {
                                await _fw.LrwWriter.Write(waitWriter);
                            }
                        }
                    }
                    else
                    {
                        await Task.Delay(1000);
                    }
                }
            }, _cancellationTokenSource.Token);
        }

        public void OnStop()
        {
            _ = _fw.Log("LongRunningWorkflowProcessor.OnStop", "Stopping...");

            _cancellationTokenSource.Cancel();

            _workerTask.Wait(60000);

            _ = _fw.Log("LongRunningWorkflowProcessor.OnStop", "Stopped");
        }

        public Task<string> HandleHttpRequest(HttpContext ctx) => Task.FromResult("OK");
    }
}