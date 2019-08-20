using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace GetGotLib
{
    public static class LbmProxy
    {
        private static FrameworkWrapper _fw;
        private static Dictionary<string, LbmMap> _lbmMaps = new Dictionary<string, LbmMap>();

        public static async Task Initialize(FrameworkWrapper fw)
        {
            _fw = fw;

            var maps = new Dictionary<string, LbmMap>();

            foreach (var map in _fw.StartupConfiguration.GetD("Config/LBMs"))
            {
                var id = map.Item2.ParseGuid();

                if (!id.HasValue) continue;

                var lbm = await _fw.Entities.GetEntity(id.Value);

                if (lbm == null)
                {
                    await _fw.Error($"{nameof(LbmProxy)}.{nameof(Initialize)}", $"LBM not found {map.Item1} ({id})");
                    continue;
                }

                var codeId = lbm?.GetS("Config/LbmId").ParseGuid();

                if (!codeId.HasValue)
                {
                    await _fw.Error($"{nameof(LbmProxy)}.{nameof(Initialize)}", $"LBM code not found {map.Item1} ({id})\nLBM:\n{lbm?.GetS("")}");
                    continue;
                }

                var code = await _fw.Entities.GetEntity(codeId.Value);

                if (code?.GetS("Type") != "LBM.CS")
                {
                    await _fw.Error($"{nameof(LbmProxy)}.{nameof(Initialize)}", $"{code?.GetS("Type")} LBM not supported. {map.Item1} ({id})\nLBM:\n{lbm.GetS("")}");
                    continue;
                }
                var (debug, debugDir) = _fw.RoslynWrapper.GetDefaultDebugValues();

                try
                {
                    _fw.RoslynWrapper.CompileAndCache(new ScriptDescriptor(id, id.Value.ToString(), code.GetS("Config"), debug, debugDir), true);
                }
                catch (Exception e)
                {
                    await _fw.Error($"{nameof(LbmProxy)}.{nameof(Initialize)}", $"Failed to compile. {map.Item1} ({id})\nLBM:\n{lbm.GetS("")}\nCode:\n{code.GetS("")}\n\n{e.UnwrapForLog()}");
                    continue;
                }

                maps.Add(map.Item1, new LbmMap(id.Value, lbm));
            }

            _lbmMaps = maps;
        }

        public static bool HasFunction(string funcName) => _lbmMaps.ContainsKey(funcName);

        public static async Task<IGenericEntity> Run(string lbmName, string payload, string identity, HttpContext ctx)
        {
            var map = _lbmMaps.GetValueOrDefault(lbmName);

            if (map == null) throw new FunctionException(100, $"LBM not configured {lbmName}");

            try
            {
                return (IGenericEntity)await _fw.RoslynWrapper.RunFunction(map.Id.ToString(), new { _httpContext = ctx, _payload = Jw.JsonToGenericEntity(payload), _fw, _lbmConfig = map.Config, _identity = identity }, new StateWrapper());
            }
            catch (Exception e)
            {
                throw new FunctionException(100, $"LBM execution failed: {lbmName} ({map.Id}) {map.Config.GetS("")}\n\n{e.UnwrapForLog()}");
            }
        }

        private class LbmMap
        {
            public LbmMap(Guid id, IGenericEntity config)
            {
                Id = id;
                Config = config;
            }

            public Guid Id { get; }
            public IGenericEntity Config { get; }

        }

    }
}
