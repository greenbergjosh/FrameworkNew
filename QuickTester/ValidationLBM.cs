using System;
using System.Linq;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;
using Extensions = Utility.Extensions;
using Jw = Utility.JsonWrapper;

namespace QuickTester
{
    public class ValidationLBM
    {
        public async Task<IGenericEntity> Main(FrameworkWrapper _fw)
        {
            var _lbmConfig = Jw.JsonToGenericEntity(@"{
  ""LbmId"": ""91c1661a-fb18-4896-a7bf-bba4ce4bc20c"",
  ""ConnectionStrings"": {
    ""emailValidation.signal"": ""fcd03826-cffb-4b7d-a6e2-9b9c2b52c93f""
  },
  ""XVerify"": {
    ""url"": ""https://api.towerdata.com/v5/ev?email={email}&api_key=196d413c8101a3e975d13ea60d728618"",
    ""rawTable"": ""xverify_signal"",
    ""responseMappings"": [
      {
        ""path"": ""email_validation/status_code"",
        ""value"": [20,50],
        ""isValid"": true,
        ""sendToSignal"": true,
        ""reason"": ""MailBlacklist""
      }
    ]
  },
  ""EmailOversight"": {
    ""url"": ""https://api.emailoversight.com/api/EmailValidation?apitoken=66e55324-8546-4770-9b84-8385f87dc07b&listid={listid}&email={email}"",
    ""rawTable"": ""email_oversight_signal"",
    ""responseMappings"": [
      {
        ""path"": ""Result"",
        ""value"": ""Verified"",
        ""isValid"": true
      }
    ]
  }
}");
            var _payload = Jw.ToGenericEntity(new { email = "qbanbpc@gmail.com", provider = new[] { "XVerify" }, group = new[] { "Tier1" } });


            const string Conn = "signal";
            const string AppName = "EmailValidationLbm";
            const string InternalProvider = "OPG";
            string email = null;
            string[] providers = null;
            string[] signalGroups = null;

            try
            {
                email = _payload.GetS("email");
                providers = _payload.GetL("provider")?.Select(p => p.GetS("")).ToArray() ?? new[] { _payload.GetS("provider") };
                signalGroups = _payload.GetL("group")?.Select(p => p.GetS("")).ToArray() ?? new[] { _payload.GetS("group") };

                return await IsEmailValid();
            }
            catch (Exception e)
            {
                await _fw.Error(AppName, $"Providers check failed \nEmail: {email}\nConfig: {_lbmConfig.GetS("")}\nPayload: {_payload}\n{Extensions.UnwrapForLog(e)}");
                // add return in LBM
                return Jw.ToGenericEntity(new { valid = false, provider = "*", reason = "Unhandled exception" });
            }

            async Task<IGenericEntity> IsEmailValid()
            {
                try
                {
                    // syntax checks?
                    if (string.IsNullOrWhiteSpace(email)) return Jw.ToGenericEntity(new { valid = false, provider = "OPG", reason = "No email in payload" });
                    if (signalGroups.All(p => string.IsNullOrWhiteSpace(p))) return Jw.ToGenericEntity(new { valid = false, provider = "OPG", reason = "No Signal Groups in payload" });

                    var args = Jw.Serialize(new { emailMd5 = email, group = signalGroups });
                    var res = await Data.CallFn(Conn, "inSignalGroups", args);
                    var inGroup = res?.GetL("in")?.Any();

                    if (!inGroup.HasValue)
                    {
                        await _fw.Error(AppName, $"Signal Group check failed.\nArgs: {args}\nResponse: {res?.GetS("") ?? "null"}");
                        return Jw.ToGenericEntity(new { valid = false, provider = InternalProvider, reason = "Unhandled DB Exception" });
                    }

                    if (inGroup == true) return Jw.ToGenericEntity(new { valid = false, provider = InternalProvider, reason = "Internal Suppression" });

                    // Has been verified

                    if (providers.Any(p => !string.IsNullOrWhiteSpace(p)))
                    {
                        return await ValidateWith3rdParty();
                    }

                    return Jw.ToGenericEntity(new { valid = true });
                }
                catch (Exception e)
                {
                    await _fw.Error(AppName, $"Providers check failed \nEmail: {email}\nConfig: {_lbmConfig.GetS("")}\nPayload: {_payload}\n{Extensions.UnwrapForLog(e)}");
                    return Jw.ToGenericEntity(new { valid = false, provider = "*", reason = "Unhandled exception" });
                }
            }

            async Task<IGenericEntity> ValidateWith3rdParty()
            {
                #region bootstrapping config

                var providerConfigs = providers.Select(provider =>
                {
                    var config = _lbmConfig.GetE(provider);
                    string configError = null;
                    var url = config?.GetS("url")?.Trim();
                    var table = config?.GetS("rawTable")?.Trim();
                    var gSendToSignal = !string.IsNullOrWhiteSpace(table);
                    var responseMappings = config?.GetL("responseMappings")?.Select(m =>
                    {
                        var sendToSignal = gSendToSignal && (Extensions.ParseBool(m.GetS("sendToSignal")) ?? true);
                        var path = m.GetS("path");
                        var vals = m.GetL("value")?.Select(e => e.GetS("")?.Trim().ToLower()).Where(e => !string.IsNullOrWhiteSpace(e)).ToArray();
                        var reason = m.GetS("reason");
                        var valid = Extensions.ParseBool(m.GetS("isValid")) ?? string.IsNullOrWhiteSpace(reason);

                        if (!valid && string.IsNullOrWhiteSpace(reason))
                        {
                            _fw.Error(AppName, $"Bad response mapping for {provider} {m.GetS("")}").Wait();
                            return null;
                        }

                        if (vals == null)
                        {
                            var val = m.GetS("value")?.Trim().ToLower();

                            if (string.IsNullOrWhiteSpace(val)) vals = new[] { val };
                        }
                        else if (!vals.Any()) vals = null;

                        return new { sendToSignal, path, vals, reason, valid };
                    }).Where(m => m != null).ToArray();

                    if (config == null) configError = $"Provider not configured {provider}";
                    else if (string.IsNullOrWhiteSpace(url)) configError = $"Provider disabled {provider}";
                    else if (responseMappings == null || !responseMappings.Any()) configError = $"Provider has no valid responseMappings {provider}";

                    return new { provider, url, table, responseMappings, config, configError };
                }).ToArray();

                var providerConfigErrors = providerConfigs.Where(p => !string.IsNullOrWhiteSpace(p.configError)).Select(p => p.configError).ToArray();

                if (providerConfigErrors.Any()) await _fw.Error(AppName, $"Failed provider configs:\n{string.Join("\n", providerConfigErrors)}");

                providerConfigs = providerConfigs.Where(p => string.IsNullOrWhiteSpace(p.configError)).ToArray();

                if (!providerConfigs.Any())
                {
                    await _fw.Error(AppName, $"No valid providers requested {string.Join(", ", providers)}");
                    return Jw.ToGenericEntity(new { valid = false, provider = InternalProvider, reason = "Provider(s) not found", raw = providers });
                }


                #endregion
                // If a provider has an exception and others have been defined we will try them, if all fail an error response will be returned
                IGenericEntity providerExceptionReponse = null;
                var haveValidResponse = false;

                foreach (var p in providerConfigs)
                {
                    try
                    {
                        var resp = await ProtocolClient.HttpGetAsync(p.url.Replace("{email}", email));
                        var respGE = resp.success && !string.IsNullOrWhiteSpace(resp.body) ? Jw.JsonToGenericEntity(resp.body) : null;
                        var isValidResponse = false;
                        var isValid = false;
                        var sendToSignal = true;
                        string reason = null;

                        if (respGE != null)
                        {
                            foreach (var m in p.responseMappings)
                            {
                                var pathVal = respGE.GetS(m.path)?.Trim().ToLower();

                                // if val is null it means any non empty value from path matches
                                if (
                                    (m.vals == null && !string.IsNullOrWhiteSpace(pathVal)) ||
                                    (m.vals != null && m.vals.Contains(pathVal.ToLower()))
                                    )
                                {
                                    providerExceptionReponse = null;
                                    haveValidResponse = true;
                                    isValidResponse = true;
                                    isValid = m.valid;
                                    reason = m.reason;
                                    sendToSignal = m.sendToSignal;
                                    break;
                                }
                            }

                            if (!isValidResponse)
                            {
                                await _fw.Error(AppName, $"Provider check failed {p.provider}\nConfig: {p.config.GetS("")}\nResponse: {resp.body}");
                                if (!haveValidResponse) Jw.ToGenericEntity(new
                                {
                                    valid = false,
                                    provider = providerExceptionReponse == null ? p.provider : "*",
                                    reason = "Invalid response",
                                    raw = Jw.TryParse(resp.body)
                                });
                            }

                            if (sendToSignal)
                            {
                                try
                                {
                                    // Write record type into resp.body with reason
                                    var res = await Data.CallFn(Conn, "SaveRawSignal", Jw.Serialize(new { p.table }), resp.body);

                                    if (res?.GetS("result") != "success") await _fw.Error(AppName, $"SaveRawSignal failed. Response: {res?.GetS("") ?? "[null]"}");
                                }
                                catch (Exception e)
                                {
                                    await _fw.Error(AppName, $"SaveRawSignal exception {Extensions.UnwrapForLog(e)}");
                                }
                            }

                            if (!isValid) return Jw.ToGenericEntity(new { valid = false, p.provider, reason, raw = Jw.TryParse(resp.body) });
                        }
                    }
                    catch (Exception e)
                    {
                        await _fw.Error(AppName, $"Provider check failed {p.provider}\nEmail: {email}\nConfig: {p.config.GetS("")}\n{Extensions.UnwrapForLog(e)}");
                        if (!haveValidResponse) providerExceptionReponse = Jw.ToGenericEntity(new { valid = false, provider = providerExceptionReponse == null ? p.provider : "*", reason = "Invalid response" });
                    }
                }

                if (providerExceptionReponse != null) return providerExceptionReponse;

                return Jw.ToGenericEntity(new { valid = true });
            }

        }
    }
}
