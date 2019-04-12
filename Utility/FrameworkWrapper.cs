using System;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Utility.DataLayer;

namespace Utility
{

    public class FrameworkWrapper
    {
        public string[] ConfigurationKeys;
        public string SelectConfigSproc;
        public ConfigEntityRepo Entities;
        public RoslynWrapper RoslynWrapper;
        public IGenericEntity StartupConfiguration;
        public EdwSiloLoadBalancedWriter EdwWriter;
        public PostingQueueSiloLoadBalancedWriter PostingQueueWriter;
        public ErrorSiloLoadBalancedWriter ErrorWriter;
        public ErrorDelegate Err;
        public delegate Task ErrorDelegate(int severity, string method, string descriptor, string message);
        public bool TraceLogging = true;

        public FrameworkWrapper(string[] commandLineArgs = null)
        {
            try
            {
                var configuration = new ConfigurationBuilder()
                            .SetBasePath(Directory.GetCurrentDirectory())
                            .AddJsonFile("appsettings.json")
                            .Build();

                ConfigurationKeys = configuration.GetSection("Application:Instance").GetChildren().Select(c => c.Value).ToArray();

                if (!ConfigurationKeys.Any()) ConfigurationKeys = new[] { configuration.GetValue<string>("Application:Instance") };

                StartupConfiguration = Data.Initialize(
                    configuration.GetValue<string>("ConnectionString:ConnectionString"),
                    configuration.GetValue<string>("ConnectionString:DataLayerType"),
                    ConfigurationKeys,
                    configuration.GetValue<string>("ConnectionString:DataLayer:SelectConfigFunction"),
                    commandLineArgs)
                    .GetAwaiter().GetResult();

                SelectConfigSproc = configuration.GetValue<string>("Application:SelectConfigSproc");

                Entities = new ConfigEntityRepo(Data.GlobalConfigConnName);
                var scripts = new List<ScriptDescriptor>();
                var scriptsPath = StartupConfiguration.GetS("Config/RoslynScriptsPath");
                this.TraceLogging = StartupConfiguration.GetB("Config/EnableTraceLogging");

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
                        if(!TraceLogging && descriptor == ErrorDescriptor.Trace) return;
                        await ErrorWriter.Write(new ErrorLogError(severity, appName, method, descriptor, message));
                    };
            }
            catch (Exception ex)
            {
                File.AppendAllText($"FrameworkStartupError-{DateTime.Now:yyyyMMddHHmmss}", $@"{DateTime.Now}::{ex.UnwrapForLog()}" + Environment.NewLine);
                throw;
            }
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
