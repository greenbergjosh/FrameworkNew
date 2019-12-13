using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json.Linq;
using System;
using System.Collections;
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

        private static readonly TimeSpan SessionTimeout = TimeSpan.FromSeconds(300);

        private readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
        private readonly Dictionary<string, Func<HttpContext, Task<object>>> _routes =
            new Dictionary<string, Func<HttpContext, Task<object>>>();

        private const string SessionId = "sessionId";
        private const string Session = "session";
        private const string Data = "data";
        private const string Type = "type";
        private const string Sf = "sf";
        private const string Rs = "rs";
        private const string Ev = "ev";
        private const string Cf = "cf";
        private const string Es = "es";
        private const string St = "st";
        private const string ConfigId = "configId";
        private const string KeyPrefix = "keyPrefix";
        private const string SfName = "__sfName";
        private const string Key = "key";
        private const string Whep = "whep";
        private const string AddToWhep = "addToWhep";
        private const string IncludeWhep = "includeWhep";
        private const string NewStack = "newStack";
        private const string OldStack = "oldStack";
        private const string OnPop = "onPop";
        private const string OnPush = "onPush";
        private const string When = "when";
        private const string WhenDuplicate = "whenDuplicate";
        private const string WhenSessionTimeout = "whenSessionTimeout";
        private const string Count = "__count";

        public void Config(FrameworkWrapper fw)
        {
            _fw = fw;

            _routes.Add($"/{Cf}", Config);
            _routes.Add($"/{Ev}", PublishEvents);
            _routes.Add($"/{Es}", EndSession);
            _routes.Add($"/edwid", GetSessionId);
        }

        public async Task Run(HttpContext context)
        {
            try
            {
                var result = await ExecuteRequest(context);

                if (!context.Request.Headers.TryGetValue("origin", out var origin))
                    origin = "*";

                context.Response.ContentType = MediaTypeNames.Application.Json;
                context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
                context.Response.Headers.Add("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                context.Response.Headers.Add("Access-Control-Allow-Credentials", "true");
                context.Response.Headers.Add("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate, proxy-revalidate");

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

            var session = GetOrCreateSession(context, json);

            if (json.TryGetValue(Data, out var data) && data.Type == JTokenType.Object)
            {
                var result = new JObject();
                var obj = (JObject)data;

                var oldStack = GetOldStack(session);

                var stackFrames = new List<string>();
                if (obj.TryGetValue(St, out var sfList) && sfList.Type == JTokenType.Object)
                {
                    var stResults = new JObject();
                    result[St] = stResults;

                    foreach (var (key, value) in (JObject)sfList)
                    {
                        var sfConfig = (JObject)value;
                        JObject prefixConfig = null;
                        if (sfConfig.TryGetValue(KeyPrefix, out var keyPrefix))
                            prefixConfig = JObject.FromObject(new Dictionary<string, object> { [KeyPrefix] = keyPrefix });
                        var (name, _) = await GetOrCreateStackFrame(session, key, prefixConfig, stackFrames);
                        var (_, jToken) = await SetStackFrame(context, session, name, sfConfig);
                        stackFrames.Add(name);
                        stResults[name] = jToken;
                    }
                }

                var newStack = BuildStack(session, stackFrames);
                
                if (obj.TryGetValue(Rs, out var rsList) && rsList.Type == JTokenType.Object)
                {
                    var rsResults = new JObject();
                    result[Rs] = rsResults;

                    foreach (var (key, value) in (JObject)rsList)
                    {
                        var rsConfig = (JObject)value;
                        var type = rsConfig[Type].ToString();
                        var configId = Guid.Parse(rsConfig[ConfigId].ToString());
                        var rsId = rsConfig.ContainsKey("id") ? rsConfig["id"].ToString() : null;
                        var (_, jToken) = await GetOrCreateRs(context, session, oldStack, newStack, key, type, configId, rsId, rsConfig[Data]);
                        rsResults[key] = jToken;
                    }
                }

                var poppedEvents = await PopStackFrames(context, session, oldStack, newStack, false);
                var pushedEvents = await PushStackFrames(context, session, oldStack, newStack);

                result[OnPop] = JArray.FromObject(poppedEvents);
                result[OnPush] = JArray.FromObject(pushedEvents);

                if (obj.TryGetValue(Ev, out var evList) && evList.Type == JTokenType.Array)
                {
                    var events = await PublishEvents(context, session, oldStack, newStack, evList, false);
                    result[Ev] = JArray.FromObject(events);
                }

                await SetStackFrame(context, session, Session, JObject.FromObject(new Dictionary<string, object>
                {
                    [OldStack] = stackFrames.ToArray(),
                    [NewStack] = stackFrames.ToArray()
                }));

                return JsonWrapper.Serialize(result);
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private static bool AddEventTo(Session session, JObject evObj, Stack newStack, string propertyName)
        {
            if (!evObj.TryGetValue(propertyName, out var addTo) || addTo.Type != JTokenType.Boolean ||
                !addTo.ToObject<bool>()) return false;

            evObj.Remove(propertyName);
            var sfName = newStack.Last().Key;
            var sfData = JObject.FromObject(new Dictionary<string, object>
            {
                [propertyName] = new JArray { evObj }
            });

            DelegateEvent(session, sfName, sfData, propertyName);
            return true;
        }

        private async Task<List<object>> PublishEvents(
            HttpContext context, Session session, 
            Stack oldStack, Stack newStack, IEnumerable<JToken> evList, bool isSessionTimeout)
        {
            var evResults = new List<object>();

            foreach (var ev in evList)
            {
                var evObj = (JObject)ev;
                var evData = (JObject)evObj[Data];
                var evKey = (JArray)evObj[Key];

                var addToWhep = false;
                var includeWhep = false;
                JObject duplicate = null;
                JArray when = null;
                string[] rsNames = null;

                if (AddEventTo(session, evObj, newStack, OnPush))
                    continue;

                if (AddEventTo(session, evObj, newStack, OnPop))
                    continue;

                if (evObj.TryGetValue(WhenSessionTimeout, out var rawWhenSessionTimeout) &&
                    rawWhenSessionTimeout.Type == JTokenType.Boolean &&
                    isSessionTimeout != rawWhenSessionTimeout.ToObject<bool>())
                    continue;

                if (evObj.TryGetValue(When, out var rawWhen) && rawWhen.Type == JTokenType.Array)
                    when = (JArray)rawWhen;

                if (evObj.TryGetValue(AddToWhep, out var rawAddToWhep) && rawAddToWhep.Type == JTokenType.Boolean)
                    addToWhep = rawAddToWhep.ToObject<bool>();

                if (evObj.TryGetValue(IncludeWhep, out var rawIncludeWhep) && rawIncludeWhep.Type == JTokenType.Boolean)
                    includeWhep = rawIncludeWhep.ToObject<bool>();

                if (evObj.TryGetValue(WhenDuplicate, out var rawWhenDuplicate) && rawWhenDuplicate.Type == JTokenType.Object)
                    duplicate = (JObject)rawWhenDuplicate;

                if (evObj.TryGetValue(Rs, out var rawRsNames) && rawRsNames.Type == JTokenType.Array)
                    rsNames = rawRsNames.ToObject<string[]>();

                var evResult = await PublishEvent(context, session, oldStack, newStack, evKey.ToObject<string[]>(), 
                    evData, addToWhep, includeWhep, duplicate, when, rsNames);
                if (evResult != null)
                    evResults.Add(evResult);
            }

            return evResults;
        }

        private static int DiffStacks(Stack oldStack, Stack newStack)
        {
            var diffIndex = 0;
            for (; diffIndex < oldStack.Count; diffIndex++)
            {
                if (newStack.Count < diffIndex + 1 ||
                    oldStack[diffIndex].Key != newStack[diffIndex].Key)
                    break;
            }

            return diffIndex;
        }

        private async Task<List<object>> PopStackFrames(
            HttpContext context, Session session, Stack oldStack, Stack newStack, bool isSessionTimeout)
        {
            var evResults = new List<object>();
            
            if (!oldStack.Any())
                return evResults;

            var diffIndex = DiffStacks(oldStack, newStack);
            var oldStackCount = oldStack.Count;

            while (oldStackCount > diffIndex)
            {
                var oldStackFrame = oldStack[oldStackCount - 1].Key;
                var onPop = session.Get<JObject>($"{session.Id}:{Sf}:{oldStackFrame}:{OnPop}");
                if (onPop != null)
                {
                    var subStack = oldStack.Range(oldStackCount);
                    var evList = onPop.Properties().Select(p => p.Value).ToArray();
                    var poppedEvents = await PublishEvents(context, session, subStack, newStack, evList, isSessionTimeout);
                    evResults.AddRange(poppedEvents);
                }

                oldStackCount--;
            }

            return evResults;
        }

        private async Task<List<object>> PushStackFrames(HttpContext context, Session session, Stack oldStack, Stack newStack)
        {
            var evResults = new List<object>();
            var diffIndex = DiffStacks(newStack, oldStack);

            for (var i = diffIndex; i < newStack.Count; i++)
            {
                var newStackFrame = newStack[i].Key;
                newStack.IncrementPushCount(session, newStackFrame);

                var onPush = session.Get<JObject>($"{session.Id}:{Sf}:{newStackFrame}:{OnPush}");
                if (onPush == null) continue;

                var subStack = newStack.Range(i + 1);
                var evList = onPush.Properties().Select(p => p.Value).ToArray();
                var pushedEvents = await PublishEvents(context, session, subStack, newStack, evList, false);
                evResults.AddRange(pushedEvents);
            }

            return evResults;
        }

        private async Task<object> GetSessionId(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = string.IsNullOrEmpty(body) 
                ? new JObject()
                : (JObject)JsonWrapper.TryParse(body);

            var session = GetOrCreateSession(context, json, true);
            var rsListKey = $"{session.Id}:{Rs}";
            var rsList = session.GetOrCreate(rsListKey, () => new List<(string, Guid)>());
            var rsIds = new JObject();
            foreach (var kv in rsList)
                rsIds[kv.Item1] = kv.Item2.ToString();
            var response = session != null ? new { edwid = session.Id.ToString(), rsIds } : null;
            return JsonWrapper.Serialize(response);
        }

        private Session GetOrCreateSession(HttpContext context, JObject json, bool onlyGet = false)
        {
            var cookieOptions = new CookieOptions
            {
                MaxAge = TimeSpan.FromSeconds(2592000),
                HttpOnly = true,
                Secure = context.Request.IsHttps,
                SameSite = SameSiteMode.None,
                IsEssential = true
            };

            Guid sessionId;

            if (context.Request.Cookies.TryGetValue(SessionId, out var cookieSessionId))
            {
                sessionId = Guid.Parse(cookieSessionId);
            }
            else if (json.TryGetValue(SessionId, out var raw) &&
                Guid.TryParse(raw?.ToString(), out var sid))
            {
                sessionId = sid;
            }
            else if (onlyGet)
            {
                return null;
            }
            else
            {
                sessionId = Guid.NewGuid();
            }
            
            context.Response.Cookies.Append(SessionId, sessionId.ToString(), cookieOptions);
            return new Session(_cache, sessionId, ExtendSession(context, sessionId));
        }

        private CancellationToken ExtendSession(HttpContext context, Guid sessionId)
        {
            var tokens = _cache.GetOrCreate($"{sessionId}", e => {
                var cts = new CancellationTokenSource();
                var ctsKey = new CancellationTokenSource();
                e.AddExpirationToken(new CancellationChangeToken(cts.Token))
                 .RegisterPostEvictionCallback(async (key, value, reason, state) =>
                 {
                     if (reason != EvictionReason.TokenExpired)
                         return;

                     Debug.WriteLine(key);

                     var session = new Session(_cache, sessionId, ctsKey.Token);
                     var stackFrames = new[] { Session };
                     var oldStack = GetOldStack(session);
                     var newStack = BuildStack(session, stackFrames);

                     if (newStack.Any())
                         await PopStackFrames(context, session, oldStack, newStack, true);

                     cts.Dispose();
                     ctsKey.Cancel();
                     ctsKey.Dispose();
                 });
                return (cts, ctsKey);
            });
            tokens.cts.CancelAfter(SessionTimeout);
            return tokens.ctsKey.Token;
        }

        private Stack GetOldStack(Session session)
        {
            var sessionStack = BuildStack(session, new []{Session});
            var (s, dictionary) = sessionStack.SingleOrDefault(kv => kv.Key == Session);
            if (s != Session ||
                !dictionary.TryGetValue(OldStack, out var oldStackToken))
                oldStackToken = new JArray();

            var oldStack = BuildStack(session, oldStackToken.ToObject<string[]>());
            return oldStack;
        }

        private async Task<object> EndSession(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var session = GetOrCreateSession(context, json);
            var newStack = BuildStack(session, new[] { Session });
            var oldStack = GetOldStack(session);
            var result = await PopStackFrames(context, session, oldStack, newStack, false);
            var key = $"{session.Id}";
            var (cts, ctsKey) = _cache.Get<(CancellationTokenSource cts, CancellationTokenSource ctsKey)>(key);
            _cache.Remove(key);
            cts.Dispose();
            ctsKey.Cancel();
            ctsKey.Dispose();
            return JsonWrapper.Serialize(result);
        }

        private async Task<(string Json, JToken Data)> GetOrCreateRs(HttpContext context,
            Session session, Stack oldStack, Stack newStack,
            string name, string type, Guid configId, string rsId, JToken data)
        {
            var rsListKey = $"{session.Id}:{Rs}";
            var rsKey = $"{session.Id}:{Rs}:{name}";

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

            TransformData(context, session, oldStack, newStack, newStack.Select(pair => pair.Key).LastOrDefault(), data);

            var edwType = Enum.Parse<EdwBulkEvent.EdwType>(type);
            var be = new EdwBulkEvent();
            var pl = PL.FromJsonString(JsonWrapper.Serialize(data));
            var rsid = string.IsNullOrEmpty(rsId) ? Guid.NewGuid() : Guid.Parse(rsId);
            be.AddRS(edwType, rsid, DateTime.UtcNow, pl, configId);

            await _fw.EdwWriter.Write(be);

            var rsList = session.GetOrCreate(rsListKey, () => new List<(string, Guid)>());
            if (rsList.All(tuple => tuple.Item1 != name))
                rsList.Add((name, rsid));

            var result = JsonWrapper.Serialize(new JObject
            {
                [Data] = data,
                [Type] = type
            });
            session.Set(rsKey, result);

            return (result, data);
        }

        private Stack BuildStack(Session session, IEnumerable<string> stackFrames)
        {
            var stack = new Stack();
            foreach (var stackFrame in stackFrames)
            {
                if (!_cache.TryGetValue<string>($"{session.Id}:{Sf}:{stackFrame}", out var serializedScope))
                    continue;

                var sf = new StackFrameParser(serializedScope);
                stack.AddStackFrame(stackFrame, sf.ToDictionary());
            }
            return stack;
        }

        private static List<string> ExtractWhepFromStack(Stack stack)
        {
            return stack
                .SkipLast(1)
                .Where(sf => sf.Value.ContainsKey(Whep))
                .SelectMany(sf => sf.Value[Whep].ToObject<string[]>())
                .ToList();
        }

        private Dictionary<string, object> GetRsIds(Guid sessionId, string[] rsNames)
        {
            var rsListKey = $"{sessionId}:{Rs}";
            var cache = _cache.Get<List<(string Name, Guid Id)>>(rsListKey);
            var cachedRs = cache == null 
                ? new Dictionary<string, object>() 
                : cache.ToDictionary(rs => rs.Name, rs => (object)rs.Id);
            if (rsNames == null || rsNames.Length == 0)
                return cachedRs;
            return cachedRs.Where(kv => rsNames.Contains(kv.Key)).ToDictionary(kv => kv.Key, kv => kv.Value);
        }

        private async Task<object> PublishEvents(HttpContext context)
        {
            var body = await context.GetRawBodyStringAsync();
            var json = (JObject)JsonWrapper.TryParse(body);

            var session = GetOrCreateSession(context, json);
            if (json.TryGetValue(Data, out var data) && data is JArray evList)
            {
                var stack = GetOldStack(session);
                var result = await PublishEvents(context, session, stack, stack, evList, false);
                return JsonWrapper.Serialize(result);
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return null;
        }

        private static (string stackAge, string preName, string name) ExtractNames(string value)
        {
            var nameParts = value.Split('.');
            var stackAge = NewStack;
            string preName = null;
            string name;
            switch (nameParts.Length)
            {
                case 3:
                    stackAge = nameParts[0];
                    preName = nameParts[1];
                    name = nameParts[2];
                    break;
                case 2:
                    preName = nameParts[0];
                    name = nameParts[1];
                    break;
                case 1:
                    name = nameParts[0];
                    break;
                default:
                    throw new InvalidOperationException($"Invalid variable stackFrameName {value}.");
            }

            if (string.IsNullOrEmpty(name))
                throw new InvalidOperationException($"Invalid variable stackFrameName {name}.");

            return (stackAge, preName, name);
        }

        private static bool EvaluatePredicate(IEnumerable when, Stack oldStack, Stack newStack, JObject data)
        {
            if (when == null)
                return true;

            foreach (var condition in when.OfType<JObject>())
            {
                if (!condition.TryGetValue("var", out var varName) || !condition.TryGetValue("in", out var rawIn) ||
                    !(rawIn is JArray inValues)) continue;

                var (stackAge, preName, name) = ExtractNames(varName.ToString());

                if (preName == Ev)
                {
                    if (!data.TryGetValue(name, out var value) || 
                        value == null || 
                        !inValues.ToObject<string[]>().Contains(value.ToString()))
                        return false;
                }
                else
                {
                    var stack = GetStackByAge(oldStack, newStack, stackAge);

                    if (!string.IsNullOrEmpty(preName))
                    {
                        if (!stack.TryGetStackFrameValue(preName, name, out var value) ||
                            value == null ||
                            !inValues.ToObject<string[]>().Contains(value.ToString()))
                            return false;
                    }
                    else
                    {
                        if (!stack.TryGetValue(name, out var value) ||
                            value == null ||
                            !inValues.ToObject<string[]>().Contains(value.ToString()))
                            return false;
                    }
                }
            }

            return true;
        }

        private static string ComputeEventKey(IEnumerable<string> keyParts, JObject data)
        {
            var keyValues = new List<string>();
            foreach (var keyPart in keyParts)
            {
                if (data.TryGetValue(keyPart, out var keyValue))
                    keyValues.Add($"{keyPart}:{keyValue}");
                else
                    throw new InvalidOperationException($"Data does not contain keyPart \"{keyPart}\".");
            }

            var key = string.Join(",", keyValues);
            return key;
        }

        private async Task<object> PublishEvent(
            HttpContext context,
            Session session,
            Stack oldStack, Stack newStack,
            IEnumerable<string> keyParts, JObject data, 
            bool addToWhep, bool includeWhep, JObject duplicate, IEnumerable when, string[] rsNames)
        {
            TransformData(context, session, oldStack, newStack, newStack.Last().Key, data);

            if (!EvaluatePredicate(when, oldStack, newStack, data))
                return null;

            // Get last newStack frame and get/create event dictionary.
            var stackFrame = newStack.Last().Value;
            JObject publishedEvents;
            if (stackFrame.TryGetValue(Ev, out var rawPublishedEvents) && rawPublishedEvents.Type == JTokenType.Object)
                publishedEvents = (JObject)rawPublishedEvents;
            else
                publishedEvents = new JObject();

            // look for event key in event dictionary.
            var key = ComputeEventKey(keyParts, data);
            var eventPresent = publishedEvents.TryGetValue(key, out var count);

            // If event key was already published and no duplicate info is passed, do not publish.
            if (eventPresent && duplicate == null)
                return null; // TODO: return last event?

            // Add duplicate data if available
            if (eventPresent)
            {
                foreach (var (s, value) in duplicate)
                    data[s] = value;
            }

            var rsids = GetRsIds(session.Id, rsNames);
            var eventId = Guid.NewGuid();
            List<string> whep = null;
            var sfData = new Dictionary<string, object>
            {
                { Ev, publishedEvents }
            };

            // include whep data in new event.
            if (includeWhep)
                whep = ExtractWhepFromStack(newStack);

            if (count == null)
                count = 1;
            else
                count = int.Parse(count.ToString()) + 1;

            publishedEvents[key] = count;
            data[Count] = count;

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
            
            var be = new EdwBulkEvent();
            var pl = PL.FromJsonString(JsonWrapper.Serialize(data));
            be.AddEvent(eventId, DateTime.UtcNow, rsids, whep, pl);
            await _fw.EdwWriter.Write(be);

            var jObj = JObject.FromObject(sfData);
            await SetStackFrame(context, session, newStack.Last().Key, jObj);

            // Update memory
            foreach (var (s, value) in jObj)
                stackFrame[s] = value;

            return data;
        }

        private static void DelegateEvent(Session session, string stackFrameName, JObject stackData, string propertyName)
        {
            if (!stackData.TryGetValue(propertyName, out var rawOnPush) || !(rawOnPush is JArray onPushOrPop)) 
                return;

            var evDictionary = session.Get<JObject>($"{session.Id}:{Sf}:{stackFrameName}:{propertyName}") ?? new JObject();

            foreach (var ev in onPushOrPop)
            {
                var keyParts = ((JArray)((JObject)ev)[Key]).ToObject<string[]>();
                var key = ComputeEventKey(keyParts, (JObject)((JObject)ev)[Data]);
                evDictionary[key] = ev;
            }

            session.Set($"{session.Id}:{Sf}:{stackFrameName}:{propertyName}", evDictionary);
            stackData.Remove(propertyName);
        }

        private static Task<(string Json, JToken Data)> SetStackFrame(HttpContext context, Session session, string stackFrameName, JToken data)
        {
            if (data is JObject obj)
            {
                DelegateEvent(session, stackFrameName, obj, OnPush);
                DelegateEvent(session, stackFrameName, obj, OnPop);
            }

            TransformData(context, session, null, null, stackFrameName, data);
            var serializedScope = session.GetOrCreate($"{session.Id}:{Sf}:{stackFrameName}", () => JsonWrapper.Serialize(new JObject()));
            var scopeStack = new StackFrameParser(serializedScope);
            scopeStack.Apply(((JObject)data).Properties().ToDictionary(t => t.Name, t => t.Value));
            var jsonStack = scopeStack.Json();
            serializedScope = JsonWrapper.Serialize(jsonStack);
            session.Set($"{session.Id}:{Sf}:{stackFrameName}", serializedScope);
            return Task.FromResult((serializedScope, jsonStack));
        }

        private Task<(string Name, string Json)> GetOrCreateStackFrame(
            Session session, 
            string name, JToken data, IEnumerable<string> stackFrames)
        {
            if (data != null &&
                data is JObject obj)
            {
                if (obj.TryGetValue(KeyPrefix, out var rawKeyPrefix))
                {
                    var keyPrefix = rawKeyPrefix.ToString();
                    var invertedStackFrames = stackFrames.Reverse().ToList();
                    if (invertedStackFrames.All(sf => sf != keyPrefix))
                    {
                        foreach (var sf in invertedStackFrames)
                        {
                            var (_, value) = BuildStack(session, new[] { sf }).First();
                            if (!value.TryGetValue(SfName, out var n) || n.ToString() != keyPrefix)
                                continue;
                            keyPrefix = sf;
                            break;
                        }
                    }

                    var newName = $"{keyPrefix}/{name}";
                    obj[SfName] = name;
                    name = newName;
                }
            }

            var stackFrame = session.GetOrCreate($"{session.Id}:{Sf}:{name}", 
                () => JsonWrapper.Serialize(data ?? new JObject()));

            return Task.FromResult((name, stackFrame));
        }

        private static void TransformData(HttpContext context, Session session, Stack oldStack, Stack newStack, string stackFrame, JToken data)
        {
            if (data.Type != JTokenType.Object)
                return;

            var obj = (JObject)data;
            var toRemove = new List<string>();
                
            foreach (var kv in obj.Properties().ToList())
            {
                if (kv.Value.Type != JTokenType.String)
                    continue;

                var str = (string)kv.Value;
                var key = $"{session.Id}:{stackFrame}:{kv.Name}";

                if (ParseHeaders(context, obj, kv, str)) continue;
                if (ParseCounter(session, key, obj, kv, str)) continue;
                if (ParseAccumulator(session, key, obj, kv, str, toRemove)) continue;
                ParseStackAccess(kv, str, oldStack, newStack, obj);
            }

            foreach (var rm in toRemove)
                obj.Remove(rm);
        }

        private static bool ParseAccumulator(
            Session session, string key, JObject obj, 
            JProperty property, string str, ICollection<string> toRemove)
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
                var values = (JArray)JsonWrapper.TryParse(session.GetOrCreate(key, () => "[]"));

                if (count > 0 && !last && values.Count >= count)
                {
                    obj[property.Name] = values;
                    return true;
                }

                var strVal = variable.ToString();
                if (distinct && values.Any(t => t.Value<string>() == strVal))
                {
                    obj[property.Name] = values;
                    return true;
                }

                if (last && count > 0 && values.Count >= count)
                    values.RemoveAt(0);

                values.Add(variable);

                session.Set(key, JsonWrapper.Serialize(values));
                obj[property.Name] = values;
            }
            else
            {
                toRemove.Add(property.Name);
            }

            return true;
        }

        private static bool ParseCounter(Session session, string key, JObject obj, JProperty property, string str)
        {
            if (str != "0+")
                return false;

            var value = session.GetOrCreate(key, () => 0);
            value++;
            session.Set(key, value);
            obj[property.Name] = value;

            return true;
        }

        private static bool ParseHeaders(HttpContext context, JObject obj, JProperty property, string str)
        {
            if (!(str.StartsWith("[") && str.EndsWith("]")))
                return false;

            var headerName = str.Substring(1, str.Length - 2);

            if (headerName == "ip")
            {
                obj[property.Name] = context.Connection.RemoteIpAddress.ToString();
            }
            else if (context.Request.Headers.TryGetValue(headerName, out var value))
            {
                if (value.Count == 0)
                    obj.Remove(property.Name);
                else
                    obj[property.Name] = value[0];
            }
            else
                obj.Remove(property.Name);

            return true;
        }

        private static void ParseStackAccess(JProperty property, string str, Stack oldStack, Stack newStack, JObject data)
        {
            if (newStack == null && oldStack == null || !(str.StartsWith("{") && str.EndsWith("}")))
                return;
            
            var varName = str.Substring(1, str.Length - 2);
            JToken value = null;

            var (stackAge, preName, name) = ExtractNames(varName);

            if (preName == Ev)
            {
                data.TryGetValue(name, out value);
            }
            else
            {
                var stack = GetStackByAge(oldStack, newStack, stackAge);
                if (stack != null)
                {
                    if (!string.IsNullOrEmpty(preName))
                        stack.TryGetStackFrameValue(preName, name, out value);
                    else
                        stack.TryGetValue(name, out value);
                }
            }

            if (value == null)
                data.Remove(property.Name);
            else
                data[property.Name] = value;
        }

        private static Stack GetStackByAge(Stack oldStack, Stack newStack, string stackAge)
        {
            Stack stack;
            switch (stackAge)
            {
                case OldStack:
                    stack = oldStack;
                    break;

                case NewStack:
                    stack = newStack;
                    break;

                default:
                    throw new InvalidOperationException($"Invalid newStack stackFrameName {stackAge}.");
            }

            return stack;
        }
    }
}
