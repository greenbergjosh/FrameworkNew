﻿using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;

namespace GenericDaemonLib
{
    public class DaemonRunner : IGenericWindowsService
    {
        private FrameworkWrapper _fw;
        private readonly CancellationTokenSource _cancellationTokenSource = new();
        private readonly List<Task> _workerTasks = new();

        public Task Config(FrameworkWrapper fw)
        {
            _fw = fw;
            return Task.CompletedTask;
        }

        public void OnStart() => _ = Task.Run(async () =>
        {
            await _fw.Log($"{nameof(DaemonRunner)}.OnStart", "Starting...");

            foreach (var daemonConfig in await _fw.StartupConfiguration.EvalD("Daemons"))
            {
                var daemonName = daemonConfig.Key;
                var daemonEntityId = Guid.Parse(await daemonConfig.Value.EvalS("EntityId"));
                var paused = await daemonConfig.Value.EvalB("Paused");

                if (paused)
                {
                    await _fw.Log($"{nameof(DaemonRunner)}.OnStart", $"Skipping daemon: {daemonName} because it is paused");
                    continue;
                }

                var parameters = new Dictionary<string, object>
                {
                    ["daemonName"] = daemonName,
                    ["cancellationToken"] = _cancellationTokenSource.Token
                };

                await _fw.Log($"{nameof(DaemonRunner)}.OnStart", $"Starting daemon: {daemonName}...");
                try
                {
                    _workerTasks.Add(_fw.EvaluateEntity(daemonEntityId, _fw.Entity.Create(parameters)).ContinueWith(async t => await _fw.Error($"{nameof(DaemonRunner)}.RunDaemon", $"Error running daemon ${daemonName}: {t.Exception}"), TaskContinuationOptions.OnlyOnFaulted));
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

            try
            {
                _ = Task.WaitAll(_workerTasks.ToArray(), 60000);
            }
            catch(AggregateException aex)
            {
                aex.Handle(ex => ex is TaskCanceledException);
            }

            _ = _fw.Log($"{ nameof(DaemonRunner)}.OnStop", "Stopped");
        }

        public Task ProcessRequest(HttpContext ctx) => ctx.WriteSuccessRespAsync("OK");

        public Task Reinitialize() => Task.CompletedTask;
    }
}