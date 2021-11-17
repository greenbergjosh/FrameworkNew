using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Quartz;
using Quartz.Impl;
using Quartz.Impl.Matchers;
using Utility;
using Utility.DataLayer;

namespace EdwRollupLib
{
    public partial class DataService : IGenericWindowsService
    {
        private static FrameworkWrapper _fw;
        private IScheduler _scheduler;
        private readonly Random _random = new();
        private readonly Guid _edwConfigId = Guid.Parse("af89426b-d7e9-4f89-b67c-4e57d2335cb3");

        public Task Config(FrameworkWrapper fw)
        {
            _fw = fw;
            RollupJob.FrameworkWrapper = fw;
            MaintenanceJob.FrameworkWrapper = fw;
            return Task.CompletedTask;
        }

        public void OnStart()
        {
            _fw.Log("EdwRollupService.OnStart", "Starting...");

            Task.Run(async () =>
            {
                try
                {
                    await InitScheduler();
                    await _fw.Log("EdwRollupService.OnStart", "Started.");
                }
                catch (Exception e)
                {
                    await _fw.Error("EdwRollupService.OnStart", $"Error: {e}");
#if DEBUG
                    Console.WriteLine($"{DateTime.Now}: {e}");
#endif
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

            _scheduler.Context["exclusiveQueueNextId"] = 0;
            _scheduler.Context["exclusiveQueueCurrentlyRunningId"] = 0;
            _scheduler.Context["exclusiveLock"] = new object();

            var rsConfigId = _fw.StartupConfiguration.EvalS("RsConfigId");

            var threadGroups = await Data.CallFn("config", "SelectConfigBody", JsonSerializer.Serialize(new
            {
                ConfigType = "EDW.ThreadGroup"
            }), "");

            foreach (var threadGroup in await threadGroups.EvalL(""))
            {
                var threadGroupName = await threadGroup.EvalS("Name");

                if (await threadGroup.EvalB("paused"))
                {
                    await _fw.Log("EdwRollupService.InitScheduler", $"{threadGroupName} is paused.");
#if DEBUG
                    Console.WriteLine($"{DateTime.Now}: {threadGroupName} is paused.");
#endif
                    continue;
                }

                IDictionary<string, object> parameters = new Dictionary<string, object>
                {
                    ["ThreadGroup"] = threadGroup,
                    ["EdwConfigId"] = _edwConfigId,
                    ["RsConfigId"] = rsConfigId
                };

                foreach (var rollupGroupPeriod in await threadGroup.EvalL("rollup_group_periods"))
                {
                    var period = await rollupGroupPeriod.EvalS("period");
                    var rollupFrequency = await rollupGroupPeriod.EvalS("rollup_frequency") ?? period;

                    var jobDetail = JobBuilder.Create<RollupJob>()
                        .WithIdentity($"{threadGroupName}_{period}", "RollupJob")
                        .UsingJobData(new JobDataMap(parameters))
                        .Build();

                    var cron = PeriodToCron(rollupFrequency);

                    await _fw.Log("EdwRollupService.InitScheduler", $"Scheduling {threadGroupName} {period} for {cron}");
#if DEBUG
                    Console.WriteLine($"{DateTime.Now}: Scheduling {threadGroupName} {period} for {cron}");
#endif

                    var trigger = TriggerBuilder.Create()
                        .WithIdentity($"{threadGroupName}_{period}", "RollupJob")
                        .WithCronSchedule(cron)
                        .ForJob(jobDetail)
                        .UsingJobData("Period", period)
                        .UsingJobData("TriggerFrequency", rollupFrequency)
                        .UsingJobData("Cron", cron)
                        .Build();

                    await _scheduler.ScheduleJob(jobDetail, trigger);
                }
            }

            var maintenanceTasks = await Data.CallFn("config", "SelectConfigBody", JsonSerializer.Serialize(new
            {
                ConfigType = "EDW.MaintenanceTask"
            }), "");

            foreach (var maintenanceTask in await maintenanceTasks.EvalL(""))
            {
                var enabled = await maintenanceTask.EvalB("enabled");
                if (!enabled)
                {
                    continue;
                }

                var name = await maintenanceTask.EvalS("Name");
                var cronExpression = await maintenanceTask.EvalS("cron_expression");
                var exclusive = await maintenanceTask.EvalB("exclusive");

                IDictionary<string, object> parameters = new Dictionary<string, object>
                {
                    ["Name"] = name,
                    ["Exclusive"] = exclusive,
                    ["RsConfigId"] = rsConfigId,
                    ["Entity"] = maintenanceTask,
                    ["Cron"] = cronExpression
                };

                var jobDetail = JobBuilder.Create<MaintenanceJob>()
                    .WithIdentity(name, exclusive ? MaintenanceJob.ExclusiveJobGroup : MaintenanceJob.JobGroup)
                    .UsingJobData(new JobDataMap(parameters))
                    .Build();

                await _fw.Log("EdwRollupService.InitScheduler", $"Scheduling maintenance task {name} for {cronExpression}");
#if DEBUG
                Console.WriteLine($"{DateTime.Now}: Scheduling maintenance task {name} for {cronExpression}");
#endif

                var trigger = TriggerBuilder.Create()
                    .WithIdentity(name, exclusive ? MaintenanceJob.ExclusiveJobGroup : MaintenanceJob.JobGroup)
                    .WithCronSchedule(cronExpression)
                    .UsingJobData(new JobDataMap(parameters))
                    .ForJob(jobDetail)
                    .Build();

                await _scheduler.ScheduleJob(jobDetail, trigger);
            }

            await _scheduler.Start();
        }

        private string PeriodToCron(string period)
        {
            var periodType = period[^1];
            var periodRange = int.Parse(period[0..^1]);

            return periodType switch
            {
                's' => $"{_random.Next(periodRange)}-59/{periodRange} * * * * ?",
                'm' => $"{_random.Next(60)} {_random.Next(periodRange)}-59/{periodRange} * * * ?",
                'h' => $"{_random.Next(60)} {_random.Next(60)} {_random.Next(periodRange)}-23/{periodRange} * * ?",
                'd' => $"{_random.Next(60)} {_random.Next(60)} {_random.Next(24)} */{periodRange} * ?",
                _ => throw new InvalidOperationException($"Unknown periodType: {periodType} in period {period}")
            };
        }

        public void OnStop()
        {
            _ = _fw.Log("EdwRollupService.OnStop", "Stopping...");

            ShutdownScheduler().GetAwaiter().GetResult();

            _ = _fw.Log("EdwRollupService.OnStop", "Stopped");
        }

        private async Task ShutdownScheduler()
        {
            if (_scheduler != null)
            {
                await _scheduler.Shutdown(true);
            }

            _scheduler = null;
        }

        public async Task ProcessRequest(HttpContext context)
        {
            try
            {
                var path = context.Request.Path.ToString().ToLowerInvariant();
                if (path.EndsWith('/'))
                {
                    path = path.Remove(path.Length - 1);
                }

                if (path == string.Empty && context.Request.Method == WebRequestMethods.Http.Get)
                {
                    await GetStatus(context);
                }
                else if (path == "/pauseall" && context.Request.Method == WebRequestMethods.Http.Post)
                {
                    await _scheduler.PauseAll();
                    Console.WriteLine($"{DateTime.Now}: Paused All");
                    await context.WriteSuccessRespAsync(_defaultResponse);
                }
                else if (path == "/resumeall" && context.Request.Method == WebRequestMethods.Http.Post)
                {
                    await _scheduler.ResumeAll();
                    Console.WriteLine($"{DateTime.Now}: Resumed All");
                    await context.WriteSuccessRespAsync(_defaultResponse);
                }
                else if (path == "/pause" && context.Request.Method == WebRequestMethods.Http.Post)
                {
                    var jobName = context.Request.Query["job"].ToString();
                    var group = context.Request.Query["group"].ToString();
                    await _scheduler.PauseJob(new JobKey(jobName, group));
                    await _scheduler.PauseTrigger(new TriggerKey(jobName, group));
                    Console.WriteLine($"{DateTime.Now}: Paused {jobName} {group}");
                    await context.WriteSuccessRespAsync(_defaultResponse);
                }
                else if (path == "/resume" && context.Request.Method == WebRequestMethods.Http.Post)
                {
                    var jobName = context.Request.Query["job"].ToString();
                    var group = context.Request.Query["group"].ToString();
                    await _scheduler.ResumeJob(new JobKey(jobName, group));
                    await _scheduler.ResumeTrigger(new TriggerKey(jobName, group));
                    Console.WriteLine($"{DateTime.Now}: Resumed {jobName} {group}");
                    await context.WriteSuccessRespAsync(_defaultResponse);
                }
                else if (path == "/delete" && context.Request.Method == WebRequestMethods.Http.Post)
                {
                    var jobName = context.Request.Query["job"].ToString();
                    var group = context.Request.Query["group"].ToString();
                    _ = await _scheduler.DeleteJob(new JobKey(jobName, group));
                    Console.WriteLine($"{DateTime.Now}: Deleted {jobName} {group}");
                    await context.WriteSuccessRespAsync(_defaultResponse);
                }
                else if (path == "/reset" && context.Request.Method == WebRequestMethods.Http.Post)
                {
                    await ShutdownScheduler();
                    _ = await _fw.Reinitialize();
                    await InitScheduler();
                    Console.WriteLine($"{DateTime.Now}: Reset");
                    await context.WriteSuccessRespAsync(_defaultResponse);
                }
                else if (path == "/trigger" && context.Request.Method == WebRequestMethods.Http.Post)
                {
                    var jobName = context.Request.Query["job"].ToString();
                    var group = context.Request.Query["group"].ToString();
                    var jobKey = new JobKey(jobName, group);
                    var jobDetail = await _scheduler.GetJobDetail(jobKey);
                    var activeJobs = (await _scheduler.GetCurrentlyExecutingJobs()).Select(jec => jec.JobDetail);
                    if (activeJobs.Contains(jobDetail))
                    {
                        await context.WriteFailureRespAsync(JsonSerializer.Serialize(new { result = "failure", message = "Job is already running." }));
                    }
                    else
                    {
                        var existingTrigger = (await _scheduler.GetTriggersOfJob(jobKey)).First();
                        await _scheduler.TriggerJob(jobKey, existingTrigger.JobDataMap);
                        Console.WriteLine($"{DateTime.Now}: Triggered {jobName} {group}");
                        await context.WriteSuccessRespAsync(_defaultResponse);
                    }
                }
                else if (path == "/crontester" && context.Request.Method == WebRequestMethods.Http.Post)
                {
                    var expression = context.Request.Query["cron_expression"].ToString();

                    try
                    {
                        var cron = new CronExpression(expression);

                        var next5 = new List<DateTimeOffset>();

                        var current = DateTimeOffset.Now;
                        for (var i = 0; i < 5; i++)
                        {
                            var next = cron.GetNextValidTimeAfter(current);
                            next5.Add(next.Value);
                            current = next.Value;
                        }

                        await context.WriteSuccessRespAsync(JsonSerializer.Serialize(new { result = "success", trigger_times = next5 }));
                    }
                    catch (FormatException fex)
                    {
                        await context.WriteFailureRespAsync(JsonSerializer.Serialize(new { result = "failure", message = fex.Message }));
                    }
                }
                else
                {
                    context.Response.StatusCode = StatusCodes.Status404NotFound;
                }
            }
            catch (Exception e)
            {
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                var message = $"Caught exception processing request: {e.Message} : {e.UnwrapForLog()}";
                await _fw.Error(nameof(ProcessRequest), message);
                throw;
            }
        }

        private readonly string _defaultResponse = JsonSerializer.Serialize(new { result = "success" });

        private async Task GetStatus(HttpContext context)
        {
            var jobGroups = await _scheduler.GetJobGroupNames();

            var activeJobs = (await _scheduler.GetCurrentlyExecutingJobs()).Select(jec => jec.JobDetail);

            var jobs = new List<IDictionary<string, object>>();
            foreach (var group in jobGroups)
            {
                var groupMatcher = GroupMatcher<JobKey>.GroupEquals(group);
                var jobKeys = await _scheduler.GetJobKeys(groupMatcher);
                foreach (var jobKey in jobKeys)
                {
                    var detail = await _scheduler.GetJobDetail(jobKey);
                    var triggers = await _scheduler.GetTriggersOfJob(jobKey);
                    foreach (var trigger in triggers)
                    {
                        var triggerState = await _scheduler.GetTriggerState(trigger.Key);
                        var triggerFrequency = trigger.JobDataMap.GetString("TriggerFrequency");
                        var cron = trigger.JobDataMap.GetString("Cron");

                        var job = new Dictionary<string, object>
                        {
                            {"group", group},
                            {"name", jobKey.Name},
                            {"description", detail.Description},
                            {"triggerFrequency", triggerFrequency },
                            {"cron", cron },
                            {"currentlyRunning", activeJobs.Contains(detail)},
                            {"triggerName", trigger.Key.Name},
                            {"triggerGroup", trigger.Key.Group},
                            {"triggerType", trigger.GetType().Name},
                            {"triggerState", triggerState.ToString()}
                        };

                        var nextFireTime = trigger.GetNextFireTimeUtc();
                        if (nextFireTime.HasValue)
                        {
                            job.Add("nextFireTime", nextFireTime.Value.LocalDateTime);
                        }

                        var previousFireTime = trigger.GetPreviousFireTimeUtc();
                        if (previousFireTime.HasValue)
                        {
                            job.Add("previousFireTime", previousFireTime.Value.LocalDateTime);
                        }

                        jobs.Add(job);
                    }
                }
            }

            var result = new Dictionary<string, object>
            {
                ["jobs"] = jobs
            };
            context.Response.ContentType = "application/json";
            var json = JsonSerializer.Serialize(result);
            await context.Response.WriteAsync(json);
        }

        public Task Reinitialize() => Task.CompletedTask;
    }
}
