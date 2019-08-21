using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace QuickTester
{
    public class ValidationLBM
    {
        public static async Task<IGenericEntity> Do(FrameworkWrapper _fw)
        {
            var _lbmConfig = Jw.JsonToGenericEntity(@"{
  ""LbmId"": ""91c1661a-fb18-4896-a7bf-bba4ce4bc20c"",
  ""ConnectionStrings"": {
    ""emailValidation.signal"": ""fcd03826-cffb-4b7d-a6e2-9b9c2b52c93f""
  },
  ""Providers"": {
    ""OPG"": ""a90569a1-56cf-4f99-a38b-7667e4487455"",
    ""EmailOversight"": ""467931c3-22f7-48d8-a2bf-427f3f16404b"",
    ""XVerify"": ""3a7486df-8d25-4783-8b85-03736e3b6e62""
  }
}");
            var _payload = Jw.ToGenericEntity(new
            {
                email = "qbanbpc@gmail.com",
                providers = new object[] {
                    new { provider = "OPG", config = new { groups = new[] { "Tier1"}}},
                    //new { provider = "XVerify" },
                    new { provider = "EmailOversight", config = new { listId = 5 } }
                }
            });

            var p = new
            {
                _fw,
                _payload,
                _lbmConfig
            };

            // LBM Code Begins
            const string AppName = "EmailValidationLbm";
            const string Conn = "signal";

            try
            {
                var email = p._payload.GetS("email");

                var requestedProviders = p._payload.GetL("providers");

                var responses = new List<(string provider, bool success, bool? isEmailValid, string reason, string recordType)>();

                var configuredProviders = p._lbmConfig.GetD("Config/Providers");

                foreach (var requestedProvider in requestedProviders)
                {
                    var providerName = requestedProvider.GetS("provider");

                    var providerLbmId = configuredProviders.Where(kvp => kvp.Item1 == providerName).Select(kvp => kvp.Item2).SingleOrDefault().ParseGuid();
                    if (providerLbmId == null)
                    {
                        responses.Add((providerName, false, false, "No provider with that name", null));
                        continue;
                    }

                    var providerLbm = await p._fw.Entities.GetEntity(providerLbmId.Value);

                    var providerConfig = requestedProvider.GetE("config");

                    var success = false;
                    bool? isEmailValid = false;
                    IGenericEntity providerResponse = null;
                    string reason = null;

                    try
                    {
                        providerResponse = Jw.ToGenericEntity(await p._fw.RoslynWrapper.Evaluate(providerLbmId.Value, providerLbm.GetS("Config"), new { p._fw, email, config = providerConfig }, null));
                        success = providerResponse.GetB("success");
                        isEmailValid = success ? providerResponse.GetB("isEmailValid") : (bool?)null;
                        reason = providerResponse.GetS("reason");
                        var recordType = providerResponse.GetS("recordType");
                        var recordTable = providerResponse.GetS("recordTable");

                        responses.Add((providerName, success, isEmailValid, reason, recordType));

                        if (!string.IsNullOrWhiteSpace(recordType) && !string.IsNullOrWhiteSpace(recordTable))
                        {
                            try
                            {
                                var signalResponse = await Data.CallFn(Conn, "SaveRawSignal", Jw.Serialize(new { table = recordTable }), providerResponse.GetS(""));

                                if (signalResponse?.GetS("result") != "success")
                                {
                                    await p._fw.Error(AppName, $"SaveRawSignal failed. Response: {signalResponse?.GetS("") ?? "[null]"}");
                                }
                            }
                            catch (Exception e)
                            {
                                await p._fw.Error(AppName, $"SaveRawSignal exception {e.UnwrapForLog()}");
                            }
                        }
                    }
                    catch (Exception e)
                    {
                        await p._fw.Error(AppName, $"Provider check failed {providerName}\nConfig: {providerConfig?.GetS("")}\nResponse: {providerResponse?.GetS("")}\nException: {e.UnwrapForLog()}");
                        responses.Add((providerName, false, null, e.ToString(), null));
                    }

                    if (!success)
                    {
                        await p._fw.Error(AppName, $"Provider check failed {providerName}\nConfig: {providerConfig?.GetS("")}\nResponse: {providerResponse?.GetS("")}");
                    }
                    else if (isEmailValid == false)
                    {
                        // Stop trying providers if we find a successful response that marks the email as invalid
                        return Jw.ToGenericEntity(new { valid = false, provider = providerName, reason });
                    }
                }

                // If no providers returned a valid response, return the last invalid response
                if (!responses.Any(response => response.success))
                {
                    var lastResponse = responses.Last();
                    return Jw.ToGenericEntity(new { valid = false, lastResponse.provider, reason = "Invalid Response" });
                }

                return Jw.ToGenericEntity(new { valid = true });
            }
            catch (Exception e)
            {
                await p._fw.Error(AppName, $"Providers check failed\nConfig: {p._lbmConfig.GetS("")}\nPayload: {p._payload}\n{e.UnwrapForLog()}");
                return Jw.ToGenericEntity(new { valid = false, provider = "*", reason = "Unhandled exception" });
            }
        }
    }
}
