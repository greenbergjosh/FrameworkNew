using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Utility
{

    public class FrameworkWrapper
    {
        public string ConnectionString;
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

        public FrameworkWrapper(string[] commandLineArgs = null)
        {
            try
            {
                var configuration = new ConfigurationBuilder()
                            .SetBasePath(Directory.GetCurrentDirectory())
                            .AddJsonFile("appsettings.json")
                            .Build();
                ConnectionString = configuration.GetConnectionString("DefaultConnection");
                ConfigurationKeys = configuration.GetSection("Application:Instance").GetChildren().Select(c => c.Value).ToArray();

                if (!ConfigurationKeys.Any())
                {
                    ConfigurationKeys = new[] { configuration.GetValue<string>("Application:Instance") };
                }

                SelectConfigSproc = configuration.GetValue<string>("Application:SelectConfigSproc");

                StartupConfiguration = SqlWrapper.Initialize(ConnectionString, ConfigurationKeys, SelectConfigSproc, commandLineArgs).GetAwaiter().GetResult();
                Entities = new ConfigEntityRepo(SqlWrapper.GlobalConfig);
                var scripts = new List<ScriptDescriptor>();
                var scriptsPath = StartupConfiguration.GetS("Config/RoslynScriptsPath");

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
                        await ErrorWriter.Write(new ErrorLogError(severity, appName, method, descriptor, message));
                    };
            }
            catch (Exception ex)
            {
                File.AppendAllText("FrameworkStartupError-" + DateTime.Now.ToString("yyyyMMddHHmmss"),
                    $@"{DateTime.Now}::{ex.ToString()}" + Environment.NewLine);
                throw;
            }
        }

        public Task Log(string method, string message) => Err(ErrorSeverity.Log, method, ErrorDescriptor.Log, message);
        public Task Trace(string method, string message) => Err(ErrorSeverity.Log, method, ErrorDescriptor.Trace, message);
        public Task Error(string method, string message) => Err(ErrorSeverity.Error, method, ErrorDescriptor.Exception, message);
        public Task Fatal(string method, string message) => Err(ErrorSeverity.Fatal, method, ErrorDescriptor.Fatal, message);

        public Task Alert(string method, string label, string message, int severity = ErrorSeverity.Log) => Alert(method, new EmailAlertPayload(new[] { new EmailAlertPayloadItem(label, message) }));
        public Task Alert(string method, EmailAlertPayload payload, int severity = ErrorSeverity.Log) => Err(severity, method, ErrorDescriptor.EmailAlert, JsonConvert.SerializeObject(payload));
    }

}
