using System;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Threading.Tasks;

namespace Utility
{
    public class FrameworkWrapper
    {
        public string ConnectionString;
        public string ConfigurationKey;
        public ConfigEntityRepo Entities;
        public RoslynWrapper RoslynWrapper;
        public IGenericEntity StartupConfiguration;
        public EdwSiloLoadBalancedWriter SiloWriter;
        public ErrorSiloLoadBalancedWriter ErrorWriter;
        public Func<int, string, string, string, Task> Err;

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

                this.StartupConfiguration = SqlWrapper.Initialize(this.ConnectionString, this.ConfigurationKey).GetAwaiter().GetResult();
                this.Entities = new ConfigEntityRepo(this.ConnectionString);
                List<ScriptDescriptor> scripts = new List<ScriptDescriptor>();
                string scriptsPath = this.StartupConfiguration.GetS("Config/RoslynScriptsPath");
                this.RoslynWrapper = new RoslynWrapper(scripts, $@"{scriptsPath}\\debug");

                this.SiloWriter = EdwSiloLoadBalancedWriter.InitializeEdwSiloLoadBalancedWriter(this.StartupConfiguration);
                this.ErrorWriter = ErrorSiloLoadBalancedWriter.InitializeErrorSiloLoadBalancedWriter(this.StartupConfiguration);
                string appName = this.StartupConfiguration.GetS("Config/ErrorLogAppName");
                int errTimeout = Int32.Parse(this.StartupConfiguration.GetS("Config/ErrorLogTimeout"));
                this.Err = 
                    async (int severity, string method, string descriptor, string message) =>
                    {
                        await this.ErrorWriter.Write(new ErrorLogError(severity, appName, method, descriptor, message), errTimeout);
                    };
            }
            catch (Exception ex)
            {
                File.AppendAllText("FrameworkStartupError-" + DateTime.Now.ToString(),
                    $@"{DateTime.Now}::{ex.ToString()}" + Environment.NewLine);
                throw ex;
            }
        }
    }
}
