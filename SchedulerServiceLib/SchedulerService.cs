﻿using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Quartz;
using Quartz.Impl;
using Quartz.Impl.Matchers;
using Utility;
using Utility.DataLayer;
using Jw = Utility.JsonWrapper;

namespace SchedulerServiceLib
{
    public sealed class SchedulerService
    {
        private static FrameworkWrapper _fw;
        private IScheduler _scheduler;

        public void Config(FrameworkWrapper fw)
        {
            try
            {
                _fw = fw;
                fw.TraceLogging = fw.StartupConfiguration.GetS("Config/Trace").ParseBool() ?? false;
            }
            catch (Exception ex)
            {
                _fw?.Error(nameof(Config), ex.UnwrapForLog());
                throw;
            }
        }

        public void OnStart()
        {
            _fw.Log("SchedulerService.OnStart", "Starting...");

            Task.Run(async () =>
            {
                try
                {
                    await InitScheduler();
                    await _fw.Log("SchedulerService.OnStart", "Started.");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    throw;
                }
            });
        }

        private async Task InitScheduler()
        {
            var props = new NameValueCollection
            {
                { "quartz.serializer.type", "binary" }
            };
            var factory = new StdSchedulerFactory(props);
            _scheduler = await factory.GetScheduler();

            var JobConfigs = await Data.CallFn("Config", "SelectConfigBody", Jw.Json(new { ConfigType = "JobConfig" }), "");
            foreach (var job in JobConfigs.GetL(""))
            {
                if (! job.GetB("Config/enabled")) { continue; }

                var name = job.GetS("Name");
                var lbmId = job.GetS("Config/lbmId");
                var cronGe = await Data.CallFn("Config", "SelectConfigById", Jw.Json(new { InstanceId = job.GetS("Config/schedule") }));
                var cron = cronGe.GetS("instruction");
#if DEBUG
                //if (job.GetS("Id") != "dda498aa-1f75-4f37-a1de-7ae9d6e52cf0") { continue;  }
                //cron = "0 */1 * * * ?";
#endif

                var parameters = job.GetD("Config").ToDictionary(p => p.Item1, p => p.Item2);


                var jobDetail = JobBuilder.Create<LmbJob>()
                    .WithIdentity(name)
                    .UsingJobData(new JobDataMap(parameters))
                    .Build();

                IDictionary<string, object> triggerData = new Dictionary<string, object>
                {
                    ["lbmId"] = lbmId
                };
                var triggerJobData = new JobDataMap(triggerData);

                var trigger = TriggerBuilder.Create()
                    .WithIdentity(name)
                    .WithCronSchedule(cron)
                    .ForJob(jobDetail)
                    .UsingJobData(triggerJobData)
                    .Build();

                await _scheduler.ScheduleJob(jobDetail, trigger);
            }

            await _scheduler.Start();
        }

        public void OnStop()
        {
            _fw.Log("SchedulerService.OnStop", "Stopping...");

            ShutdownScheduler().GetAwaiter().GetResult();

            _fw.Log("SchedulerService.OnStop", "Stopped");
        }

        private async Task ShutdownScheduler()
        {
            if (_scheduler != null) 
                await _scheduler.Shutdown();
            _scheduler = null;
        }

