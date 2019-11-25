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
        const string Rsid = "rsid";
        const string Name = "name";
        const string Data = "data";
        const string ReportingSessions = "reportingSessions";
        const string Rs = "rs";
        const string Event = "event";
        const string Cfg = "config";
        const string RsType = "rsType";
        const string Scope = "scope";
        const string Whep = "whep";
        const string Ss = "ss";
        const string Sf = "sf";
        const string Stack = "stack";

        public void Config(FrameworkWrapper fw)
        {
            _fw = fw;

            _routes.Add($"/{Rs}", GetOrCreateRs);
            _routes.Add($"/{Event}", AddEvent);
            _routes.Add($"/{Cfg}", GetOrCreateConfigIds);
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

        private Guid GetOrCreateSessionId(HttpContext context, JObject json)
        {
            if (context.Request.Cookies.TryGetValue(SessionId, out var cookieSessionId))
                return Guid.Parse(cookieSessionId);

            if (json.TryGetValue(SessionId, out var raw) &&
                Guid.TryParse(raw.ToString(), out var sessionId))
                return sessionId;

            var newSessionId = Guid.NewGuid();
            context.Response.Cookies.Append(SessionId, newSessionId.ToString());
            return newSessionId;
        }

        private Guid GetConfigId(Guid sessionId, string name)
        {
            return _cache.Get<Guid>($"{sessionId}:{Rsid}:{name}");
        }

        private async Task<object> GetOrCreateRs(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Stack, out var stack) && stack.Type == JTokenType.Array && 
                json.TryGetValue(Name, out var name) &&
                json.TryGetValue(RsType, out var rsType) &&
                json.TryGetValue(Data, out var data))
            {
                if (_cache.TryGetValue($"{sessionId}:{Rs}:{name}", out var oldData))
                    return oldData;

                data[Scope] = JObject.FromObject(BuildStack(sessionId, stack.ToObject<string[]>()));
                //TransformData(data, sessionId);

                //TODO: Pass config id from client.
                var edwType = Enum.Parse<EdwBulkEvent.EdwType>(rsType.ToString());
                var be = new EdwBulkEvent();
                be.AddRS(edwType, sessionId, DateTime.UtcNow, 
                    PL.FromJsonString(JsonWrapper.Serialize(data)), 
                    GetConfigId(sessionId, name.ToString()));
                
                await _fw.EdwWriter.Write(be);

                var result = JsonWrapper.Serialize(data);
                _cache.Set($"{sessionId}:{Rs}:{name}", result);

                return result;
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private IDictionary<string, string> BuildStack(Guid sessionId, string[] stackParts)
        {
            var mergedScopes = new Dictionary<string, string>();
            foreach (var stackFrame in stackParts)
            {
                if (_cache.TryGetValue<string>($"{sessionId}:{Sf}:{stackFrame}", out var serializedScope))
                {
                    var ss = new StackFrameParser(serializedScope);
                    var d = ss.ToDictionary();
                    foreach (var kv in d)
                        mergedScopes[kv.Key] = kv.Value;
                }
            }
            return mergedScopes;
        }

        private async Task<object> AddEvent(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Stack, out var stack) && stack.Type == JTokenType.Array &&
                json.TryGetValue(ReportingSessions, out var reportingSessions) &&
                json.TryGetValue(Data, out var data))
            {
                TransformData(data, sessionId);

                data[Scope] = JObject.FromObject(BuildStack(sessionId, stack.ToObject<string[]>()));

                var whep = _cache.GetOrCreate($"{sessionId}:{Whep}", t => new List<string>());

                //TODO: Do this client side
                var rsids = new Dictionary<string, object>();
                foreach (var reportingSession in reportingSessions.ToObject<string[]>())
                    rsids.Add(reportingSession, GetConfigId(sessionId, reportingSession));

                var be = new EdwBulkEvent();
                var eventId = Guid.NewGuid();
                var pl = PL.FromJsonString(JsonWrapper.Serialize(data));
                be.AddEvent(eventId, DateTime.UtcNow, rsids, whep, pl);
                await _fw.EdwWriter.Write(be);
                whep.Add(eventId.ToString());

                return JsonWrapper.Serialize(data);
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private async Task<object> GetOrCreateConfigIds(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Data, out var data) && data.Type == JTokenType.Object)
            {
                var obj = (JObject)data;
                foreach (var kv in obj)
                {
                    if (kv.Value.Type == JTokenType.String)
                        _cache.GetOrCreate($"{sessionId}:{Rsid}:{kv.Key}", t => Guid.Parse(kv.Value.ToString()));
                }
                var result = JsonWrapper.Serialize(data);
                return result;
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private async Task<object> SetStackFrame(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Name, out var name) &&
                json.TryGetValue(Data, out var data) && data.Type == JTokenType.Object)
            {
                TransformData(data, sessionId);
                var serializedScope = _cache.GetOrCreate($"{sessionId}:{Sf}:{name}", t => JsonWrapper.Serialize(new JArray()));
                var scopeStack = new StackFrameParser(serializedScope);
                scopeStack.Apply(((JObject)data).Properties().ToDictionary(t => t.Name, t => t.Value?.ToString()));
                var jsonStack = scopeStack.Json();
                serializedScope = JsonWrapper.Serialize(jsonStack);
                _cache.Set($"{sessionId}:{Sf}:{name}", serializedScope);
                return serializedScope;
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private async Task<object> GetOrCreateStackFrame(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Name, out var name) &&
                json.TryGetValue(Data, out var data))
            {
                var stackFrame = _cache.GetOrCreate($"{sessionId}:{Sf}:{name}", t =>
                {
                    return JsonWrapper.Serialize(new JArray
                    {
                        data
                    });
                });
                return stackFrame;
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private void TransformData(JToken data, Guid sessionId)
        {
            if (data.Type == JTokenType.Object)
            {
                var obj = (JObject)data;
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
                            obj[kv.Key] = JArray.FromObject(value.Split(";", StringSplitOptions.RemoveEmptyEntries));
                        }
                    }
                }
            }
        }
    }
}
