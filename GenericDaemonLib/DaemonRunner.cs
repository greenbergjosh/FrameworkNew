using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;
using Utility.GenericEntity;

namespace GenericDaemonLib
{
    public class DaemonRunner
    {
        private FrameworkWrapper _fw;
        private readonly CancellationTokenSource _cancellationTokenSource = new();
        private readonly List<Task> _workerTasks = new();

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

        public void OnStart() => _ = Task.Run(async () =>
                               {
                                   await _fw.Log($"{nameof(DaemonRunner)}.OnStart", "Starting...");

                                   foreach (var daemonConfig in _fw.StartupConfiguration.GetDe("Config/Daemons"))
                                   {
                                       var daemonName = daemonConfig.key;
                                       var daemonEntityId = Guid.Parse(daemonConfig.entity.GetS("EntityId"));
                                       var paused = daemonConfig.entity.GetB("Paused");

                                       if (paused)
                                       {
                                           await _fw.Log($"{nameof(DaemonRunner)}.OnStart", $"Skipping daemon: {daemonName} because it is paused");
                                           continue;
                                       }

                                       var parameters = new GenericEntityDictionary(new Dictionary<string, object>
                                       {
                                           ["daemonName"] = daemonName,
                                           ["cancellationToken"] = _cancellationTokenSource.Token
                                       });

                                       await _fw.Log($"{nameof(DaemonRunner)}.OnStart", $"Starting daemon: {daemonName}...");
                                       try
                                       {
                                           _workerTasks.Add(_fw.EvaluateEntity(daemonEntityId, parameters).ContinueWith(async t =>
                                           {
                                               await _fw.Error($"{nameof(DaemonRunner)}.RunDaemon", $"Error running daemon ${daemonName}: {t.Exception}");
                                           }, TaskContinuationOptions.OnlyOnFaulted));
                                           await _fw.Log($"{nameof(DaemonRunner)}.OnStart", $"Started daemon: {daemonName}...");
                                       }
                                       catch (Exception ex)
                                       {
                                           await _fw.Error($"{nameof(DaemonRunner)}.OnStart", $"Error starting daemon: {daemonName}\r\nException: {ex}");
                                       }
                                   }

                                   await _fw.Log($"{nameof(DaemonRunner)}.OnStart", "Started...");
                               }, _cancellationTokenSource.Token);

        public void OnStop()
        {
            _ = _fw.Log($"{nameof(DaemonRunner)}.OnStop", "Stopping...");

            _cancellationTokenSource.Cancel();

            Task.WaitAll(_workerTasks.ToArray(), 60000);

            _ = _fw.Log($"{ nameof(DaemonRunner)}.OnStop", "Stopped");
        }

        public Task<string> HandleHttpRequest(HttpContext ctx) => Task.FromResult("OK");
    }
}
