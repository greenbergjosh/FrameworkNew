using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Utility.DataLayer;
using Utility.EDW.Logging;
using Utility.EDW.Reporting;
using Utility.Entity.Implementations;

namespace Utility
{
    public class FrameworkWrapper
    {
        public delegate Task ErrorDelegate(int severity, string method, string descriptor, string message);

        public string[] ConfigurationKeys { get; private set; }
        public ConfigEntityRepo Entities { get; private set; }
        private RoslynWrapper RoslynWrapper { get; set; }
        public Entity.Entity StartupConfiguration { get; private set; }
        public EdwSiloLoadBalancedWriter EdwWriter { get; private set; }
        public ErrorSiloLoadBalancedWriter ErrorWriter { get; private set; }
        public ErrorDelegate Err { get; private set; }
        public bool TraceLogging { get; set; } = true;
        public bool TraceToConsole { get; private set; } = false;
        public IDistributedCache Cache { get; private set; }
        public Entity.Entity Entity { get; private set; }

        public static async Task<FrameworkWrapper> Create(string[] commandLineArgs = null, IDistributedCache cache = null)
        {
            try
            {
                var fw = new FrameworkWrapper
                {
                    Cache = cache
                };

                var configuration = new ConfigurationBuilder()
                            .SetBasePath(Directory.GetCurrentDirectory())
                            .AddJsonFile("appsettings.json")
                            .Build();

                fw.ConfigurationKeys = configuration.GetSection("Application:Instance").GetChildren().Select(c => c.Value).ToArray();

                if (!fw.ConfigurationKeys.Any())
                {
                    fw.ConfigurationKeys = new[] { configuration.GetValue<string>("Application:Instance") };
                }

                static string UnescapeQueryString(Uri uri) => Uri.UnescapeDataString(uri.Query.TrimStart('?'));

                fw.Entity = Utility.Entity.Entity.Initialize(new Entity.EntityConfig
                (
                    Parser: (entity, contentType, content) => contentType switch
                    {
                        "application/json" => EntityDocumentJson.Parse(content),
                        _ => throw new InvalidOperationException($"Unknown contentType: {contentType}")
                    },
                    Retriever: async (entity, uri) => uri.Scheme switch
                    {
                        "config" => (new[] { await fw.Entities.GetEntity(Guid.Parse(uri.Host)) }, UnescapeQueryString(uri)),
                        _ => throw new InvalidOperationException($"Unknown scheme: {uri.Scheme}")
                    }
                ));

                fw.StartupConfiguration = await Data.Initialize(
                    fw.Entity,
                    configuration.GetValue<string>("ConnectionString:ConnectionString"),
                    configuration.GetValue<string>("ConnectionString:DataLayerType"),
                    fw.ConfigurationKeys,
                    configuration.GetValue<string>("ConnectionString:DataLayer:SelectConfigFunction"),
                    commandLineArgs);

                fw.Entities = new ConfigEntityRepo(fw.Entity, Data.GlobalConfigConnName);
                var scriptsPath = await fw.StartupConfiguration.GetS("RoslynScriptsPath");

                fw.TraceLogging = await fw.StartupConfiguration.GetB("EnableTraceLogging", true);
                fw.TraceToConsole = (await fw.StartupConfiguration.GetB("TraceToConsole", false)) || Debugger.IsAttached;

                if (!scriptsPath.IsNullOrWhitespace())
                {
                    fw.RoslynWrapper = new RoslynWrapper(Path.GetFullPath(Path.Combine(scriptsPath, "debug")));
                }

                fw.EdwWriter = await EdwSiloLoadBalancedWriter.InitializeEdwSiloLoadBalancedWriter(fw.StartupConfiguration);
                fw.ErrorWriter = await ErrorSiloLoadBalancedWriter.InitializeErrorSiloLoadBalancedWriter(fw.StartupConfiguration);

                var appName = await fw.StartupConfiguration.GetS("ErrorLogAppName", fw.ConfigurationKeys.Join("::"));

                fw.Err =
                    async (int severity, string method, string descriptor, string message) =>
                    {
#if DEBUG
                        Debug.WriteLine($"{DateTime.Now}: {method} {descriptor} {message}");
#endif

                        if (fw.TraceToConsole)
                        {
                            Console.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss}\t{severity}\t{descriptor}\t{method}\t{message}");
                        }

                        if (!fw.TraceLogging && descriptor == ErrorDescriptor.Trace)
                        {
                            return;
                        }

                        await fw.ErrorWriter.Write(new ErrorLogError(severity, appName, method, descriptor, message));
                    };

                return fw;
            }
            catch (Exception ex)
            {
                File.AppendAllText($"FrameworkStartupError-{DateTime.Now:yyyyMMddHHmmss}", $@"{DateTime.Now}::{ex.UnwrapForLog()}" + Environment.NewLine);
                throw;
            }
        }

