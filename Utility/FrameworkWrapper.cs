using System;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Utility
{

    public class FrameworkWrapper
    {
        public string ConnectionString;
        public string ConfigurationKey;
        public string SelectConfigSproc;
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
                this.ConnectionString = configuration.GetConnectionString("DefaultConnection");
                this.ConfigurationKey = configuration.GetValue<String>("Application:Instance");
                this.SelectConfigSproc = configuration.GetValue<String>("Application:SelectConfigSproc");

                this.StartupConfiguration = SqlWrapper.Initialize(this.ConnectionString, this.ConfigurationKey, this.SelectConfigSproc).GetAwaiter().GetResult();
                this.Entities = new ConfigEntityRepo(SqlWrapper.GlobalConfig);
                List<ScriptDescriptor> scripts = new List<ScriptDescriptor>();
                string scriptsPath = this.StartupConfiguration.GetS("Config/RoslynScriptsPath");
                this.RoslynWrapper = new RoslynWrapper(scripts, $@"{scriptsPath}\\debug");

                this.EdwWriter = EdwSiloLoadBalancedWriter.InitializeEdwSiloLoadBalancedWriter(this.StartupConfiguration);
                this.PostingQueueWriter = PostingQueueSiloLoadBalancedWriter.InitializePostingQueueSiloLoadBalancedWriter(this.StartupConfiguration);
                this.ErrorWriter = ErrorSiloLoadBalancedWriter.InitializeErrorSiloLoadBalancedWriter(this.StartupConfiguration);
                string appName = this.StartupConfiguration.GetS("Config/ErrorLogAppName");
                int errTimeout = this.StartupConfiguration.GetS("Config/ErrorLogTimeout").ParseInt() ?? 30;
                this.Err =
                    async (int severity, string method, string descriptor, string message) =>
                    {
                        await this.ErrorWriter.Write(new ErrorLogError(severity,
                            appName ?? this.ConfigurationKey, method, descriptor, message), errTimeout);
                    };
            }
            catch (Exception ex)
            {
                File.AppendAllText("FrameworkStartupError-" + DateTime.Now.ToString("yyyyMMddHHmmss"),
                    $@"{DateTime.Now}::{ex.ToString()}" + Environment.NewLine);
                throw;
            }
        }

    }

}