        public async Task HandleHttpRequest(HttpContext context)
        {
            try
            {
                var path = context.Request.Path.ToString().ToLowerInvariant();
                if (path.EndsWith('/'))
                    path = path.Remove(path.Length - 1);

                if (path == string.Empty && context.Request.Method == WebRequestMethods.Http.Get)
                    await GetStatus(context);
                else if (path == "/pauseall" && context.Request.Method == WebRequestMethods.Http.Post)
                {
                    await _scheduler.PauseAll();
                    context.Response.StatusCode = StatusCodes.Status200OK;
                }
                else if (path == "/resumeall" && context.Request.Method == WebRequestMethods.Http.Post)
                {
                    await _scheduler.ResumeAll();
                    context.Response.StatusCode = StatusCodes.Status200OK;
                }
                else if (path == "/pause" && context.Request.Method == WebRequestMethods.Http.Post)
                {
                    var jobName = context.Request.Query["job"].ToString();
                    await _scheduler.PauseJob(new JobKey(jobName));
                    await _scheduler.PauseTrigger(new TriggerKey(jobName));
                    context.Response.StatusCode = StatusCodes.Status200OK;
                }
                else if (path == "/resume" && context.Request.Method == WebRequestMethods.Http.Post)
                {
                    var jobName = context.Request.Query["job"].ToString();
                    await _scheduler.ResumeJob(new JobKey(jobName));
                    await _scheduler.ResumeTrigger(new TriggerKey(jobName));
                    context.Response.StatusCode = StatusCodes.Status200OK;
                }
                else if (path == "/delete" && context.Request.Method == WebRequestMethods.Http.Post)
                {
                    var jobName = context.Request.Query["job"].ToString();
                    await _scheduler.DeleteJob(new JobKey(jobName));
                    context.Response.StatusCode = StatusCodes.Status200OK;
                }
                else if (path == "/reset" && context.Request.Method == WebRequestMethods.Http.Post)
                {
                    await ShutdownScheduler();
                    await InitScheduler();
                    context.Response.StatusCode = StatusCodes.Status200OK;
                }
                else
                    context.Response.StatusCode = StatusCodes.Status404NotFound;
            }
            catch (Exception e)
            {
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await _fw.Error(nameof(HandleHttpRequest), $@"Caught exception processing request: {e.Message} : {e.UnwrapForLog()}");
                throw;
            }
        }

        private async Task GetStatus(HttpContext context)
        {
            var jobGroups = await _scheduler.GetJobGroupNames();

            var jobs = new List<IDictionary<string, object>>();
            foreach (var group in jobGroups)
            {
                var groupMatcher = GroupMatcher<JobKey>.GroupContains(group);
                var jobKeys = await _scheduler.GetJobKeys(groupMatcher);
                foreach (var jobKey in jobKeys)
                {
                    var detail = await _scheduler.GetJobDetail(jobKey);
                    var triggers = await _scheduler.GetTriggersOfJob(jobKey);
                    foreach (var trigger in triggers)
                    {
                        var triggerState = await _scheduler.GetTriggerState(trigger.Key);
                        var job = new Dictionary<string, object>
                        {
                            {"group", group},
                            {"name", jobKey.Name},
                            {"description", detail.Description},
                            {"triggerName", trigger.Key.Name},
                            {"triggerGroup", trigger.Key.Group},
                            {"triggerType", trigger.GetType().Name},
                            {"triggerState", triggerState.ToString()}
                        };

                        var nextFireTime = trigger.GetNextFireTimeUtc();
                        if (nextFireTime.HasValue)
                            job.Add("nextFireTime", nextFireTime.Value.LocalDateTime);

                        var previousFireTime = trigger.GetPreviousFireTimeUtc();
                        if (previousFireTime.HasValue)
                            job.Add("previousFireTime", previousFireTime.Value.LocalDateTime);

                        jobs.Add(job);
                    }
                }
            }
            

            var result = new Dictionary<string, object>
            {
                ["jobs"] = jobs
            };
            context.Response.ContentType = "application/json";
            var json = JsonWrapper.Serialize(result);
            await context.Response.WriteAsync(json);
        }

        [DisallowConcurrentExecution]
        internal class LmbJob : IJob
        {
            private static async Task Test()
            {
                
            }

            public async Task Execute(IJobExecutionContext context)
            {
                try
                {
                    // var key = context.JobDetail.Key;
                    var dataMap = context.JobDetail.JobDataMap;
                    var lbmId = Guid.Parse(context.Trigger.JobDataMap["lbmId"].ToString());
                    var code = await _fw.Entities.GetEntity(lbmId);
                    if (code?.GetS("Type") != "LBM.CS")
                    {
                        var error = $"{code?.GetS("Type")} LBM not supported. ({lbmId})\n";
                        throw new InvalidOperationException(error);
                    }

                    var (debug, debugDir) = _fw.RoslynWrapper.GetDefaultDebugValues();
                    var source = code.GetS("Config");
                    var sd = new ScriptDescriptor(lbmId, lbmId.ToString(), source, debug, debugDir);
                    _fw.RoslynWrapper.CompileAndCache(sd);

                    //await Test();

                    await _fw.RoslynWrapper.RunFunction(lbmId.ToString(), dataMap, null);
                }
                catch (Exception e)
                {
                    await _fw.Error($"{nameof(LmbJob)}.{nameof(Execute)}", $"{e.UnwrapForLog()}");
                }
            }
        }
    }
}