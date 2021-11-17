using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Utility;
using Utility.EDW.Reporting;
using Utility.Entity;

namespace SignalApiLib.SourceHandlers
{
    public class ConsoleFeed : ISourceHandler
    {
        private readonly FrameworkWrapper _fw;
        private const string Conn = "Signal";
        private readonly string _logCtx = $"{nameof(ConsoleFeed)}.{nameof(HandleRequest)}";
        private readonly string _defaultFailureResponse = JsonSerializer.Serialize(new { Result = "Failure" });

        public ConsoleFeed(FrameworkWrapper fw) => _fw = fw;

        public async Task<string> HandleRequest(string requestFromPost, HttpContext ctx)
        {
            var result = JsonSerializer.Serialize(new { Error = "SeeLogs" });

            requestFromPost = requestFromPost.Replace("\u0000", "");

            if (await _fw.Entity.TryParse("application/json", requestFromPost) == (false, null))
            {
                var body = requestFromPost ?? "<null>";
                if (string.IsNullOrWhiteSpace(body))
                {
                    body = "<empty>";
                }

                await _fw.Error(_logCtx, $"Invalid post body: {body} queryString: {ctx.Request.QueryString.Value}");
                return result;
            }

            string m = ctx.Request.Query["m"];

            try
            {
                switch (m)
                {
                    case "OnPointConsoleLiveFeed":
                        result = await SaveLiveFeed(requestFromPost);
                        break;
                    case "OnPointConsoleLiveEmailEvent":
                        result = await SaveEmailEvent(requestFromPost);
                        break;
                    default:
                        await _fw.Error(_logCtx, $"Unknown request: Method: {m ?? "null"}\r\nBody: {requestFromPost}");
                        break;
                }
            }
            catch (Exception ex)
            {
                await _fw.Error(_logCtx, $@"Method: {m}\r\nBody: {requestFromPost}\r\n{ex.UnwrapForLog()}");
            }

            return result;
        }

        private static Guid _rsConfigId = Guid.Parse("633035ea-b346-4ab3-9472-ae48a2272c45");

        public async Task<string> SaveLiveFeed(string request)
        {
            var result = _defaultFailureResponse;

            try
            {
                var lead = await _fw.Entity.Parse("application/json", request);

                DateTime? dob = null;
                var dobYear = await lead.EvalI("dob_year", 0);
                var dobMonth = await lead.EvalI("dob_month", 0);
                var dobDay = await lead.EvalI("dob_day");

                if (dobYear != 0 && dobMonth != 0 && dobDay != 0)
                {
                    dob = DateTime.Parse($"{dobMonth}/{dobDay}/{dobYear}");
                }

                var dateAcquired = await lead.EvalE("datetime_collected");

                var payload = new
                {
                    email = await lead.EvalS("email", null),
                    date_acquired = dateAcquired.ValueType == EntityValueType.Object ? await dateAcquired.EvalS("$date") : await dateAcquired.EvalAsS(),
                    first_name = await lead.EvalS("first_name", null),
                    last_name = await lead.EvalS("last_name", null),
                    gender = await lead.EvalS("gender", null),
                    dob,
                    zip = await lead.EvalS("zip_code", null),
                    address1 = await lead.EvalS("address1", null),
                    city = await lead.EvalS("city", null),
                    state = await lead.EvalS("state", null),
                    opt_in_ip = await lead.EvalS("user_ip", null),
                    opt_in_domain = Regex.Replace(await lead.EvalS("domain"), "^(www\\.)?", ""),
                    user_agent = await lead.EvalS("user_agent", null),
                    phone = await lead.EvalS("phone_home", null),
                    household_income = await lead.EvalS("household_income", null),
                    attribution_id = 3,
                    record_type_id = 4
                };

                var consoleEvent = new EdwBulkEvent();
                consoleEvent.AddEvent(Guid.NewGuid(), DateTime.UtcNow, new Dictionary<Guid, (Guid, DateTime)>() { [_rsConfigId] = (default, default) }, payload);

                _ = await _fw.EdwWriter.Write(consoleEvent);
            }
            catch (Exception e)
            {
                await _fw.Error($"{_logCtx}.{nameof(SaveLiveFeed)}", $"EDW event write failed {e.UnwrapForLog()}\r\nBody: {request}");
            }

            return result;
        }

        public async Task<string> SaveEmailEvent(string request)
        {
            var result = _defaultFailureResponse;

            try
            {
                var lead = await _fw.Entity.Parse("application/json", request);

                var key = ((await lead.EvalS("type")).ToLower(), await lead.EvalB("valid"));

                var recordTypeId = key switch
                {
                    ("open", _) => (int?)5,
                    ("click", _) => 6,
                    ("unsub", _) => null,
                    ("fbl", _) => 11,
                    ("bounce", _) => 10,
                    ("dnt", _) => 31,
                    ("smsclick", _) => 32,
                    ("jornaya", true) => 33,
                    ("jornaya", false) => 34,
                    _ => null
                };

                var payload = new
                {
                    email = await lead.EvalS("email", null),
                    date_acquired = DateTime.UtcNow,
                    attribution_id = 3,
                    record_type_id = recordTypeId
                };

                var consoleEvent = new EdwBulkEvent();
                consoleEvent.AddEvent(Guid.NewGuid(), DateTime.UtcNow, new Dictionary<Guid, (Guid, DateTime)>() { [_rsConfigId] = (default, default) }, payload);

                _ = await _fw.EdwWriter.Write(consoleEvent);
            }
            catch (Exception e)
            {
                await _fw.Error($"{_logCtx}.{nameof(SaveLiveFeed)}", $"EDW event write failed {e.UnwrapForLog()}\r\nBody: {request}");
            }

            return result;
        }
    }
}