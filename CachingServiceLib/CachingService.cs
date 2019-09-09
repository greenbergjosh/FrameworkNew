using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Utility;
using Utility.EDW.Reporting;

namespace CachingServiceLib
{
    public class CachingService
    {
        private FrameworkWrapper _fw;
        private Dictionary<string, Guid> _rsids;

        private readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
        private readonly Dictionary<string, (Func<HttpContext, Task<object>> get, Func<HttpContext, Task<object>> post)> _routes =
            new Dictionary<string, (Func<HttpContext, Task<object>>, Func<HttpContext, Task<object>>)>();

        public void Config(FrameworkWrapper fw)
        {
            _fw = fw;

            // Get this list from EDW
            _rsids = new Dictionary<string, Guid>()
            {
                ["progression"] = Guid.Parse("696F4248-7F96-4E9B-B39D-692A9621E295"),
                ["event1"] = Guid.Parse("696F4248-7F96-4E9B-B39D-692A9621E296"),
                ["event2"] = Guid.Parse("696F4248-7F96-4E9B-B39D-692A9621E297"),
            };

            _routes.Add("/rs", (GetRs, AddRs));
            _routes.Add("/event", (GetEvent, AddEvent));
            _routes.Add("/cache", (GetCache, AddCache));
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
                if (verb == "GET")
                    result = await actions.get(context);
                else if (verb == "POST")
                    result = await actions.post(context);
                else
                    result = "Method not supported";

                return result;
            }

            return "Path not found";
        }

        public async Task Run(HttpContext context)
        {
            try
            {
                var result = await ExecuteRequest(context);
                var json = JsonWrapper.Json(result);
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(json);
            }
            catch (Exception ex)
            {
                await _fw.Error(nameof(Run), $@"Caught exception processing request: {ex.Message} : {ex.UnwrapForLog()}");
            }
        }

        Guid GetOrCreateSessionId(HttpContext context)
        {
            if (context.Request.Query.TryGetValue("sessionId", out var sessionId))
                return Guid.Parse(sessionId);

            var newSessionId = Guid.NewGuid();
            context.Response.Cookies.Append("sessionId", newSessionId.ToString());
            return newSessionId;
        }

        Guid GetOrCreateSessionId(HttpContext context, JObject json)
        {
            if (json.TryGetValue("sessionId", out var raw) &&
                Guid.TryParse(raw.ToString(), out var sessionId))
                return sessionId;

            var newSessionId = Guid.NewGuid();
            context.Response.Cookies.Append("sessionId", newSessionId.ToString());
            return newSessionId;
        }

        Task<object> GetRs(HttpContext context)
        {
            var sessionId = GetOrCreateSessionId(context);
            var name = context.Request.Query["name"];

            if (_cache.TryGetValue($"{sessionId}:rs:{name}", out var data))
                return Task.FromResult(data);

            return Task.FromResult<object>(null);
        }

        async Task<object> AddRs(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue("name", out var name) &&
                json.TryGetValue("data", out var data))
            {
                var be = new EdwBulkEvent();
                be.AddRS(EdwBulkEvent.EdwType.Immediate, sessionId, DateTime.UtcNow, 
                    PL.FromJsonString(JsonWrapper.Serialize(data)), _rsids[name.ToString()]);
                
                await _fw.EdwWriter.Write(be);

                _cache.Set($"{sessionId}:rs:{name}", data);
            }

            return null;
        }

        Task<object> GetEvent(HttpContext context)
        {
            var sessionId = GetOrCreateSessionId(context);
            var reportingSession = context.Request.Query["reportingSession"];

            if (_cache.TryGetValue($"{sessionId}:event:{reportingSession}", out var data))
                return Task.FromResult(data);

            return Task.FromResult<object>(null);
        }

        async Task<object> AddEvent(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue("reportingSessions", out var reportingSessions) &&
                json.TryGetValue("data", out var data))
            {
                var rsids = new Dictionary<string, object>();
                foreach (var reportingSession in reportingSessions.ToObject<string[]>())
                {
                    if (_rsids.TryGetValue(reportingSession, out var rsid))
                        rsids.Add(reportingSession, rsid);
                }

                var be = new EdwBulkEvent();
                var pl = PL.FromJsonString(JsonWrapper.Serialize(data));
                be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids, null, pl);
                await _fw.EdwWriter.Write(be);

                foreach (var kv in rsids)
                {
                    _cache.Set($"{sessionId}:event:{kv.Key}", data);
                }
            }

            return null;
        }

        Task<object> GetCache(HttpContext context)
        {
            var sessionId = GetOrCreateSessionId(context);
            var name = context.Request.Query["name"];

            if (_cache.TryGetValue($"{sessionId}:{name}", out var data))
                return Task.FromResult(data);

            return Task.FromResult<object>(null);
        }

        async Task<object> AddCache(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var sessionId = GetOrCreateSessionId(context, json);
            if (json.TryGetValue("name", out var name) &&
                json.TryGetValue("data", out var data))
            {
                _cache.Set($"{sessionId}:{name}", data);
            }

            return null;
        }
    }
}
