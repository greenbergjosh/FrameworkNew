using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Utility;

namespace GenericDataService
{
    public class Startup
    {
        public string ConnectionString;
        public string ConfigurationKey;
        public dynamic DataService;
        public IGenericEntity Configuration;

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials());
            });

            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => false;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });
        }

        public void UnobservedTaskExceptionEventHandler(object obj, UnobservedTaskExceptionEventArgs args)
        {
            File.AppendAllText("DataService.log", $@"{DateTime.Now}::{args.ToString()}::{args.ToString()}" +
                            Environment.NewLine);
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseStaticFiles();
            app.UseCors("CorsPolicy");

            try
            {
                TaskScheduler.UnobservedTaskException +=
                    new EventHandler<UnobservedTaskExceptionEventArgs>(UnobservedTaskExceptionEventHandler);

                IConfigurationRoot configuration = new ConfigurationBuilder()
                            .SetBasePath(Directory.GetCurrentDirectory())
                            .AddJsonFile("appsettings.json")
                            .Build();
                this.ConnectionString = configuration.GetConnectionString("DefaultConnection");
                this.ConfigurationKey = configuration.GetValue<String>("Application:Instance");

                this.Configuration = SqlWrapper.Initialize(this.ConnectionString, this.ConfigurationKey).GetAwaiter().GetResult();

                EdwSiloLoadBalancedWriter siloWriter = InitializeEdwSiloLoadBalancedWriter();
                InitiateSiloEventWriters(siloWriter, 5, 1000).ConfigureAwait(false).GetAwaiter().GetResult();

                using (var dynamicContext = new Utility.AssemblyResolver(this.Configuration.GetS("Config/DataServiceAssemblyFilePath")))
                {
                    this.DataService = dynamicContext.Assembly.CreateInstance(this.Configuration.GetS("Config/DataServiceTypeName"));
                }

                DataService.Config(this.Configuration);
            }
            catch (Exception ex)
            {
                File.AppendAllText(this.Configuration.GetS("Config/DataServiceLogFileName"), 
                    $@"{DateTime.Now}::{ex.ToString()}" + Environment.NewLine);
            }

            app.Run(async (context) =>
            {
                await DataService.Start(context);
            });
        }

        public EdwSiloLoadBalancedWriter InitializeEdwSiloLoadBalancedWriter()
        {
            return new EdwSiloLoadBalancedWriter(60,
            async (object w, int timeoutSeconds) => await EdwSiloLoadBalancedWriter.InitiateWalkaway(w, timeoutSeconds)
                    .ConfigureAwait(false),
            (int previousValue) => EdwSiloLoadBalancedWriter.NextWalkawayValue(previousValue),
            (ConcurrentDictionary<IEndpoint, Tuple<bool, int>> endpoints, List<IEndpoint> alreadyChosen) =>
                EdwSiloLoadBalancedWriter.Selector(endpoints, alreadyChosen),
            async (object w) => await EdwSiloLoadBalancedWriter.NoValid(w).ConfigureAwait(false),
            async (object w) => await EdwSiloLoadBalancedWriter.Failure(w).ConfigureAwait(false),
            async (object w, Exception ex) => await EdwSiloLoadBalancedWriter.Unhandled(w, ex).ConfigureAwait(false)
            );
        }

        public static async Task InitiateSiloEventWriters(EdwSiloLoadBalancedWriter siloWriter, int writerCount, int numEvents)
        {
            var tasks = new List<Task>();

            for (int i = 0; i < writerCount; i++)
            {
                tasks.Add(SiloEventWriter(siloWriter, numEvents));
            }

            await Task.WhenAll(tasks).ConfigureAwait(false);
        }

        public static async Task SiloEventWriter(EdwSiloLoadBalancedWriter siloWriter, int numEvents)
        {
            for (int i = 0; i < numEvents; i++)
            {
                await siloWriter.Write("{\"TestAction\": \"Success\", \"V\": \"" + i + "\"}", 1)
                    .ConfigureAwait(false);
                await Task.Delay(100).ConfigureAwait(false);
            }
        }

        public void JunkHolder()
        {
            //try
            //{
            //    //EdwSiloEndpoint.ExecuteSql("{\"TestAction\": \"Walkaway\"}", "[dbo].[spCreateTestRecord]", silo1, 3)
            //    //    .ConfigureAwait(true).GetAwaiter().GetResult();
            //    string s = "123456789012345678901234567890123456789012345678901234567890";
            //    s = s + "123456789012345678901234567890123456789012345678901234567890";
            //    EdwSiloEndpoint.ExecuteSql("{\"TestAction\": \"Success\", \"V\": \"" + s + "\"}", "[dbo].[spCreateTestRecord]", silo1, 3)
            //        .ConfigureAwait(true).GetAwaiter().GetResult();
            //}
            //catch (Exception ex)
            //{
            //    int hij = 1;
            //}

            //for (int i = 0; i < 20; i++)
            //{
            //    await siloWriter.Write("{\"TestAction\": \"Success\", \"V\": \"" + i + "\"}", 10);
            //}

            //await siloWriter.Write("{\"TestAction\": \"RemoveEndpoint\"}", 10);

            //for (int i = 20; i < 40; i++)
            //{
            //    await siloWriter.Write("{\"TestAction\": \"Success\", \"V\": \"" + i + "\"}", 10);
            //}
        }
    }
}
