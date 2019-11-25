using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Threading.Tasks;
using Utility;
using Utility.EDW.Reporting;
using static System.Net.WebRequestMethods;

namespace EdwServiceLib
{
    public class EdwService
    {
        private FrameworkWrapper _fw;

        private readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
        private readonly Dictionary<string, Func<HttpContext, Task<object>>> _routes =
            new Dictionary<string, Func<HttpContext, Task<object>>>();

        const string SessionId = "sessionId";
        const string Name = "name";
        const string Data = "data";
        const string Type = "type";
        const string Stack = "stack";
        const string Ss = "ss";
        const string Sf = "sf";
        const string Rs = "rs";
        const string Ev = "ev";
        const string Cf = "cf";
        const string ConfigId = "configId";
        const string EventId = "eventId";
        const string KeyPrefix = "keyPrefix";
        const string SfName = "__sfName";

        public void Config(FrameworkWrapper fw)
        {
            _fw = fw;

            _routes.Add($"/{Rs}", GetOrCreateRs);
            _routes.Add($"/{Ev}", PublishEvent);
            _routes.Add($"/{Cf}", Config);
            _routes.Add($"/{Ss}", SetStackFrame);
            _routes.Add($"/{Sf}", GetOrCreateStackFrame);
        }

        public async Task Run(HttpContext context)
        {
            try
            {
                var result = await ExecuteRequest(context);
                context.Response.ContentType = MediaTypeNames.Application.Json;
                await context.Response.WriteAsync(result == null ? "null" : result.ToString());
            }
            catch (Exception ex)
            {
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await _fw.Error(nameof(Run), $@"Caught exception processing request: {ex.Message} : {ex.UnwrapForLog()}");
                throw;
            }
        }

        private async Task<object> ExecuteRequest(HttpContext context)
        {
            var path = context.Request.Path.ToString().ToLowerInvariant();
            if (path.EndsWith('/'))
                path = path.Remove(path.Length - 1);

            var verb = context.Request.Method;
            
            if (context.Request.Method != Http.Post)
            {
                context.Response.StatusCode = StatusCodes.Status405MethodNotAllowed;
                return "Method not allowed";
            }

            if (_routes.TryGetValue(path, out var action))
                return await action(context);

            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return "Path not found";
        }

