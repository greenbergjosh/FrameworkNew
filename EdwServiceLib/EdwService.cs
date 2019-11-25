using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Mime;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Utility;
using Utility.EDW.Reporting;
using static System.Net.WebRequestMethods;

namespace EdwServiceLib
{
    // ReSharper disable once UnusedMember.Global
    public class EdwService
    {
        private FrameworkWrapper _fw;

        private static readonly Guid SessionTerminateEventId = Guid.Parse("1CCEEB9E-046A-43AB-9319-FF9204CBFFB1");
        private static readonly TimeSpan SessionTimeout = TimeSpan.FromSeconds(20);

        private readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
        private readonly Dictionary<string, Func<HttpContext, Task<object>>> _routes =
            new Dictionary<string, Func<HttpContext, Task<object>>>();

        private const string SessionId = "sessionId";
        private const string Name = "name";
        private const string Data = "data";
        private const string Type = "type";
        private const string Stack = "stack";
        private const string Ss = "ss";
        private const string Sf = "sf";
        private const string Rs = "rs";
        private const string Ev = "ev";
        private const string Cf = "cf";
        private const string ConfigId = "configId";
        private const string KeyPrefix = "keyPrefix";
        private const string SfName = "__sfName";
        private const string Key = "key";
        private const string Whep = "whep";
        private const string AddToWhep = "addToWhep";
        private const string IncludeWhep = "includeWhep";
        private const string Duplicate = "duplicate";

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

            var (sessionId, token) = GetOrCreateSessionId(context, json);
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
                        var rsResult = await GetOrCreateRs(sessionId, token, rs.Key, type, configId, rsConfig[Data]);
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
                        var newSf = await GetOrCreateStackFrame(sessionId, token, ss.Key, prefixConfig, stackFrames);
                        var ssResult = await SetStackFrame(sessionId, token, newSf.Name, ssConfig);
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
                        var evObj = (JObject)ev;
                        var evData = (JObject)evObj[Data];
                        var evKey = (JArray)evObj[Key];

                        var addToWhep = false;
                        var includeWhep = false;
                        JObject duplicate = null;

                        if (evObj.TryGetValue(AddToWhep, out var rawAddToWhep) && rawAddToWhep.Type == JTokenType.Boolean)
                            addToWhep = rawAddToWhep.ToObject<bool>();

                        if (evObj.TryGetValue(IncludeWhep, out var rawIncludeWhep) && rawIncludeWhep.Type == JTokenType.Boolean)
                            includeWhep = rawIncludeWhep.ToObject<bool>();

                        if (evObj.TryGetValue(Duplicate, out var rawDuplicate) && rawDuplicate.Type == JTokenType.Object)
                            duplicate = (JObject)rawDuplicate;

