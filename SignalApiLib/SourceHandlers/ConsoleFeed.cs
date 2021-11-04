using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.EDW.Reporting;
using Jw = Utility.JsonWrapper;

namespace SignalApiLib.SourceHandlers
{
    public class ConsoleFeed : ISourceHandler
    {
        private readonly FrameworkWrapper _fw;
        private const string Conn = "Signal";
        private readonly string _logCtx = $"{nameof(ConsoleFeed)}.{nameof(HandleRequest)}";
        private readonly string _defaultFailureResponse = Jw.Serialize(new { Result = "Failure" });

        public ConsoleFeed(FrameworkWrapper fw) => _fw = fw;

        public async Task<string> HandleRequest(string requestFromPost, HttpContext ctx)
        {
            var result = Jw.Json(new { Error = "SeeLogs" });

            requestFromPost = requestFromPost.Replace("\u0000", "");

            if (Jw.TryParseObject(requestFromPost) == null)
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

            //try
            //{
            //    var res = await Data.CallFn(Conn, "consoleLiveFeed", payload: request);

            //    if (res?.GetS("Result") != "Success") await _fw.Error($"{_logCtx}.{nameof(SaveLiveFeed)}", $"DB write failed. Response: {res}\r\nBody: {request}");
            //    else result = Jw.Serialize(new { Result = "Success" });
            //}
            //catch (Exception e)
            //{
            //    await _fw.Error($"{_logCtx}.{nameof(SaveLiveFeed)}", $"DB write failed {e.UnwrapForLog()}\r\nBody: {request}");
            //}

            try
            {
                var lead = JObject.Parse(request);

                DateTime? dob = null;
                if (lead["dob_year"] != null && lead["dob_month"] != null && lead["dob_day"] != null)
                {
                    dob = DateTime.Parse($"{lead["dob_month"]}/{lead["dob_day"]}/{lead["dob_year"]}");
                }

                var payload = new
                {
                    email = lead["email"],
                    date_acquired = lead["datetime_collected"].Type == JTokenType.Object ? lead["datetime_collected"]["$date"] : lead["datetime_collected"],
                    first_name = lead["first_name"],
                    last_name = lead["last_name"],
                    gender = lead["gender"],
                    dob,
                    zip = lead["zip_code"],
                    address1 = lead["address1"],
                    city = lead["city"],
                    state = lead["state"],
                    opt_in_ip = lead["user_ip"],
                    opt_in_domain = Regex.Replace(lead["domain"].Value<string>(), "^(www\\.)?", ""),
                    user_agent = lead["user_agent"],
                    phone = lead["phone_home"],
                    household_income = lead["household_income"],
                    attribution_id = 3,
                    record_type_id = 4
                };

                var consoleEvent = new EdwBulkEvent();
                consoleEvent.AddEvent(Guid.NewGuid(), DateTime.UtcNow, new Dictionary<Guid, (Guid, DateTime)>() { [_rsConfigId] = (default, default) }, payload);

                System.Diagnostics.Debug.WriteLine(consoleEvent.ToString());

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

            //try
            //{
            //    var res = await Data.CallFn(Conn, "consoleEvent", payload: request);

            //    if (res?.GetS("Result") != "Success") await _fw.Error($"{_logCtx}.{nameof(SaveEmailEvent)}", $"DB write failed. Response: {res}\r\nBody: {request}");
            //    else result = Jw.Serialize(new { Result = "Success" });
            //}
            //catch (Exception e)
            //{
            //    await _fw.Error($"{_logCtx}.{nameof(SaveEmailEvent)}", $@"DB write failed {e.UnwrapForLog()}\r\nBody: {request}");
            //}

            try
            {
                var lead = JObject.Parse(request);

                var key = (lead["type"].Value<string>().ToLower(), lead["valid"]?.Value<bool>());

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
                    email = lead["email"],
                    date_acquired = DateTime.UtcNow,
                    attribution_id = 3,
                    record_type_id = recordTypeId
                };

                var consoleEvent = new EdwBulkEvent();
                consoleEvent.AddEvent(Guid.NewGuid(), DateTime.UtcNow, new Dictionary<Guid, (Guid, DateTime)>() { [_rsConfigId] = (default, default) }, payload);

                System.Diagnostics.Debug.WriteLine(consoleEvent.ToString());

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