        private async Task<object> Config(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Data, out var data) && data.Type == JTokenType.Object)
            {
                var result = new JObject();
                var obj = (JObject)data;

                if (obj.TryGetValue(Rs, out var rsList) && rsList.Type == JTokenType.Object)
                {
                    var rsResults = new JObject();
                    result[Rs] = rsResults;

                    foreach (var rs in (JObject)rsList)
                    {
                        var rsConfig = (JObject)rs.Value;
                        var type = rsConfig[Type].ToString();
                        var configId = Guid.Parse(rsConfig[ConfigId].ToString());
                        var rsResult = await GetOrCreateRs(sessionId, rs.Key, type, configId, rsConfig[Data]);
                        rsResults[rs.Key] = rsResult.Data;
                    }
                }

                var stackFrames = new List<string>();
                if (obj.TryGetValue(Ss, out var ssList) && ssList.Type == JTokenType.Object)
                {
                    var ssResults = new JObject();
                    result[Ss] = ssResults;

                    foreach (var ss in (JObject)ssList)
                    {
                        var ssConfig = (JObject)ss.Value;
                        JObject prefixConfig = null;
                        if (ssConfig.TryGetValue(KeyPrefix, out var keyPrefix))
                            prefixConfig = JObject.FromObject(new Dictionary<string, object>() { [KeyPrefix] = keyPrefix });
                        var newSf = await GetOrCreateStackFrame(sessionId, ss.Key, prefixConfig, stackFrames);
                        var ssResult = await SetStackFrame(sessionId, newSf.Name, ssConfig);
                        stackFrames.Add(newSf.Name);
                        ssResults[newSf.Name] = ssResult.Data;
                    }
                }

                if (obj.TryGetValue(Ev, out var evList) && evList.Type == JTokenType.Array)
                {
                    var evResults = new JArray();
                    result[Ev] = evResults;

                    foreach (var ev in (JArray)evList)
                    {
                        var evResult = await PublishEvent(sessionId, stackFrames.ToArray(), ev);
                        evResults.Add(evResult);
                    }
                }

                return JsonWrapper.Serialize(result);
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private Guid GetOrCreateSessionId(HttpContext context, JObject json)
        {
            if (context.Request.Cookies.TryGetValue(SessionId, out var cookieSessionId))
                return Guid.Parse(cookieSessionId);

            if (json.TryGetValue(SessionId, out var raw) &&
                Guid.TryParse(raw?.ToString(), out var sessionId))
                return sessionId;

            var newSessionId = Guid.NewGuid();
            context.Response.Cookies.Append(SessionId, newSessionId.ToString());
            return newSessionId;
        }

        private async Task<object> GetOrCreateRs(HttpContext context)
        {
            // TODO: Check for duplicate, by rs name, at session level. Handle Immediate and Checked, based on values.
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Name, out var name) &&
                json.TryGetValue(ConfigId, out var rawConfigId) &&
                json.TryGetValue(Type, out var type) &&
                json.TryGetValue(Data, out var data))
            {
                var configId = Guid.Parse(rawConfigId.ToString());

                var result = await GetOrCreateRs(
                    sessionId,
                    name.ToString(), 
                    type.ToString(), 
                    configId, 
                    data);

                return result.Json;
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private async Task<(string Json, JToken Data)> GetOrCreateRs(Guid sessionId, string name,string type, Guid configId, JToken data)
        {
            var rsListKey = $"{sessionId}:{Rs}";
            var rsKey = $"{sessionId}:{Rs}:{name}";

            if (_cache.TryGetValue<string>(rsKey, out var oldData))
                return (oldData, JsonWrapper.TryParse(oldData));

            TransformData(data, sessionId);

            var edwType = Enum.Parse<EdwBulkEvent.EdwType>(type);
            var be = new EdwBulkEvent();
            be.AddRS(edwType, sessionId, DateTime.UtcNow, PL.FromJsonString(JsonWrapper.Serialize(data)), configId);

            await _fw.EdwWriter.Write(be);

            var rsList = _cache.GetOrCreate(rsListKey, t => new List<(string, Guid)>());
            rsList.Add((name, configId));

            var result = JsonWrapper.Serialize(data);
            _cache.Set(rsKey, result);

            return (result, data);
        }

        private IEnumerable<IDictionary<string, JToken>> BuildStack(Guid sessionId, IEnumerable<string> stackParts)
        {
            var stackFrames = new List<IDictionary<string, JToken>>();
            foreach (var stackFrame in stackParts)
            {
                if (_cache.TryGetValue<string>($"{sessionId}:{Sf}:{stackFrame}", out var serializedScope))
                {
                    var sf = new StackFrameParser(serializedScope);
                    stackFrames.Add(sf.ToDictionary());
                }
            }
            return stackFrames;
        }

        private List<string> ExtractWhepFromStack(IEnumerable<IDictionary<string, JToken>> stackFrames)
        {
            // TODO: collect from __ev collection
            return stackFrames
                .SkipLast(1)
                .Where(sf => sf.ContainsKey(EventId))
                .Select(sf => sf[EventId].ToString())
                .ToList();
        }

        private Dictionary<string, object> GetRsIds(Guid sessionId)
        {
            var rsids = new Dictionary<string, object>();
            var rsListKey = $"{sessionId}:{Rs}";
            return _cache.Get<List<(string Name, Guid Id)>>(rsListKey)
                .ToDictionary(rs => rs.Name, rs => (object)rs.Id);
        }

        private async Task<object> PublishEvent(HttpContext context)
        {
            // TODO: Unique Key, duplicateSpec, insertInWhep, includeWhep, stack to data syntax
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Stack, out var stack) && stack.Type == JTokenType.Array &&
                json.TryGetValue(Data, out var data))
            {
                var stackFrames = stack.ToObject<string[]>();
                var result = await PublishEvent(sessionId, stackFrames, data);
                return JsonWrapper.Serialize(result);
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private async Task<object> PublishEvent(Guid sessionId, string[] stackFrames, JToken data)
        {
            data["edw_test_mark"] = "b8a291aa-b922-48f7-ba37-22a4b0ee9a93";

            TransformData(data, sessionId);
            var stack = BuildStack(sessionId, stackFrames);
            data[Sf] = JArray.FromObject(stack);

            var whep = ExtractWhepFromStack(stack);
            var rsids = GetRsIds(sessionId);

            var be = new EdwBulkEvent();
            var eventId = Guid.NewGuid();
            var pl = PL.FromJsonString(JsonWrapper.Serialize(data));
            be.AddEvent(eventId, DateTime.UtcNow, rsids, whep, pl);
            await _fw.EdwWriter.Write(be);
            await SetStackFrame(sessionId, stackFrames.Last(), JObject.FromObject(new Dictionary<string, object>() { [EventId] = eventId }));

            return data;
        }

        private async Task<object> SetStackFrame(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Name, out var name) &&
                json.TryGetValue(Data, out var data) && data.Type == JTokenType.Object)
            {
                var result = await SetStackFrame(sessionId, name.ToString(), data);
                return result.Json;
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private Task<(string Json, JToken Data)> SetStackFrame(Guid sessionId, string name, JToken data)
        {
            TransformData(data, sessionId);
            var serializedScope = _cache.GetOrCreate($"{sessionId}:{Sf}:{name}", t => JsonWrapper.Serialize(new JArray()));
            var scopeStack = new StackFrameParser(serializedScope);
            scopeStack.Apply(((JObject)data).Properties().ToDictionary(t => t.Name, t => t.Value));
            var jsonStack = scopeStack.Json();
            serializedScope = JsonWrapper.Serialize(jsonStack);
            _cache.Set($"{sessionId}:{Sf}:{name}", serializedScope);
            return Task.FromResult((serializedScope, jsonStack));
        }

        private async Task<object> GetOrCreateStackFrame(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Stack, out var stack) &&
                json.TryGetValue(Name, out var name) &&
                json.TryGetValue(Data, out var data))
            {
                var result = await GetOrCreateStackFrame(sessionId, name.ToString(), data, stack.ToObject<string[]>());
                return result.Json;
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private Task<(string Name, string Json)> GetOrCreateStackFrame(Guid sessionId, string name, JToken data, IEnumerable<string> stackFrames)
        {
            if (data != null && 
                data.Type == JTokenType.Object && 
                data is JObject obj && 
                obj.TryGetValue(KeyPrefix, out var rawKeyPrefix))
            {
                var keyPrefix = rawKeyPrefix.ToString();

                if (!stackFrames.Reverse().Any(sf => sf == keyPrefix))
                {
                    foreach (var sf in stackFrames.Reverse())
                    {
                        var stack = BuildStack(sessionId, new[] { sf }).First();
                        if (stack.TryGetValue(SfName, out var n) && n.ToString() == keyPrefix)
                        {
                            keyPrefix = sf;
                            break;
                        }
                    }
                }

                var newName = $"{keyPrefix}/{name}";
                obj[SfName] = name;
                name = newName;
            }

            var stackFrame = _cache.GetOrCreate($"{sessionId}:{Sf}:{name}", t =>
            {
                var array = data == null ? new JArray() : new JArray() { data };
                return JsonWrapper.Serialize(array);
            });
            return Task.FromResult((name, stackFrame));
        }

        private void TransformData(JToken data, Guid sessionId)
        {
            if (data.Type == JTokenType.Object)
            {
                var obj = (JObject)data;
                var toRemove = new List<string>();
                
                foreach (var kv in obj)
                {
                    if (kv.Value.Type != JTokenType.String)
                        continue;

                    var str = (string)kv.Value;
                    var key = $"{sessionId}:{kv.Key}";

                    if (str == "0+")
                    {
                        var value = _cache.GetOrCreate(key, t => 0);
                        value++;
                        _cache.Set(key, value);
                        obj[kv.Key] = value;
                    }
                    else if (str.EndsWith('+') && str.Length > 1)
                    {
                        var varName = str.Substring(0, str.Length - 1);
                        if (obj.TryGetValue(varName, out var variable))
                        {
                            var value = _cache.GetOrCreate(key, t => string.Empty);
                            var separator = value == string.Empty ? string.Empty : ";";
                            value = $"{value}{separator}{variable}";
                            _cache.Set(key, value);
                            obj[kv.Key] = new JArray(value.Split(";", StringSplitOptions.RemoveEmptyEntries));
                        }
                        else
                        {
                            toRemove.Add(kv.Key);
                        }
                    }
                }

                foreach (var rm in toRemove)
                    obj.Remove(rm);
            }
        }
    }
}
