using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.Dynamic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace QuickTester
{
    public class LbmTester
    {
        public static async Task<object> Do(FrameworkWrapper fw)
        {
            dynamic p = new ExpandoObject();

            // Standard LBM Proxy params
            p._fw = fw;
            p._payload = (IGenericEntity)null;
            p._lbmConfig = (IGenericEntity)null;
            p._httpContext = (HttpContext)null;
            p._identity = (string)null;

            // Other params
            p.email = (string)null;
            p.ip = (string)null;
            p.config = (IGenericEntity)null;

            #region bootstrap
            //            p._lbmConfig = Jw.JsonToGenericEntity(@"{
            //  ""LbmId"": ""91c1661a-fb18-4896-a7bf-bba4ce4bc20c"",
            //  ""ConnectionStrings"": {
            //    ""emailValidation.signal"": ""fcd03826-cffb-4b7d-a6e2-9b9c2b52c93f""
            //  },
            //  ""Providers"": {
            //    ""OPG"": ""a90569a1-56cf-4f99-a38b-7667e4487455"",
            //    ""EmailOversight"": ""467931c3-22f7-48d8-a2bf-427f3f16404b"",
            //    ""XVerify"": ""3a7486df-8d25-4783-8b85-03736e3b6e62""
            //  }
            //}");
            p._payload = Jw.ToGenericEntity(new
            {
                email = "abfkjhfc@gmail.com",
                providers = new object[] {
                    new {
                        provider = "OPG",
                        config = new {
                            groups = new[] { "Tier1"},
                            badWordProfiles = new[] { "BadWordConsole", "Role" }
                        }
                    },
                    //new { provider = "XVerify" },
                    //new { provider = "EmailOversight", config = new { listId = 5 } }
                }
            });


            #endregion

            p.config = Jw.ToGenericEntity(new
            {
                groups = new[] { "Tier1" },
                badWordProfiles = new[] { "BadWordConsole", "Role" }
            });

            #region lbmCode

            const string AppName = "EmailValidationLbm.OPG";
            Regex rxspl = new Regex("(?<!^)(?=[A-Z])", RegexOptions.Compiled);

            string email = (string)p.email;
            string ip = (string)p.ip;
            string source = p._payload.GetS("source");

            IGenericEntity config = (IGenericEntity)p.config;

            if (string.IsNullOrWhiteSpace(email))
            {
                return new
                {
                    success = true,
                    isEmailValid = false,
                    reason = "No email in payload"
                };
            }

            var signalGroups = config.GetL("groups")?.Select(g => g.GetS("")).Where(g => !string.IsNullOrWhiteSpace(g)).ToArray();

            if (!signalGroups.Any())
            {
                return new
                {
                    success = false,
                    reason = "No valid signal groups in payload"
                };
            }
            string args = null;
            IGenericEntity res = null;
            var sw = Stopwatch.StartNew();

            if (!ip.IsNullOrWhitespace())
            {
                args = JsonWrapper.Serialize(new { email, ip, source });
                res = await Data.CallFn("signal", "suppressIp", args);
                var suppressIp = res?.GetS("suppress").ParseBool();

                sw.Stop();
                await p._fw.Trace($"{AppName}.suppressIp", Jw.Serialize(new { p._payload, config, sw.Elapsed.TotalMilliseconds }));

                if (res?.GetS("result") == "failed" || !suppressIp.HasValue)
                {
                    await p._fw.Error("OPG Email Validation", $"IP Suppression failed.\nArgs: {args}\nResponse: {res?.GetS("")}");
                    return new
                    {
                        success = false,
                        reason = "Invalid Response"
                    };
                }
                else if (suppressIp == true)
                {
                    return new
                    {
                        success = true,
                        isEmailValid = false,
                        reason = "BlackListIp"
                    };
                }
            }

            sw.Restart();

            var profiles = Jw.TryParseArray(p.config.GetS("badWordProfiles"));

            if (profiles != null)
            {
                var name = (string)p._payload.GetS("name");
                var words = name == null ? null : JArray.FromObject(name.Split(new[] { ',', ' ', '_', '.', '-' }, StringSplitOptions.RemoveEmptyEntries)
                    .SelectMany(s => rxspl.Split(s).Union(new[] { s }))
                    .Where(s => !s.IsNullOrWhitespace())
                    .Select(s => s.ToLower())
                    .Distinct());

                args = JsonWrapper.Serialize(new { email, profiles, words });
                res = await Data.CallFn("signal", "hasBadWords", args);
                var badWords = res?.GetS("response");

                sw.Stop();
                await p._fw.Trace($"{AppName}.hasBadWords", Jw.Serialize(new { p._payload, config, sw.Elapsed.TotalMilliseconds }));

                if (badWords.IsNullOrWhitespace())
                {
                    await p._fw.Error("OPG Email Validation", $"Bad word Suppression failed.\nArgs: {args}\nResponse: {res?.GetS("")}");
                    return new
                    {
                        success = false,
                        reason = "Invalid Response"
                    };
                }

                if (badWords != "ok")
                {
                    return new
                    {
                        success = true,
                        isEmailValid = false,
                        reason = "BadWord"
                    };
                }
            }

            sw.Restart();

            // The inSignalGroups database function accepts either email or md5 in the "emailMd5" parameter.
            args = JsonWrapper.Serialize(new { emailMd5 = email, group = signalGroups });
            res = await Data.CallFn("signal", "inSignalGroups", args);

            sw.Stop();
            await p._fw.Trace($"{AppName}.inSignalGroups", Jw.Serialize(new { p._payload, config, sw.Elapsed.TotalMilliseconds }));

            var inGroup = res?.GetL("in")?.Any();

            if (res?.GetS("err") == "No valid groups defined")
            {
                return new
                {
                    success = false,
                    reason = "No valid signal groups in payload"
                };
            }
            else if (res?.GetS("result") == "failed" || !inGroup.HasValue)
            {
                await p._fw.Error("OPG Email Validation", $"Signal Group check failed.\nArgs: {args}\nResponse: {res?.GetS("")}");
                return new
                {
                    success = false,
                    reason = "Invalid Response"
                };
            }
            else if (inGroup == true)
            {
                return new
                {
                    success = true,
                    isEmailValid = false,
                    reason = "Internal Suppression"
                };
            }
            else
            {
                return new
                {
                    success = true,
                    isEmailValid = true
                };
            }

            #endregion

            return null;
        }
    }
}
