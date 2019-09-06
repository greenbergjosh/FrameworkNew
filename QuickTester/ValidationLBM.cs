using System;
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
    public class ValidationLBM
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

            var sw = Stopwatch.StartNew();

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
            IGenericEntity config = (IGenericEntity)p.config;
            var args = "";
            var res = (IGenericEntity)null;
            var rxspl = new Regex("(?<!^)(?=[A-Z])", RegexOptions.Compiled);

            string email = (string)p.email;

            var profiles = Jw.TryParseArray(p.config.GetS("badWordProfiles"));

            if (profiles != null)
            {
                var name = (string)p._payload.GetS("name");
                JArray words = null;

                if (name != null)
                {
                    string[] caseSplit(string str)
                    {
                        return rxspl.Split(str).ToArray();
                    };
                    var spl = name.Split(new[] { ',', ' ', '_', '.', '-' }, StringSplitOptions.RemoveEmptyEntries);
                    var rxSpl = spl.Select(caseSplit).SelectMany(s => s).ToArray();
                    var wordQry = rxSpl
                        .Where(s => !s.IsNullOrWhitespace())
                        .Select(s => s.ToLower())
                        .Distinct().ToArray();
                    words = JArray.FromObject(wordQry);
                }

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

            #endregion

            return null;
        }
    }
}