        private FrameworkWrapper()
        {
        }

        public async Task<bool> Reinitialize()
        {
            var newConfig = await Data.Reinitialize(ConfigurationKeys);

            if (newConfig != null)
            {
                StartupConfiguration = newConfig;

                RoslynWrapper.ClearCache();

                Entities = new ConfigEntityRepo(Entity, Data.GlobalConfigConnName);

                return true;
            }

            return false;
        }

        public string LogMethodPrefix { get; set; } = "";

        public Task Log(string method, string message) => Err(ErrorSeverity.Log, LogMethodPrefix + method, ErrorDescriptor.Log, message);

        public Task Trace(string method, string message) => Err(ErrorSeverity.Log, LogMethodPrefix + method, ErrorDescriptor.Trace, message);

        public Task Error(string method, string message) => Err(ErrorSeverity.Error, LogMethodPrefix + method, ErrorDescriptor.Exception, message);

        public Task Fatal(string method, string message) => Err(ErrorSeverity.Fatal, LogMethodPrefix + method, ErrorDescriptor.Fatal, message);

        public Task Alert(string method, string label, string message, int severity = ErrorSeverity.Log) => Alert(LogMethodPrefix + method, new EmailAlertPayload(new[] { new EmailAlertPayloadItem(label, message) }), severity);

        public Task Alert(string method, EmailAlertPayload payload, int severity = ErrorSeverity.Log) => Err(severity, LogMethodPrefix + method, ErrorDescriptor.EmailAlert, JsonSerializer.Serialize(payload));

        public async Task<T> EvaluateEntity<T>(Guid entityId, Entity.Entity parameters = null)
        {
            var evaluatableId = entityId;

            var entity = await Entities.GetEntity(entityId);
            var evaluatableEntity = entity;

            var stackedParameters = new EntityDocumentStack();

            var implementation = await entity.GetS("Evaluate.EntityId", null);
            if (!string.IsNullOrWhiteSpace(implementation))
            {
                evaluatableId = Guid.Parse(implementation);
                evaluatableEntity = await Entities.GetEntity(evaluatableId);
                stackedParameters.Push(await entity.GetE("Evaluate.ActualParameters"));
            }

            if (await evaluatableEntity.GetS("$meta.type") != "LBM.CS")
            {
                throw new InvalidOperationException($"Only entities of type LBM.CS are supported, {entityId} has type {await evaluatableEntity.GetS("$meta.type")}");
            }

            if (parameters != null)
            {
                stackedParameters.Push(parameters);
            }

            var evaluationParameters = new
            {
                fw = this,
                parameters = parameters.Create(stackedParameters)
            };

            var result = await RoslynWrapper.Evaluate(evaluatableId, await evaluatableEntity.GetS("Code"), evaluationParameters);

            return (T)result;
        }

        public Task EvaluateEntity(Guid entityId, Entity.Entity parameters = null) => EvaluateEntity<object>(entityId, parameters);

        public async Task<T> EvaluateEntity<T>(string code, Entity.Entity parameters = null)
        {
            var evaluationParameters = new
            {
                fw = this,
                parameters
            };

            var result = await RoslynWrapper.Evaluate(code, evaluationParameters);

            return (T)result;
        }

        public Task EvaluateEntity(string code, Entity.Entity parameters = null) => EvaluateEntity<object>(code, parameters);
    }
}