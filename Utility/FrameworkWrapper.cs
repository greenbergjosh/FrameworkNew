using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Utility.DataLayer;
using Utility.EDW.Logging;
using Utility.EDW.Queueing;
using Utility.EDW.Reporting;
using Utility.GenericEntity;

namespace Utility
{

    public class FrameworkWrapper
    {
        public string[] ConfigurationKeys;
        public ConfigEntityRepo Entities;
        public RoslynWrapper RoslynWrapper;
        public IGenericEntity StartupConfiguration;
        public EdwSiloLoadBalancedWriter EdwWriter;
        public PostingQueueSiloLoadBalancedWriter PostingQueueWriter;
        public ErrorSiloLoadBalancedWriter ErrorWriter;
        public ErrorDelegate Err;
        public delegate Task ErrorDelegate(int severity, string method, string descriptor, string message);
        public bool TraceLogging = true;
        public bool TraceToConsole = false;

        public FrameworkWrapper(string[] commandLineArgs = null)
        {
            try
            {
                var configuration = new ConfigurationBuilder()
                            .SetBasePath(Directory.GetCurrentDirectory())
                            .AddJsonFile("appsettings.json")
                            .Build();

                ConfigurationKeys = configuration.GetSection("Application:Instance").GetChildren().Select(c => c.Value).ToArray();

                if (!ConfigurationKeys.Any())
                {
                    ConfigurationKeys = new[] { configuration.GetValue<string>("Application:Instance") };
                }

                StartupConfiguration = Data.Initialize(
                    configuration.GetValue<string>("ConnectionString:ConnectionString"),
                    configuration.GetValue<string>("ConnectionString:DataLayerType"),
                    ConfigurationKeys,
                    configuration.GetValue<string>("ConnectionString:DataLayer:SelectConfigFunction"),
                    commandLineArgs)
                    .GetAwaiter().GetResult();

                Entities = new ConfigEntityRepo(Data.GlobalConfigConnName);
                var scripts = new List<ScriptDescriptor>();
                var scriptsPath = StartupConfiguration.GetS("Config/RoslynScriptsPath");

                // Yes, GetB can be used to pull a boolean, but that defaults to false
                TraceLogging = StartupConfiguration.GetS("Config/EnableTraceLogging").ParseBool() ?? true;
                TraceToConsole = StartupConfiguration.GetB("Config/TraceToConsole");

                if (!scriptsPath.IsNullOrWhitespace())
                {
                    RoslynWrapper = new RoslynWrapper(scripts, Path.GetFullPath(Path.Combine(scriptsPath, "debug")));
                }

                EdwWriter = EdwSiloLoadBalancedWriter.InitializeEdwSiloLoadBalancedWriter(StartupConfiguration);
                PostingQueueWriter = PostingQueueSiloLoadBalancedWriter.InitializePostingQueueSiloLoadBalancedWriter(StartupConfiguration);
                ErrorWriter = ErrorSiloLoadBalancedWriter.InitializeErrorSiloLoadBalancedWriter(StartupConfiguration);
                var appName = StartupConfiguration.GetS("Config/ErrorLogAppName") ?? ConfigurationKeys.Join("::");

                Err =
                    async (int severity, string method, string descriptor, string message) =>
                    {
#if DEBUG
                        Debug.WriteLine($"{DateTime.Now}: {method} {descriptor} {message}");
#endif

                        if (TraceToConsole) Console.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss}\t{severity}\t{descriptor}\t{method}\t{message}");

                        if (!TraceLogging && descriptor == ErrorDescriptor.Trace)
                        {
                            return;
                        }

                        await ErrorWriter.Write(new ErrorLogError(severity, appName, method, descriptor, message));
                    };
            }
            catch (Exception ex)
            {
                File.AppendAllText($"FrameworkStartupError-{DateTime.Now:yyyyMMddHHmmss}", $@"{DateTime.Now}::{ex.UnwrapForLog()}" + Environment.NewLine);
                throw;
            }
        }

        public async Task<bool> ReInitialize()
        {
            var newConfig = await Data.ReInitialize(ConfigurationKeys);

            if (newConfig != null)
            {
                StartupConfiguration = newConfig;

                return true;
            }

            return false;
        }

        public string LogMethodPrefix { get; set; } = "";

        public Task Log(string method, string message) => Err(ErrorSeverity.Log, LogMethodPrefix + method, ErrorDescriptor.Log, message);
        public Task Trace(string method, string message) => Err(ErrorSeverity.Log, LogMethodPrefix + method, ErrorDescriptor.Trace, message);
        public Task Error(string method, string message) => Err(ErrorSeverity.Error, LogMethodPrefix + method, ErrorDescriptor.Exception, message);
        public Task Fatal(string method, string message) => Err(ErrorSeverity.Fatal, LogMethodPrefix + method, ErrorDescriptor.Fatal, message);

        public Task Alert(string method, string label, string message, int severity = ErrorSeverity.Log) => Alert(LogMethodPrefix + method, new EmailAlertPayload(new[] { new EmailAlertPayloadItem(label, message) }));
        public Task Alert(string method, EmailAlertPayload payload, int severity = ErrorSeverity.Log) => Err(severity, LogMethodPrefix + method, ErrorDescriptor.EmailAlert, JsonConvert.SerializeObject(payload));
    }

}
