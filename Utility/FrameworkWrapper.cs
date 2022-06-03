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
using Utility.Entity;
using Utility.Entity.Implementations;
using Utility.Evaluatable;
using Utility.Evaluatable.CodeProviders;
using Utility.Evaluatable.MemoryProviders;

namespace Utility
{
    public class FrameworkWrapper
    {
        public delegate Task ErrorDelegate(int severity, string method, string descriptor, string message);

        private ConfigEntityRepo _entities;

        public string[] ConfigurationKeys { get; private set; }
        private RoslynWrapper<EvaluateRequest, EvaluateResponse> RoslynWrapper { get; set; }
        public Entity.Entity StartupConfiguration { get; private set; }
        public EdwSiloLoadBalancedWriter EdwWriter { get; private set; }
        public ErrorSiloLoadBalancedWriter ErrorWriter { get; private set; }
        public ErrorDelegate Err { get; private set; }
        public bool TraceLogging { get; set; } = true;
        public bool TraceToConsole { get; private set; } = false;
        public IDistributedCache Cache { get; private set; }
        public Entity.Entity Entity { get; private set; }
        public Evaluator Evaluator { get; private set; }

        public static async Task<FrameworkWrapper> Create(EntityConfig entityConfig = null, EvaluatorConfig evaluatorConfig = null, string[] commandLineArgs = null, IDistributedCache cache = null)
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

                var evalProviders = new Dictionary<string, IEvalProvider>()
                {
                    ["Constant"] = new ConstantEvalProvider(),
                    ["Pfa"] = new PfaEvalProvider(),
                    ["Static"] = new StaticCSharpEvalProvider()
                };

                evaluatorConfig ??= new EvaluatorConfig(memoryProvider: new InMemoryJsonSerializedMemoryProvider(), evalProviders: evalProviders, defaultEvalProvider: evalProviders["Constant"]);
                fw.Evaluator = Evaluator.Create(evaluatorConfig);

                static string UnescapeQueryString(Uri uri) => Uri.UnescapeDataString(uri.Query.TrimStart('?'));

                fw.Entity = Utility.Entity.Entity.Initialize(new EntityConfig
                (
                    Evaluator: fw.Evaluator,
                    Parser: (entity, contentType, content) => contentType switch
                    {
                        "application/json" => EntityDocumentJson.Parse(content),
                        _ => entityConfig?.Parser == null ? throw new InvalidOperationException($"Unknown contentType: {contentType}") : entityConfig.Parser(entity, contentType, content)
                    },
                    Retriever: async (entity, uri) => uri.Scheme switch
                    {
                        "config" => (new[] { await fw._entities.GetEntity(Guid.Parse(uri.Host)) }, UnescapeQueryString(uri)),
                        _ => entityConfig?.Retriever == null ? throw new InvalidOperationException($"Unknown scheme: {uri.Scheme}") : await entityConfig.Retriever(entity, uri)
                    },
                   MissingPropertyHandler: entityConfig?.MissingPropertyHandler,
                   FunctionHandler: entityConfig?.FunctionHandler
                ));

                fw.StartupConfiguration = await Data.Initialize(
                    fw.Entity,
                    configuration.GetValue<string>("ConnectionString:ConnectionString"),
                    configuration.GetValue<string>("ConnectionString:DataLayerType"),
                    fw.ConfigurationKeys,
                    configuration.GetValue<string>("ConnectionString:DataLayer:SelectConfigFunction"),
                    commandLineArgs);

                fw._entities = new ConfigEntityRepo(fw.Entity, Data.GlobalConfigConnName);
                var scriptsPath = await fw.StartupConfiguration.EvalS("RoslynScriptsPath", null);

                fw.TraceLogging = await fw.StartupConfiguration.EvalB("EnableTraceLogging", true);
                fw.TraceToConsole = (await fw.StartupConfiguration.EvalB("TraceToConsole", false)) || Debugger.IsAttached;

                if (!scriptsPath.IsNullOrWhitespace())
                {
                    fw.RoslynWrapper = new RoslynWrapper<EvaluateRequest, EvaluateResponse>(Path.GetFullPath(Path.Combine(scriptsPath, "debug")));
                    evalProviders["Dynamic"] = new DynamicCSharpEvalProvider(fw.RoslynWrapper);
                }

                fw.EdwWriter = await EdwSiloLoadBalancedWriter.InitializeEdwSiloLoadBalancedWriter(fw.StartupConfiguration);
                fw.ErrorWriter = await ErrorSiloLoadBalancedWriter.InitializeErrorSiloLoadBalancedWriter(fw.StartupConfiguration);

                var appName = await fw.StartupConfiguration.EvalS("AppName");

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

                _entities = new ConfigEntityRepo(Entity, Data.GlobalConfigConnName);

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

        public async Task<Entity.Entity> EvaluateEntity(Guid entityId, Entity.Entity parameters = null)
        {
            var evaluatableId = entityId;

            var entity = await _entities.GetEntity(entityId);
            var evaluatableEntity = entity;

            var stackedParameters = new EntityDocumentStack();

            var implementation = await entity.EvalS("Evaluate.EntityId", defaultValue: null);
            if (!string.IsNullOrWhiteSpace(implementation))
            {
                evaluatableId = Guid.Parse(implementation);
                evaluatableEntity = await _entities.GetEntity(evaluatableId);
                stackedParameters.Push(await entity.EvalE("Evaluate.ActualParameters"));
            }

            if (await evaluatableEntity.EvalS("$meta.type") != "LBM.CS")
            {
                throw new InvalidOperationException($"Only entities of type LBM.CS are supported, {entityId} has type {await evaluatableEntity.EvalS("$meta.type")}");
            }

            if (parameters != null)
            {
                stackedParameters.Push(parameters);
            }

            var evaluationParameters = Entity.Create(new
            {
                fw = this,
                parameters = stackedParameters
            });

            var result = await RoslynWrapper.Evaluate(evaluatableId, await evaluatableEntity.EvalS("Code"), new EvaluateRequest(Entity: entity, Parameters: evaluationParameters));

            return result.Entity;
        }

        public async Task<Entity.Entity> EvaluateEntity(string code, Entity.Entity parameters = null)
        {
            var evaluationParameters = Entity.Create(new
            {
                fw = this,
                parameters
            });

            var result = await RoslynWrapper.Evaluate(code, new EvaluateRequest(Entity: Entity.Create<object>(null), Parameters: evaluationParameters));

            return result.Entity;
        }
    }
}