using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;

namespace DummyServiceDataLib
{
    public class DataService
    {
        private FrameworkWrapper _fw = null;
        private Stopwatch _stopwatch = new Stopwatch();
        private Dictionary<string, (Guid id, IGenericEntity config)> _lbmMaps;

        public void Config(FrameworkWrapper fw)
        {
            try
            {
                _fw = fw;
                _stopwatch.Start();
                Initialize().GetAwaiter().GetResult();
            }
            catch (Exception ex)
            {
                _fw?.Error(nameof(Config), ex.UnwrapForLog());
                throw;
            }
        }

        public void ReInitialize()
        {
            _fw.RoslynWrapper.functions.Clear();
            Initialize().GetAwaiter().GetResult();
        }

        public async Task Run(HttpContext context)
        {
            var start = _stopwatch.ElapsedMilliseconds;

            var requestId = Guid.NewGuid().ToString();

            string requestBody = null;

            context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
            context.Response.Headers.Add("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            context.Response.Headers.Add("Access-Control-Allow-Credentials", "true");

            try
            {
                requestBody = await context.GetRawBodyStringAsync();

                await _fw.Trace(nameof(Run), JsonConvert.SerializeObject(new { requestId, requestBody, stage = "start" }));

                var method = context.Request.Query["m"].FirstOrDefault();

                if (method == "data")
                {
                    await Data.CallFn("config", "_selectConf", JsonConvert.SerializeObject(new { InstanceId = "a39d12d6-2201-4879-8730-cd47768df901" }));
                }
                else if (method == "lbm")
                {
                    var map = _lbmMaps["TestLbm"];
                    await _fw.RoslynWrapper.RunFunction(map.id.ToString(), new { _httpContext = context, _payload = !string.IsNullOrWhiteSpace(requestBody) ? JsonWrapper.JsonToGenericEntity(requestBody) : new GenericEntityJson(), _fw, _lbmConfig = map.config }, new StateWrapper());
                }

                await context.WriteSuccessRespAsync(JsonConvert.SerializeObject(new { requestId, elapsed = _stopwatch.ElapsedMilliseconds - start }));

                await _fw.Trace(nameof(Run), JsonConvert.SerializeObject(new { requestId, requestBody, stage = "end", elapsed = _stopwatch.ElapsedMilliseconds - start }));
            }
            catch (Exception e)
            {
                await _fw.Error(nameof(Run), $"Unhandled exception: { context.Ip()} Path: { context.Request.Path} UserAgent: { context.UserAgent()} { e.UnwrapForLog()}\r\n{requestBody.IfNullOrWhitespace("[null]")}");
                throw;
            }
        }

        private async Task Initialize()
        {
            var maps = new Dictionary<string, (Guid id, IGenericEntity config)>();

            foreach (var map in _fw.StartupConfiguration.GetD("Config/LBMs"))
            {
                var id = map.Item2.ParseGuid();

                if (!id.HasValue) continue;

                var lbm = await _fw.Entities.GetEntity(id.Value);

                if (lbm == null)
                {
                    await _fw.Error($"{nameof(Initialize)}", $"LBM not found {map.Item1} ({id})");
                    continue;
                }

                var codeId = lbm?.GetS("Config/LbmId").ParseGuid();

                if (!codeId.HasValue)
                {
                    await _fw.Error($"{nameof(Initialize)}", $"LBM code not found {map.Item1} ({id})\nLBM:\n{lbm?.GetS("")}");
                    continue;
                }

                var code = await _fw.Entities.GetEntity(codeId.Value);

                if (code?.GetS("Type") != "LBM.CS")
                {
                    await _fw.Error($"{nameof(Initialize)}", $"{code?.GetS("Type")} LBM not supported. {map.Item1} ({id})\nLBM:\n{lbm.GetS("")}");
                    continue;
                }
                var (debug, debugDir) = _fw.RoslynWrapper.GetDefaultDebugValues();

                try
                {
                    _fw.RoslynWrapper.CompileAndCache(new ScriptDescriptor(id, id.Value.ToString(), code.GetS("Config"), debug, debugDir), true);
                }
                catch (Exception e)
                {
                    await _fw.Error($"{nameof(Initialize)}", $"Failed to compile. {map.Item1} ({id})\nLBM:\n{lbm.GetS("")}\nCode:\n{code.GetS("")}\n\n{e.UnwrapForLog()}");
                    continue;
                }

                maps.Add(map.Item1, (id.Value, lbm));
            }

            _lbmMaps = maps;
        }
    }
}
