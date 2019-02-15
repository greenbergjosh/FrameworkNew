using System;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Utility
{

    public class FrameworkWrapper
    {
        public string[] ConfigurationKeys;
        public string SelectConfigSproc;
        public DataLayerClient RootDataLayerClient;
        public ConfigEntityRepo Entities;
        public RoslynWrapper RoslynWrapper;
        public IGenericEntity StartupConfiguration;
        public EdwSiloLoadBalancedWriter EdwWriter;
        public PostingQueueSiloLoadBalancedWriter PostingQueueWriter;
        public ErrorSiloLoadBalancedWriter ErrorWriter;
        public ErrorDelegate Err;
        public delegate Task ErrorDelegate(int severity, string method, string descriptor, string message);

        public FrameworkWrapper()
        {
            try
            {
                IConfigurationRoot configuration = new ConfigurationBuilder()
                            .SetBasePath(Directory.GetCurrentDirectory())
                            .AddJsonFile("appsettings.json")
                            .Build();
                this.RootDataLayerClient = DataLayerClientFactory.DataStoreInstance(configuration.GetValue<String>("ConnectionString:DataLayerType"));
                this.ConfigurationKeys = configuration.GetSection("Application:Instance").GetChildren().Select(c => c.Value).ToArray();

                if (!ConfigurationKeys.Any()) ConfigurationKeys = new[] { configuration.GetValue<string>("Application:Instance") };

                this.SelectConfigSproc = configuration.GetValue<String>("Application:SelectConfigSproc");

                this.StartupConfiguration = RootDataLayerClient.Initialize(
                    configuration.GetValue<String>("ConnectionString:ConnectionString"),
                    this.ConfigurationKeys,
                    configuration.GetValue<String>("ConnectionString:DataLayer:SelectConfigFunction")
                ).GetAwaiter().GetResult();
                this.Entities = new ConfigEntityRepo(RootDataLayerClient.GlobalConfig);
                List<ScriptDescriptor> scripts = new List<ScriptDescriptor>();
                string scriptsPath = Path.GetFullPath(this.StartupConfiguration.GetS("Config/RoslynScriptsPath"));
                this.RoslynWrapper = new RoslynWrapper(scripts, $@"{scriptsPath}\\debug");

                this.EdwWriter = EdwSiloLoadBalancedWriter.InitializeEdwSiloLoadBalancedWriter(this.StartupConfiguration);
                this.PostingQueueWriter = PostingQueueSiloLoadBalancedWriter.InitializePostingQueueSiloLoadBalancedWriter(this.StartupConfiguration);
                this.ErrorWriter = ErrorSiloLoadBalancedWriter.InitializeErrorSiloLoadBalancedWriter(this.StartupConfiguration);
                string appName = this.StartupConfiguration.GetS("Config/ErrorLogAppName") ?? this.ConfigurationKeys.Join("::");

                this.Err =
                    async (int severity, string method, string descriptor, string message) =>
                    {
                        await this.ErrorWriter.Write(new ErrorLogError(severity, appName, method, descriptor, message));
                    };
            }
            catch (Exception ex)
            {
                File.AppendAllText("FrameworkStartupError-" + DateTime.Now.ToString("yyyyMMddHHmmss"),
                    $@"{DateTime.Now}::{ex.ToString()}" + Environment.NewLine);
                throw;
            }
        }

        public async Task Log(string method, string message) => await Err(ErrorSeverity.Log, method, ErrorDescriptor.Log, message);
        public async Task Trace(string method, string message) => await Err(ErrorSeverity.Log, method, ErrorDescriptor.Trace, message);
        public async Task Error(string method, string message) => await Err(ErrorSeverity.Error, method, ErrorDescriptor.Exception, message);
        public async Task Fatal(string method, string message) => await Err(ErrorSeverity.Fatal, method, ErrorDescriptor.Fatal, message);

        public async Task Alert(string method, string label, string message, int severity = ErrorSeverity.Log)
        {
            await Alert(method, new EmailAlertPayload(new[] { new EmailAlertPayloadItem(label, message) }));
        }

        public async Task Alert(string method, EmailAlertPayload payload, int severity = ErrorSeverity.Log)
        {
            await Err(severity, method, ErrorDescriptor.Log, JsonConvert.SerializeObject(payload));
        }
    }

}
