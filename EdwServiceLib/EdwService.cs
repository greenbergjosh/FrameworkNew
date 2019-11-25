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
        const string KeyPrefix = "keyPrefix";
        const string SfName = "__sfName";
        const string Key = "key";
        const string Whep = "whep";
        const string AddToWhep = "addToWhep";
        const string IncludeWhep = "includeWhep";
        const string Duplicate = "duplicate";

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
                        var evObj = (JObject)ev;
                        var evData = (JObject)evObj[Data];
                        var evKey = (JArray)evObj[Key];

                        var addToWhep = false;
                        var includeWhep = false;
                        JObject duplicate = null;

                        if (json.TryGetValue(AddToWhep, out var rawAddToWhep) && rawAddToWhep.Type == JTokenType.Boolean)
                            addToWhep = rawAddToWhep.ToObject<bool>();

                        if (json.TryGetValue(IncludeWhep, out var rawIncludeWhep) && rawIncludeWhep.Type == JTokenType.Boolean)
                            includeWhep = rawIncludeWhep.ToObject<bool>();

                        if (json.TryGetValue(Duplicate, out var rawDuplicate) && rawDuplicate.Type == JTokenType.Object)
                            duplicate = (JObject)rawDuplicate;

                        var evResult = await PublishEvent(sessionId, stackFrames.ToArray(), evKey.ToObject<string[]>(), 
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

        private async Task<(string Json, JToken Data)> GetOrCreateRs(Guid sessionId, string name, string type, Guid configId, JToken data)
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
                var newProps = ((JObject)data).Properties().Select(p => p.Name).ToList();

                if (newProps.Count > oldProps.Count && oldProps.All(op => newProps.Contains(op)))
                    type = EdwBulkEvent.EdwType.CheckedDetail.ToString();
                else
                    return (oldData, oldObj);
            }

            var edwType = Enum.Parse<EdwBulkEvent.EdwType>(type);
            var be = new EdwBulkEvent();
            be.AddRS(edwType, sessionId, DateTime.UtcNow, PL.FromJsonString(JsonWrapper.Serialize(data)), configId);

            //await _fw.EdwWriter.Write(be);

            var rsList = _cache.GetOrCreate(rsListKey, t => new List<(string, Guid)>());
            rsList.Add((name, configId));

            var result = JsonWrapper.Serialize(new JObject
            {
                [Data] = data,
                [Type] = type
            });
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
            return stackFrames
                .SkipLast(1)
                .Where(sf => sf.ContainsKey(Whep))
                .SelectMany(sf => sf[Whep].ToObject<string[]>())
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
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
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
                var result = await PublishEvent(sessionId, stackFrames, key.ToObject<string[]>(), 
                                                (JObject)data, addToWhep, includeWhep, duplicate);
                return JsonWrapper.Serialize(result);
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private async Task<object> PublishEvent(Guid sessionId, string[] stackFrames, string[] keyParts, JObject data, 
                                                bool addToWhep, bool includeWhep, JObject duplicate)
        {
            // Compute event key
            var keyValues = new List<string>();
            foreach (var keyPart in keyParts)
            {
                if (data.TryGetValue(keyPart, out var keyValue))
                    keyValues.Add($"{keyPart}:{keyValue}");
                else
                    throw new InvalidOperationException($"Data does not contain keypart \"keyPart\".");
            }

            var stack = BuildStack(sessionId, stackFrames);

            // Get last stack frame and get/create event dictionary.
            var stackFrame = stack.Last();
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
            if (eventPresent && duplicate != null)
            {
                foreach (var kv in duplicate)
                    data[kv.Key] = kv.Value;
            }

            TransformData(data, sessionId, stack);
            data[Sf] = JArray.FromObject(stack);
            data["edw_test_mark"] = "b8a291aa-b922-48f7-ba37-22a4b0ee9a93";

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
                whep = ExtractWhepFromStack(stack);

            // store new event key in ev array.
            if (!eventPresent)
                evArray.Add(key);

            // add new event id to whep data
            if (addToWhep)
            {
                JArray whepArray;
                if (stackFrame.TryGetValue(Ev, out var rawWhepArray) && rawWhepArray.Type == JTokenType.Array)
                    whepArray = (JArray)rawWhepArray;
                else
                    whepArray = new JArray();

                whepArray.Add(eventId);

                sfData.Add(Whep, whepArray);
            }

            be.AddEvent(eventId, DateTime.UtcNow, rsids, whep, pl);
            //await _fw.EdwWriter.Write(be);

            await SetStackFrame(sessionId, stackFrames.Last(), JObject.FromObject(sfData));

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
            TransformData(data, sessionId, null);
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

        private void TransformData(JToken data, Guid sessionId, IEnumerable<IDictionary<string, JToken>> stack)
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
                    else if (stack != null && str.StartsWith("{") && str.EndsWith("}"))
                    {
                        var varName = str.Substring(1, str.Length - 2);
                        JToken value = null;
                        foreach (var stackFrame in stack)
                        {
                            if (stackFrame.TryGetValue(varName, out value))
                                break;
                        }
                        obj[kv.Key] = value;
                    }
                }

                foreach (var rm in toRemove)
                    obj.Remove(rm);
            }
        }
    }
}
