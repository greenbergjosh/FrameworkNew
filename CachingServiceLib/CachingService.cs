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

        public void Config(FrameworkWrapper fw)
        {
            _fw = fw;

            _routes.Add($"/{Rs}", (GetRs, AddRs));
            _routes.Add($"/{Event}", (GetEvent, AddEvent));
            _routes.Add($"/{Cache}", (GetCache, AddCache));
        }

        async Task<object> ExecuteRequest(HttpContext context)
        {
            var path = context.Request.Path.ToString().ToLowerInvariant();
            if (path.EndsWith('/'))
                path = path.Remove(path.Length - 1);

            var verb = context.Request.Method;
            object result = null;

            if (_routes.TryGetValue(path, out var actions))
            {
                if (verb == Http.Get)
                    result = await actions.get(context);
                else if (verb == Http.Post)
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

        public async Task Run(HttpContext context)
        {
            try
            {
                var result = await ExecuteRequest(context);
                var json = JsonWrapper.Json(result);
                context.Response.ContentType = MediaTypeNames.Application.Json;
                await context.Response.WriteAsync(json);
            }
            catch (Exception ex)
            {
                await _fw.Error(nameof(Run), $@"Caught exception processing request: {ex.Message} : {ex.UnwrapForLog()}");
                throw;
            }
        }

        Guid GetOrCreateSessionId(HttpContext context)
        {
            if (context.Request.Cookies.TryGetValue(SessionId, out var cookieSessionId))
                return Guid.Parse(cookieSessionId);

            if (context.Request.Query.TryGetValue(SessionId, out var sessionId))
                return Guid.Parse(sessionId);

            var newSessionId = Guid.NewGuid();
            context.Response.Cookies.Append(SessionId, newSessionId.ToString());
            return newSessionId;
        }

        Guid GetOrCreateSessionId(HttpContext context, JObject json)
        {
            if (json.TryGetValue(SessionId, out var raw) &&
                Guid.TryParse(raw.ToString(), out var sessionId))
                return sessionId;

            var newSessionId = Guid.NewGuid();
            context.Response.Cookies.Append(SessionId, newSessionId.ToString());
            return newSessionId;
        }

        Guid GetOrCreateRsId(Guid sessionId, string name)
        {
            return _cache.GetOrCreate($"{sessionId}:{Rsid}:{name}", t => Guid.NewGuid());
        }

        Task<object> GetRs(HttpContext context)
        {
            var sessionId = GetOrCreateSessionId(context);
            var name = context.Request.Query[Name];

            if (_cache.TryGetValue($"{sessionId}:{Rs}:{name}", out var data))
                return Task.FromResult(data);

            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return Task.FromResult<object>(null);
        }

        async Task<object> AddRs(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Name, out var name) &&
                json.TryGetValue(Data, out var data))
            {
                var be = new EdwBulkEvent();
                be.AddRS(EdwBulkEvent.EdwType.Immediate, sessionId, DateTime.UtcNow, 
                    PL.FromJsonString(JsonWrapper.Serialize(data)), 
                    GetOrCreateRsId(sessionId, name.ToString()));
                
                await _fw.EdwWriter.Write(be);

                _cache.Set($"{sessionId}:{Rs}:{name}", data);
            }

            return null;
        }

        Task<object> GetEvent(HttpContext context)
        {
            var sessionId = GetOrCreateSessionId(context);
            var reportingSession = context.Request.Query[ReportingSession];

            if (_cache.TryGetValue($"{sessionId}:{Event}:{reportingSession}", out var data))
                return Task.FromResult(data);

            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return Task.FromResult<object>(null);
        }

        async Task<object> AddEvent(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(ReportingSessions, out var reportingSessions) &&
                json.TryGetValue(Data, out var data))
            {
                var rsids = new Dictionary<string, object>();
                foreach (var reportingSession in reportingSessions.ToObject<string[]>())
                    rsids.Add(reportingSession, GetOrCreateRsId(sessionId, reportingSession));

                var be = new EdwBulkEvent();
                var pl = PL.FromJsonString(JsonWrapper.Serialize(data));
                be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids, null, pl);
                await _fw.EdwWriter.Write(be);

                foreach (var kv in rsids)
                    _cache.Set($"{sessionId}:{Event}:{kv.Key}", data);
            }

            return null;
        }

        Task<object> GetCache(HttpContext context)
        {
            var sessionId = GetOrCreateSessionId(context);
            var name = context.Request.Query[Name];

            if (_cache.TryGetValue($"{sessionId}:{name}", out var data))
                return Task.FromResult(data);

            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return Task.FromResult<object>(null);
        }

        async Task<object> AddCache(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue(Name, out var name) &&
                json.TryGetValue(Data, out var data))
            {
                _cache.Set($"{sessionId}:{name}", data);
            }

            return null;
        }
    }
}
