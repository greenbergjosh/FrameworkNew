using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net.Mime;
using System.Threading.Tasks;
using Utility;
using Utility.EDW.Reporting;
using static System.Net.WebRequestMethods;

namespace CachingServiceLib
{
    public class CachingService
    {
        private FrameworkWrapper _fw;

        private readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
        private readonly Dictionary<string, (Func<HttpContext, Task<object>> get, Func<HttpContext, Task<object>> post)> _routes =
            new Dictionary<string, (Func<HttpContext, Task<object>>, Func<HttpContext, Task<object>>)>();

        const string SessionId = "sessionId";
        const string Rsid = "rsid";
        const string Name = "name";
        const string Data = "data";
        const string ReportingSession = "reportingSession";
        const string ReportingSessions = "reportingSessions";
        const string Rs = "rs";
        const string Event = "event";
        const string Cache = "cache";
        const string Cfg = "config";
        
        public void Config(FrameworkWrapper fw)
        {
            _fw = fw;

            _routes.Add($"/{Rs}", (GetRs, AddRs));
            _routes.Add($"/{Event}", (GetEvent, AddEvent));
            _routes.Add($"/{Cache}", (GetCache, AddCache));
            _routes.Add($"/{Cfg}", (null, GetOrCreateConfigIds));
        }

        public async Task Run(HttpContext context)
        {
            try
            {
                var result = await ExecuteRequest(context);
                //var json = JsonWrapper.Json(result);
                context.Response.ContentType = MediaTypeNames.Application.Json;
                await context.Response.WriteAsync(result == null ? "null" : result.ToString());
            }
            catch (Exception ex)
            {
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
            object result = null;

            if (_routes.TryGetValue(path, out var actions))
            {
                if (verb == Http.Get && actions.get != null)
                    result = await actions.get(context);
                else if (verb == Http.Post && actions.post != null)
                    result = await actions.post(context);
                else
                {
                    context.Response.StatusCode = StatusCodes.Status405MethodNotAllowed;
                    result = "Method not allowed";
                }

                return result;
            }
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return "Path not found";
        }

        private Guid GetOrCreateSessionId(HttpContext context)
        {
            if (context.Request.Cookies.TryGetValue(SessionId, out var cookieSessionId))
                return Guid.Parse(cookieSessionId);

            if (context.Request.Query.TryGetValue(SessionId, out var sessionId))
                return Guid.Parse(sessionId);

            var newSessionId = Guid.NewGuid();
            context.Response.Cookies.Append(SessionId, newSessionId.ToString());
            return newSessionId;
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

        private Task<object> GetRs(HttpContext context)
        {
            var sessionId = GetOrCreateSessionId(context);
            var name = context.Request.Query[Name];

            if (_cache.TryGetValue($"{sessionId}:{Rs}:{name}", out var data))
                return Task.FromResult(data);

            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return Task.FromResult<object>(null);
        }

        private async Task<object> AddRs(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Name, out var name) &&
                json.TryGetValue(Data, out var data))
            {
                TransformData(data, sessionId);

                var be = new EdwBulkEvent();
                be.AddRS(EdwBulkEvent.EdwType.Immediate, sessionId, DateTime.UtcNow, 
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

        private Task<object> GetEvent(HttpContext context)
        {
            var sessionId = GetOrCreateSessionId(context);
            var reportingSession = context.Request.Query[ReportingSession];

            if (_cache.TryGetValue($"{sessionId}:{Event}:{reportingSession}", out var data))
                return Task.FromResult(data);

            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return Task.FromResult<object>(null);
        }

        private async Task<object> AddEvent(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(ReportingSessions, out var reportingSessions) &&
                json.TryGetValue(Data, out var data))
            {
                TransformData(data, sessionId);

                var rsids = new Dictionary<string, object>();
                foreach (var reportingSession in reportingSessions.ToObject<string[]>())
                    rsids.Add(reportingSession, GetConfigId(sessionId, reportingSession));

                var be = new EdwBulkEvent();
                var pl = PL.FromJsonString(JsonWrapper.Serialize(data));
                be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids, null, pl);
                await _fw.EdwWriter.Write(be);

                var result = JsonWrapper.Serialize(data);
                foreach (var kv in rsids)
                    _cache.Set($"{sessionId}:{Event}:{kv.Key}", result);

                return result;
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private Task<object> GetCache(HttpContext context)
        {
            var sessionId = GetOrCreateSessionId(context);
            var name = context.Request.Query[Name];

            if (_cache.TryGetValue($"{sessionId}:{name}", out var data))
                return Task.FromResult(data);

            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return Task.FromResult<object>(null);
        }

        private async Task<object> AddCache(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Name, out var name) &&
                json.TryGetValue(Data, out var data))
            {
                TransformData(data, sessionId);
                var result = JsonWrapper.Serialize(data);
                _cache.Set($"{sessionId}:{name}", result);
                return result;
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

        private void TransformData(JToken data, Guid sessionId)
        {
            if (data.Type == JTokenType.Object)
            {
                var obj = (JObject)data;
                foreach (var kv in obj)
                {
                    if (kv.Value.Type == JTokenType.String)
                    {
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
}