                        var evResult = await PublishEvent(sessionId, token, stackFrames.ToArray(), evKey.ToObject<string[]>(), 
                                                          evData, addToWhep, includeWhep, duplicate);
                        if (evResult != null)
                            evResults.Add(evResult);
                    }
                }

                return JsonWrapper.Serialize(result);
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private (Guid sessionid, CancellationToken cancellationToken) GetOrCreateSessionId(HttpContext context, JObject json)
        {
            if (context.Request.Cookies.TryGetValue(SessionId, out var cookieSessionId))
            {
                var sid = Guid.Parse(cookieSessionId);
                return (sid, ExtendSession(sid));
            }
            if (json.TryGetValue(SessionId, out var raw) &&
                Guid.TryParse(raw?.ToString(), out var sessionId))
            {
                context.Response.Cookies.Append(SessionId, sessionId.ToString());
                return (sessionId, ExtendSession(sessionId));
            }

            var newSessionId = Guid.NewGuid();
            context.Response.Cookies.Append(SessionId, newSessionId.ToString());
            return (newSessionId, ExtendSession(newSessionId));
        }

        private CancellationToken ExtendSession(Guid sessionId)
        {
            var tokens = _cache.GetOrCreate($"{sessionId}", e => {
                var cts = new CancellationTokenSource();
                var ctsKey = new CancellationTokenSource();
                e.AddExpirationToken(new CancellationChangeToken(cts.Token))
                 .RegisterPostEvictionCallback(async (key, value, reason, state) =>
                 {
                     if (reason != EvictionReason.Replaced)
                     {
                         Debug.WriteLine(key);
                         var data = new Dictionary<string, object>() { ["event"] = SessionTerminateEventId };

                         await PublishEvent(Guid.Parse(key.ToString()), cts.Token, new[] { "session" }, new[] { "event" },
                                            JObject.FromObject(data), false, false, null);

                         cts.Dispose();
                         ctsKey.Cancel();
                         ctsKey.Dispose();
                     }
                 });
                return (cts, ctsKey);
            });
            tokens.cts.CancelAfter(SessionTimeout);
            return tokens.ctsKey.Token;
        }

        private async Task<object> GetOrCreateRs(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var (sessionId, token) = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Name, out var name) &&
                json.TryGetValue(ConfigId, out var rawConfigId) &&
                json.TryGetValue(Type, out var type) &&
                json.TryGetValue(Data, out var data))
            {
                var configId = Guid.Parse(rawConfigId.ToString());

                var result = await GetOrCreateRs(
                    sessionId,
                    token,
                    name.ToString(), 
                    type.ToString(), 
                    configId, 
                    data);

                return result.Json;
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private async Task<(string Json, JToken Data)> GetOrCreateRs(
            Guid sessionId, CancellationToken token,
            string name, string type, Guid configId, JToken data)
        {
            var rsListKey = $"{sessionId}:{Rs}";
            var rsKey = $"{sessionId}:{Rs}:{name}";

            if (_cache.TryGetValue<string>(rsKey, out var oldData))
            {
                var oldObj = (JObject)JsonWrapper.TryParse(oldData);
                var oldType = Enum.Parse<EdwBulkEvent.EdwType>(oldObj[Type].ToString());
                if (oldType == EdwBulkEvent.EdwType.Immediate)
                    return (oldData, oldObj);
                
                var dataObj = (JObject)oldObj[Data];
                var oldProps = dataObj.Properties().Select(p => p.Name).ToList();
                var newProps = ((JObject)data).Properties().Select(p => p.Name)
                    .Where(p => !oldProps.Contains(p))
                    .ToList();

                if (newProps.Any())
                {
                    foreach (var newProp in newProps)
                        dataObj[newProp] = data[newProp];
                    data = dataObj;
                    type = EdwBulkEvent.EdwType.CheckedDetail.ToString();
                }
                else
                    return (oldData, oldObj);
            }

            var edwType = Enum.Parse<EdwBulkEvent.EdwType>(type);
            var be = new EdwBulkEvent();
            var pl = PL.FromJsonString(JsonWrapper.Serialize(data));
            var rsid = Guid.NewGuid();
            be.AddRS(edwType, rsid, DateTime.UtcNow, pl, configId);

            await _fw.EdwWriter.Write(be);

            var rsList = _cache.GetOrCreate(rsListKey, e => {
                e.AddExpirationToken(new CancellationChangeToken(token));
                e.RegisterPostEvictionCallback((key, value, reason, state) => {
                    if (reason != EvictionReason.Replaced)
                        Debug.WriteLine(key);
                });
                return new List<(string, Guid)>();
            });
            rsList.Add((name, rsid));

            var result = JsonWrapper.Serialize(new JObject
            {
                [Data] = data,
                [Type] = type
            });
            _cache.Set(rsKey, result, new MemoryCacheEntryOptions()
                .AddExpirationToken(new CancellationChangeToken(token))
                .RegisterPostEvictionCallback((k, v, reason, state) => {
                    if (reason != EvictionReason.Replaced)
                        Debug.WriteLine(k);
                }));

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
            return stackFrames
                .SkipLast(1)
                .Where(sf => sf.ContainsKey(Whep))
                .SelectMany(sf => sf[Whep].ToObject<string[]>())
                .ToList();
        }

        private Dictionary<string, object> GetRsIds(Guid sessionId)
        {
            var rsListKey = $"{sessionId}:{Rs}";
            return _cache.Get<List<(string Name, Guid Id)>>(rsListKey)
                .ToDictionary(rs => rs.Name, rs => (object)rs.Id);
        }

        private async Task<object> PublishEvent(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var (sessionId, token) = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Stack, out var stack) && stack.Type == JTokenType.Array &&
                json.TryGetValue(Key, out var key) && key.Type == JTokenType.Array &&
                json.TryGetValue(Data, out var data) && data.Type == JTokenType.Object)
            {
                var addToWhep = false;
                var includeWhep = false;
                JObject duplicate = null;

                if (json.TryGetValue(AddToWhep, out var rawAddToWhep) && rawAddToWhep.Type == JTokenType.Boolean)
                    addToWhep = rawAddToWhep.ToObject<bool>();

                if (json.TryGetValue(IncludeWhep, out var rawIncludeWhep) && rawIncludeWhep.Type == JTokenType.Boolean)
                    includeWhep = rawIncludeWhep.ToObject<bool>();

                if (json.TryGetValue(Duplicate, out var rawDuplicate) && rawDuplicate.Type == JTokenType.Object)
                    duplicate = (JObject)rawDuplicate;

                var stackFrames = stack.ToObject<string[]>();
                var result = await PublishEvent(sessionId, token, stackFrames, key.ToObject<string[]>(), 
                                                (JObject)data, addToWhep, includeWhep, duplicate);
                return JsonWrapper.Serialize(result);
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private async Task<object> PublishEvent(
            Guid sessionId, CancellationToken token,
            string[] stackFrames, string[] keyParts, JObject data, 
            bool addToWhep, bool includeWhep, JObject duplicate)
        {
            // Compute event key
            var keyValues = new List<string>();
            foreach (var keyPart in keyParts)
            {
                if (data.TryGetValue(keyPart, out var keyValue))
                    keyValues.Add($"{keyPart}:{keyValue}");
                else
                    throw new InvalidOperationException($"Data does not contain keyPart \"{keyPart}\".");
            }

            var stack = BuildStack(sessionId, stackFrames);

            // Get last stack frame and get/create event dictionary.
            var enumeratedStack = stack.ToList();
            var stackFrame = enumeratedStack.Last();
            JArray evArray;
            if (stackFrame.TryGetValue(Ev, out var rawEvArray) && rawEvArray.Type == JTokenType.Array)
                evArray = (JArray)rawEvArray;
            else
                evArray = new JArray();

            var key = string.Join(",", keyValues);
            // look for event key in event dictionary.
            var eventPresent = evArray.ToObject<string[]>().Contains(key);

            // If event key was already published and no duplicate info is passed, do not publish.
            if (eventPresent && duplicate == null)
                return null; //TODO: return last event?

            // Add duplicate data if available
            if (eventPresent)
            {
                foreach (var (s, value) in duplicate)
                    data[s] = value;
            }

            TransformData(sessionId, token, data, enumeratedStack, stackFrames.Last());
            var jStack = new JObject();
            for (var i = 0; i < stackFrames.Length; i++)
                jStack[stackFrames[i]] = JObject.FromObject(enumeratedStack.ElementAt(i));
            data[Sf] = jStack;
            //data["edw_test_mark"] = "b8a291aa-b922-48f7-ba37-22a4b0ee9a93";

            var rsids = GetRsIds(sessionId);
            var be = new EdwBulkEvent();
            var eventId = Guid.NewGuid();
            var pl = PL.FromJsonString(JsonWrapper.Serialize(data));
            List<string> whep = null;
            var sfData = new Dictionary<string, object>
            {
                { Ev, evArray }
            };

            // include whep data in new event.
            if (includeWhep)
                whep = ExtractWhepFromStack(enumeratedStack);

            // store new event key in ev array.
            if (!eventPresent)
                evArray.Add(key);

            // add new event id to whep data
            if (addToWhep)
            {
                JArray whepArray;
                if (stackFrame.TryGetValue(Whep, out var rawWhepArray) && rawWhepArray.Type == JTokenType.Array)
                    whepArray = (JArray)rawWhepArray;
                else
                    whepArray = new JArray();

                whepArray.Add(eventId);

                sfData.Add(Whep, whepArray);
            }

            be.AddEvent(eventId, DateTime.UtcNow, rsids, whep, pl);
            await _fw.EdwWriter.Write(be);

            await SetStackFrame(sessionId, token, stackFrames.Last(), JObject.FromObject(sfData));

            return data;
        }

        private async Task<object> SetStackFrame(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var (sessionId, token) = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Name, out var name) &&
                json.TryGetValue(Data, out var data) && data.Type == JTokenType.Object)
            {
                var result = await SetStackFrame(sessionId, token, name.ToString(), data);
                return result.Json;
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private Task<(string Json, JToken Data)> SetStackFrame(Guid sessionId, CancellationToken token, string name, JToken data)
        {
            TransformData(sessionId, token, data, null, name);
            var serializedScope = _cache.GetOrCreate($"{sessionId}:{Sf}:{name}", e =>
            {
                e.AddExpirationToken(new CancellationChangeToken(token));
                e.RegisterPostEvictionCallback((key, value, reason, state) => {
                    if (reason != EvictionReason.Replaced)
                        Debug.WriteLine(key);
                });
                return JsonWrapper.Serialize(new JObject());
            });
            var scopeStack = new StackFrameParser(serializedScope);
            scopeStack.Apply(((JObject)data).Properties().ToDictionary(t => t.Name, t => t.Value));
            var jsonStack = scopeStack.Json();
            serializedScope = JsonWrapper.Serialize(jsonStack);
            _cache.Set($"{sessionId}:{Sf}:{name}", serializedScope, new MemoryCacheEntryOptions()
                .AddExpirationToken(new CancellationChangeToken(token))
                .RegisterPostEvictionCallback((k, v, reason, state) => {
                    if (reason != EvictionReason.Replaced)
                        Debug.WriteLine(k);
                }));
            return Task.FromResult((serializedScope, jsonStack));
        }

        private async Task<object> GetOrCreateStackFrame(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var (sessionId, token) = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Stack, out var stack) &&
                json.TryGetValue(Name, out var name) &&
                json.TryGetValue(Data, out var data))
            {
                var result = await GetOrCreateStackFrame(sessionId, token, name.ToString(), data, stack.ToObject<string[]>());
                return result.Json;
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private Task<(string Name, string Json)> GetOrCreateStackFrame(
            Guid sessionId, CancellationToken token, 
            string name, JToken data, IEnumerable<string> stackFrames)
        {
            if (data != null && 
                data.Type == JTokenType.Object && 
                data is JObject obj && 
                obj.TryGetValue(KeyPrefix, out var rawKeyPrefix))
            {
                var keyPrefix = rawKeyPrefix.ToString();
                var invertedStackFrames = stackFrames.Reverse().ToList();
                if (invertedStackFrames.All(sf => sf != keyPrefix))
                {
                    foreach (var sf in invertedStackFrames)
                    {
                        var stack = BuildStack(sessionId, new[] { sf }).First();
                        if (!stack.TryGetValue(SfName, out var n) || n.ToString() != keyPrefix)
                            continue;
                        keyPrefix = sf;
                        break;
                    }
                }

                var newName = $"{keyPrefix}/{name}";
                obj[SfName] = name;
                name = newName;
            }

            var stackFrame = _cache.GetOrCreate($"{sessionId}:{Sf}:{name}", e =>
            {
                e.AddExpirationToken(new CancellationChangeToken(token));
                e.RegisterPostEvictionCallback((key, value, reason, state) => {
                    if (reason != EvictionReason.Replaced)
                        Debug.WriteLine(key);
                });
                return JsonWrapper.Serialize(data ?? new JObject());
            });
            return Task.FromResult((name, stackFrame));
        }

        private void TransformData(
            Guid sessionId, CancellationToken token, JToken data,
            List<IDictionary<string, JToken>> stack, string stackFrame)
        {
            if (data.Type != JTokenType.Object)
                return;

            var obj = (JObject)data;
            var toRemove = new List<string>();
                
            foreach (var kv in obj)
            {
                if (kv.Value.Type != JTokenType.String)
                    continue;

                var str = (string)kv.Value;
                var key = $"{sessionId}:{stackFrame}:{kv.Key}";

                if (ParseCounter(token, key, obj, kv, str)) continue;
                if (ParseAccumulator(token, key, obj, kv, str, toRemove)) continue;
                ParseStack(obj, kv, str, stack);
            }

            foreach (var rm in toRemove)
                obj.Remove(rm);
        }

        private bool ParseAccumulator(
            CancellationToken token, string key, JObject obj, 
            KeyValuePair<string, JToken> kv, string str, List<string> toRemove)
        {
            var regex = new Regex("^(?<varName>.+)\\+(?<options>(?<count>\\d+)(?<distinct>[d]?)(?<mode>[fl]?))?$");
            var match = regex.Match(str);

            if (!match.Success)
                return false;

            string varName = null;
            var count = 0;
            var distinct = false;
            var last = false;

            foreach (Group group in match.Groups)
            {
                // ReSharper disable once SwitchStatementMissingSomeCases
                switch (group.Name)
                {
                    case "varName":
                        varName = group.Value;
                        break;

                    case "count":
                        if (!string.IsNullOrEmpty(group.Value))
                            count = int.Parse(group.Value);
                        break;

                    case "distinct":
                        distinct = group.Value == "d";
                        break;

                    case "mode":
                        last = group.Value == "l";
                        break;
                }
            }

            if (varName != null && obj.TryGetValue(varName, out var variable))
            {
                var values = (JArray)JsonWrapper.TryParse(_cache.GetOrCreate(key, e =>
                {
                    e.AddExpirationToken(new CancellationChangeToken(token));
                    e.RegisterPostEvictionCallback((k, value, reason, state) => {
                        if (reason != EvictionReason.Replaced)
                            Debug.WriteLine(key);
                    });
                    return "[]";
                }));

                if (count > 0 && !last && values.Count >= count)
                {
                    obj[kv.Key] = values;
                    return true;
                }

                var strVal = variable.ToString();
                if (distinct && values.Any(t => t.Value<string>() == strVal))
                {
                    obj[kv.Key] = values;
                    return true;
                }

                if (last && count > 0 && values.Count >= count)
                    values.RemoveAt(0);

                values.Add(variable);

                _cache.Set(key, JsonWrapper.Serialize(values), new MemoryCacheEntryOptions()
                    .AddExpirationToken(new CancellationChangeToken(token))
                    .RegisterPostEvictionCallback((k, v, reason, state) => {
                        if (reason != EvictionReason.Replaced)
                            Debug.WriteLine(key);
                    }));
                obj[kv.Key] = values;
            }
            else
            {
                toRemove.Add(kv.Key);
            }

            return true;
        }

        private bool ParseCounter(CancellationToken token, string key, JObject obj, KeyValuePair<string, JToken> kv, string str)
        {
            if (str != "0+")
                return false;

            var value = _cache.GetOrCreate(key, e =>
            {
                e.AddExpirationToken(new CancellationChangeToken(token));
                e.RegisterPostEvictionCallback((k, v, reason, state) => {
                    if (reason != EvictionReason.Replaced)
                        Debug.WriteLine(key);
                });
                return 0;
            });
            value++;
            _cache.Set(key, value, new MemoryCacheEntryOptions()
                .AddExpirationToken(new CancellationChangeToken(token))
                .RegisterPostEvictionCallback((k, v, reason, state) => {
                    if (reason != EvictionReason.Replaced)
                        Debug.WriteLine(key);
                }));
            obj[kv.Key] = value;

            return true;
        }

        private static bool ParseStack(JObject obj, KeyValuePair<string, JToken> kv, string str, List<IDictionary<string, JToken>> stack)
        {
            if (stack == null || !(str.StartsWith("{") && str.EndsWith("}")))
                return false;
            
            var varName = str.Substring(1, str.Length - 2);
            JToken value = null;
            // ReSharper disable once ForeachCanBePartlyConvertedToQueryUsingAnotherGetEnumerator
            foreach (var stackFrame in stack)
            {
                if (stackFrame.TryGetValue(varName, out value))
                    break;
            }
            obj[kv.Key] = value;

            return true;
        }
    }
}
