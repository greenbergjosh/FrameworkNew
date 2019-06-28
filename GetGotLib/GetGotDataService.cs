using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.DataLayer;
using Utility.EDW.Reporting;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;
using Random = Utility.Crypto.Random;

namespace GetGotLib
{
    public class GetGotDataService
    {
        private FrameworkWrapper _fw = null;
        private Guid _rsConfigGuid;
        private string Conn = "GetGot";
        private string _smtpRelay = null;
        private int _smtpPort = -1;
        private string _emailFromAddress = null;
        private const int MinConfCode = 10000;
        private const int MaxConfCode = 999999;


        public void Config(FrameworkWrapper fw)
        {
            try
            {
                _fw = fw;
                _rsConfigGuid = new Guid(fw.StartupConfiguration.GetS("Config/RsConfigGuid"));
                _smtpRelay = fw.StartupConfiguration.GetS("Config/SmtpRelay");
                _emailFromAddress = fw.StartupConfiguration.GetS("Config/EmailFrom");
                var port = fw.StartupConfiguration.GetS("Config/SmtpPort").ParseInt();

                if (!port.HasValue) throw new Exception("Missing or invalid config value for SmtpPort");
                if (_smtpRelay.IsNullOrWhitespace()) throw new Exception("Missing or invalid config value for SmtpRelay");
                if (_emailFromAddress.IsNullOrWhitespace()) throw new Exception("Missing or invalid config value for EmailFrom");

                _smtpPort = port.Value;
                _fw.TraceLogging = fw.StartupConfiguration.GetS("Config/Trace").ParseBool() ?? false;
            }
            catch (Exception ex)
            {
                _fw?.Error(nameof(Config), ex.UnwrapForLog());
                throw;
            }
        }

        public async Task Run(HttpContext context)
        {
            string bodyForError = null;
            var requestId = Guid.NewGuid().ToString();
            var rc = RC.Unhandled;
            var fResults = new Dictionary<string, string>();

            try
            {
                var requestBody = await context.GetRawBodyStringAsync();

                bodyForError = $"\r\nBody:\r\n{requestBody}";

                _fw.Trace(nameof(Run), $"Request ({requestId}): {requestBody}");
                var req = Jw.JsonToGenericEntity(requestBody);
                var (result, sid) = await HandleEdwEvents(req, requestBody);

                rc = result;

                if (rc == RC.Success)
                {
                    var identity = req.GetS("i/t");
                    var funcs = req.GetD("p").Where(p => p.Item1 != "s" && p.Item1 != "e" && p.Item1 != "sid").ToArray();
                    var cancellation = new CancellationTokenSource();

                    // ToDo: make allOk thread safe with cancellationtoken
                    async Task<(string key, string result)> HandleFunc(Tuple<string, string> p)
                    {
                        if (cancellation.Token.IsCancellationRequested) return (p.Item1, null);

                        IGenericEntity fResult = null;
                        var fResultCode = 100;

                        try
                        {
                            switch (p.Item1)
                            {
                                case "sendcode":
                                    await SendCode(p.Item2, requestId);
                                    fResult = Jw.JsonToGenericEntity("{\"r\": 0}");
                                    break;
                                case "createpass":
                                    fResult = await CommitUserRegistration(p.Item2, sid, requestBody);
                                    break;
                                case "rstpswd":
                                    await SendResetPasswordCode(p.Item2, requestId);

                                    fResult = Jw.JsonToGenericEntity("{\"r\": 0}");
                                    break;
                                case "newpswd":
                                    fResult = await SetNewPassword(p.Item2);
                                    break;
                                case "login":
                                    fResult = await Login(p.Item2);
                                    break;
                                case "genhandles":
                                    var ge = Jw.JsonToGenericEntity(p.Item2);
                                    var handle = ge.GetS("handle");
                                    var cfg = ge.GetL("cfg").Select(c => (digits: c.GetS("digits").ParseInt().Value, count: c.GetS("count").ParseInt().Value));
                                    var res = GenerateAltHandles(handle, cfg);

                                    fResult = Jw.JsonToGenericEntity(Jw.Serialize(res));
                                    break;
                                default:
                                    fResult = await ExecuteDbFunc(p.Item1, p.Item2, identity);
                                    break;
                            }
                            fResultCode = fResult?.GetS("r").ParseInt() ?? 100;

                            if (fResultCode != 0) throw new FunctionException(fResultCode, $"Error in function call {p.Item1}: {fResult?.GetS("") ?? "null"}");
                        }
                        catch (Exception e)
                        {
                            var identityStr = identity == null ? "null" : $"\r\n{identity}\r\n";
                            var payloadStr = p.Item2 == null ? "null" : $"\r\n{p.Item2}\r\n";
                            var funcContext = $"\r\nName: {p.Item1}\r\nIdentity: {identityStr}\r\nArgs: {payloadStr}\r\nRequestId: {requestId}";

                            if (e is FunctionException fe)
                            {
                                var inner = fe.InnerException == null ? "" : $"\r\n\r\nInner Exception:\r\n{fe.InnerException.UnwrapForLog()}";

                                await _fw.Error($"DB:{p.Item1}", $"Function exception:{funcContext}\r\nResponse: {fe.Message}\r\n{fe.StackTrace}{inner}");

                                if (fe?.HaltExecution == true)
                                {
                                    fResult = Jw.JsonToGenericEntity("{ \"r\": " + RC.FunctionHalting + "}");
                                    cancellation.Cancel();
                                }
                                else if (fe.LogAndReturnSuccess) fResult = Jw.JsonToGenericEntity("{ \"r\": 0}");
                                else fResult = Jw.JsonToGenericEntity("{ \"r\": " + fe.ResultCode + "}");
                            }
                            else
                            {
                                await _fw.Error(nameof(Run), $"Unhandled function exception:{funcContext}\r\n{e.UnwrapForLog()}");
                                fResult = Jw.JsonToGenericEntity("{ \"r\": 1 }");
                            }
                        }

                        return (p.Item1, fResult.GetS(""));
                    }

                    var tasks = funcs.Select(HandleFunc).ToArray();

#if DEBUG
                    foreach (var t in tasks) await t;
#else
                    await Task.WhenAll(tasks);
#endif

                    fResults.AddRange(tasks.Select(t => t.Result).Where(r => r.result != null));
                }
            }
            catch (Exception e)
            {
                await _fw.Error(nameof(Run), $"Unhandled exception: {e.UnwrapForLog()}\r\n{bodyForError ?? "null"}");
            }
            var body = PL.C("r", rc);

            fResults.ForEach(p => body.Add(PL.C(p.Key, p.Value, false)));

            var resp = body.ToString();

            _fw.Trace(nameof(Run), $"Result ({requestId}): {resp}");
            await context.WriteSuccessRespAsync(resp);
        }

        private async Task<(int result, string sid)> HandleEdwEvents(IGenericEntity req, string requestFromPost)
        {
            var sessionInit = req.GetS("p/s");
            var eventData = req.GetS("p/e");
            var sid = req.GetS("p/s/sid") ?? req.GetS("p/sid");
            var postRs = !sessionInit.IsNullOrWhitespace();
            var postEvent = !eventData.IsNullOrWhitespace();

            if ((postRs || postEvent) && sid.IsNullOrWhitespace())
            {
                await _fw.Error(nameof(HandleEdwEvents), $"Request missing sid:\r\n{requestFromPost}");
                return (RC.InvalidSID, null);
            }

            async Task Post()
            {
                try
                {
                    var be = new EdwBulkEvent();

                    // ToDo: Check if 'iid' exists, if not, lookup by 'iun'
                    if (postRs) be.AddRS(EdwBulkEvent.EdwType.Immediate, new Guid(sid), DateTime.UtcNow, PL.FromJsonString(sessionInit), _rsConfigGuid);
                    if (postEvent) be.AddEvent(Guid.NewGuid(), DateTime.UtcNow, new Dictionary<string, object> { { "ggsess", sid } }, null, PL.FromJsonString(eventData));

                    await _fw.EdwWriter.Write(be);
                }
                catch (Exception e)
                {
                    await _fw.Error($"{nameof(HandleEdwEvents)}().{nameof(Post)}()", $"Failed to post to edw: {e.UnwrapForLog()}\r\n\r\nBody:\r\n{requestFromPost}");
                }
            }

            // purposely fire and forget
            if (postRs || postEvent) Post();

            return (RC.Success, sid);
        }

        public async Task SendCode(string payload, string reqId)
        {
            try
            {
                var ge = Jw.JsonToGenericEntity(payload);
                var contact = ValidateContact(ge.GetS("u"));

                switch (contact.Type)
                {
                    case ContactType.Email:
                        var (code, accountName, res) = await GetAvailableConfirmationCode(contact.Cleaned);

#if DEBUG
                        if(System.Diagnostics.Debugger.IsAttached) break;
#endif
                        if (!code.IsNullOrWhitespace()) ProtocolClient.SendMail(_smtpRelay, _smtpPort, _emailFromAddress, contact.Cleaned, "GetGot Confirmation Code", code.PadLeft(6, '0'));
                        else if (!accountName.IsNullOrWhitespace()) ProtocolClient.SendMail(_smtpRelay, _smtpPort, _emailFromAddress, contact.Cleaned, "You already have an account", accountName);
                        else
                        {
                            await _fw.Error(nameof(SendCode), $"Unhandled exception getting confirmation code: {reqId} {contact.Cleaned} {res.GetS("")}");
                            return;
                        }
                        break;
                    default:
                        throw new FunctionException(103, $"{contact.Type} not supported");
                }
            }
            catch (Exception e)
            {
                if (e is FunctionException fe)
                {
                    fe.LogAndReturnSuccess = true;
                    throw fe;
                }

                throw new FunctionException(100, "Unhandled exception sending confirmation code", e, true);
            }
        }

        private async Task<(string code, string accountName, IGenericEntity)> GetAvailableConfirmationCode(string contact, bool isPwdReset = false)
        {
            var res = await RetryDbCallOnFailure("GetAvailableConfirmationCode", 3, () => Jw.Serialize(new { u = contact, pwdReset = isPwdReset, randomCodes = Random.Numbers(MinConfCode, MaxConfCode, 6) }), () => null, (i, result, resultCode) =>
                {
                    if (resultCode == 109) throw new FunctionException(resultCode.Value, $"Contact doesn't exist: {contact}");

                    return Task.CompletedTask;
                });
            var rc = res.GetS("r").ParseInt() ?? 100;

            if (rc == 109) throw new FunctionException(rc, $"Contact doesn't exist: {contact}");

            if (rc != 0) throw new FunctionException(rc, $"DB failure generating conf code: {res.GetS("")}");

            var code = res.GetS("code");

            if (!code.IsNullOrWhitespace()) return (code.PadLeft(6, '0'), null, res);
            var userName = res.GetS("userName");

            if (!userName.IsNullOrWhitespace()) return (null, userName, res);

            throw new FunctionException(100, $"Bad DB response generating conf code, no code nor username: {res.GetS("")}");
        }

        private Contact ValidateContact(string contactStr)
        {
            var contact = new Contact(contactStr);

            if (contact.Type == ContactType.Unknown) throw new FunctionException(102, $"Unable to extract contact type: {contactStr}");

            return contact;
        }

        public async Task<IGenericEntity> RetryDbCallOnFailure(string method, int maxRetries, Func<string> getArgs, Func<string> getPayload, Func<int, IGenericEntity, int?, Task> onFail = null, Action<int, IGenericEntity, int?> onRetryExceeded = null)
        {
            var tried = 0;
            IGenericEntity res = null;
            int? rc = null;

            while (tried < maxRetries)
            {
                tried++;
                res = await Data.CallFn(Conn, method, getArgs(), getPayload());
                rc = res.GetS("r").ParseInt();

                if (rc == RC.Success) return res;

                if (onFail != null) await onFail(tried - 1, res, rc);
            }

            if (onRetryExceeded != null)
            {
                onRetryExceeded(tried - 1, res, rc);
                return null;
            }

            throw new FunctionException(rc ?? 100, $"Exceeded {nameof(maxRetries)} of {maxRetries} for {method}: {res?.GetS("") ?? "null"}");
        }

        public async Task SendResetPasswordCode(string payload, string reqId)
        {
            try
            {
                var ge = Jw.JsonToGenericEntity(payload);
                var contact = new Contact(ge.GetS("u"));

                switch (contact.Type)
                {
                    case ContactType.Email:
                        var (code, accountName, cres) = await GetAvailableConfirmationCode(contact.Cleaned, true);

                        if (!code.IsNullOrWhitespace()) ProtocolClient.SendMail(_smtpRelay, _smtpPort, _emailFromAddress, contact.Cleaned, "GetGot Password Reset", code.PadLeft(6, '0'));
                        else await _fw.Error(nameof(SendResetPasswordCode), $"Bad DB response generating password rest code: {reqId} {contact.Cleaned} {cres.GetS("")}");
                        break;
                    default:
                        throw new FunctionException(103, $"{contact.Type} not supported");
                }
            }
            catch (Exception e)
            {
                if (e is FunctionException fe)
                {
                    fe.LogAndReturnSuccess = true;
                    throw fe;
                }

                throw new FunctionException(100, "Unhandled exception sending password reset code", e, true);
            }
        }

        public async Task SendSMS(Contact contact, string message)
        {
            throw new FunctionException(103, "SMS not supported");
        }

        private async Task VerifyConfCode(Contact contact, int code)
        {
            if (code < MinConfCode || code > MaxConfCode) throw new FunctionException(101, $"Code outside of range {code}");

            var res = await Data.CallFn(Conn, "submitcnfmcode", Jw.Serialize(new { u = contact.Cleaned, code }));
            var rc = res?.GetS("r");

            if (rc != "0") throw new FunctionException(rc.ParseInt() ?? 100, $"Error validating code: {res?.GetS("") ?? "null"}");
        }

        public async Task<IGenericEntity> SetNewPassword(string payload)
        {
            var pl = Jw.JsonToGenericEntity(payload);
            var contact = new Contact(pl?.GetS("u"));
            var password = pl?.GetS("p") ?? "";
            var code = pl?.GetS("c").ParseInt() ?? -1;

            if (!ValidatePasswordRules(password)) throw new FunctionException(104, "Password doesn't satisfy rules");

            await VerifyConfCode(contact, code);

            var (uid, pwdHash) = await GetPasswordHashFromContact(contact, password);

            return await Data.CallFn(Conn, "ChangePassword", Jw.Serialize(new { u = contact.Cleaned, code, uid, pwdHash }));
        }

        public async Task<IGenericEntity> CommitUserRegistration(string payload, string sid, string requestBody)
        {
            var pl = Jw.JsonToGenericEntity(payload);
            var handle = pl?.GetS("n")?.Trim();
            var contact = ValidateContact(pl?.GetS("u"));
            var password = pl?.GetS("p") ?? "";
            var code = pl?.GetS("c").ParseInt() ?? -1;

            if (!ValidatePasswordRules(password)) throw new FunctionException(104, "Password doesn't satisfy rules");

            if (handle.IsNullOrWhitespace()) throw new FunctionException(105, "Handle is empty");

            await VerifyConfCode(contact, code);

            var email = contact.Type == ContactType.Email ? contact.Cleaned : null;
            var phone = contact.Type == ContactType.USPhone ? contact.Cleaned : null;
            // Fake data
            var srcId = Guid.NewGuid().ToString();
            var saltHash = Random.GenerateRandomString(32, 32, Random.hex);
            // end Fake data
            var initHash = Hashing.ByteArrayToString(Hashing.CalculateSHA1Hash(requestBody));
            var args = JObject.FromObject(new { u = contact.Cleaned, code, handle, email, phone, sid, sourceId = srcId, saltHash, initHash });
            var altHandles = GenerateAltHandles(handle, new (int digits, int count)[] { (1, -1), (2, -1), (3, 100), (4, 100), (5, 100) }).ToArray();
            var handlesAttempted = altHandles.Length + 1;

            var res = await RetryDbCallOnFailure("CreateUser", 10, () =>
            {
                args["handleAlts"] = JArray.FromObject(altHandles);

                return args.ToString();
            }, () => null, (i, result, resultCode) =>
            {
                if (resultCode == 108)
                {
                    altHandles = GenerateAltHandles(handle, new (int digits, int count)[] { (3, 150), (4, 150), (5, 200) }).ToArray();
                    handlesAttempted += altHandles.Length;
                    return Task.CompletedTask;
                }

                throw new FunctionException(resultCode ?? 100, $"Error creating user: {result?.GetS("") ?? "null"}");
            });

            var rc = res?.GetS("r");

            if (rc == "108") throw new FunctionException(108, $"Failed to find unique handle, {handlesAttempted} attempted");

            if (rc != "0") throw new FunctionException(rc.ParseInt() ?? 100, $"Error creating user: {res?.GetS("") ?? "null"}");

            var uid = res.GetS("uid").ParseGuid()?.ToString();

            handle = res.GetS("handle");
            sid = res.GetS("seid");
            srcId = res.GetS("srcid");
            initHash = res.GetS("inithash");
            saltHash = res.GetS("salthash");

            if (uid.IsNullOrWhitespace()) throw new FunctionException(100, $"DB create user returned invalid or empty uid: {res.GetS("") ?? "null"}");

            var pwdHash = GeneratePasswordHash(password, new[] { sid, srcId, initHash, uid, saltHash });

            res = await Data.CallFn(Conn, "SetInitialPassword", Jw.Serialize(new { u = contact.Cleaned, code, uid, pwdHash }));

            rc = res?.GetS("r");
            if (rc != "0") throw new FunctionException(rc.ParseInt() ?? 100, $"Error saving password: {res?.GetS("") ?? "null"}");

            res = await Login(uid, pwdHash, pl.GetS("d").IfNullOrWhitespace($"Unnamed device - {DateTime.Now:yyyy-MM-dd}"));
            if (res.GetS("r") == "0") res.Set("h", handle);

            return res;
        }

        private async Task<(string uid, string password)> GetPasswordHashFromContact(Contact contact, string password)
        {
            var res = await Data.CallFn(Conn, "GetUserLoginDetails", contact.ToJson());
            var rc = res?.GetS("r");

            if (rc != "0") throw new FunctionException(rc.ParseInt() ?? 100, $"Error getting login details: {res?.GetS("") ?? "null"}");

            var uid = res.GetS("uid");
            var seid = res.GetS("seid");
            var srcId = res.GetS("srcid");
            var initHash = res.GetS("inithash");
            var saltHash = res.GetS("salthash");

            return (uid, GeneratePasswordHash(password, new[] { seid, srcId, initHash, uid, saltHash }));
        }

        private async Task<IGenericEntity> Login(string args)
        {
            var ge = Jw.JsonToGenericEntity(args);
            var password = ge?.GetS("p") ?? "";

            if (!ValidatePasswordRules(password)) throw new FunctionException(106, "Password doesn't satisfy rules");

            var contact = new Contact(ge.GetS("u"));
            var deviceName = ge.GetS("d");
            var (uid, passwordHash) = await GetPasswordHashFromContact(contact, password);

            return await Login(uid, passwordHash, deviceName);
        }

        private async Task<IGenericEntity> Login(string uid, string passwordHash, string deviceName)
        {
            var res = await Data.CallFn(Conn, "GetAuthToken", Jw.Serialize(new { uid, passwordHash, deviceName }));
            var rc = res?.GetS("r");

            if (rc != "0") throw new FunctionException(rc.ParseInt() ?? 100, $"Error logging in: {res?.GetS("") ?? "null"}");

            return res;
        }

        private IEnumerable<string> GenerateAltHandles(string handle, IEnumerable<(int digits, int count)> cfg)
        {
            var separator = handle.Last().ToString().ParseInt().HasValue ? "_" : "";

            return cfg.SelectMany(c =>
            {
                if (c.count == 0) return new string[0];

                if (c.count < 0)
                {
                    var start = (int)Math.Pow(10, c.digits - 1);
                    var end = (int)Math.Pow(10, c.digits);
                    var l = new List<(string handle, Guid sort)>();

                    for (int i = start; i < end; i++)
                    {
                        l.Add(($"{handle}{separator}{i}", Guid.NewGuid()));
                    }

                    return l.OrderBy(x => x.sort).Select(x => x.handle);
                }

                var size = c.digits * c.count;

                return Random.GenerateRandomString(size, size, Random.Digits).Split(c.digits).Distinct().Select(r => $"{handle}{separator}{r}");
            });
        }

        // This is intentionally convoluted, tread lightly
        private string GeneratePasswordHash(string password, string[] salts)
        {
            var s = new[]
            {
                Hashing.StringToByteArray(Regex.Matches(salts[0], "[0-9a-f]+").Select(m => m.Value).Join("")).Take(10),
                Hashing.StringToByteArray(Regex.Matches(salts[1], "[0-9a-f]+").Select(m => m.Value).Join("")).Take(6),
                Hashing.StringToByteArray(salts[2]),
                Hashing.StringToByteArray(Regex.Matches(salts[3], "[0-9a-f]+").Select(m => m.Value).Join("")),
                Hashing.StringToByteArray(salts[4])
            }.SelectMany(b => b).Take(32).ToArray();
            var pbkdf2 = new Rfc2898DeriveBytes(password, s, 10000);

            return Convert.ToBase64String(pbkdf2.GetBytes(20));
        }

        private bool ValidatePasswordRules(string password)
        {
            password = password ?? "";

            return password.Length >= 8;
        }

        private async Task<IGenericEntity> ExecuteDbFunc(string name, string args, string identity)
        {
            var fc = name?.FirstOrDefault();

            // If first char is not lower case a-z then function is private
            if (fc > 122 || fc < 97) throw new FunctionException(100, $"{name.IfNullOrWhitespace("[empty]")} is an invalid or private function");

            if (!identity.IsNullOrWhitespace())
            {
                var a = Jw.TryParseObject(args);

                a["t"] = identity;

                args = a.ToString();
            }

            var res = await Data.CallFn(Conn, name, args);

            if (res == null) throw new FunctionException(100, "Empty DB response");

            var r = res.GetS("r")?.ParseInt();

            if (!r.HasValue) throw new FunctionException(100, $"Invalid db response {res.GetS("")}");

            if (r.Value != 0) throw new FunctionException(r.Value, $"DB response: {res.GetS("")}");

            return res;
        }

        private class FunctionException : Exception
        {
            public FunctionException(int resultCode, string message, bool logAndReturnSuccess = false) : base(message)
            {
                ResultCode = resultCode;
                LogAndReturnSuccess = logAndReturnSuccess;
            }

            public FunctionException(int resultCode, string message, Exception innerException, bool logAndReturnSuccess = false) : base(message, innerException)
            {
                ResultCode = resultCode;
                LogAndReturnSuccess = logAndReturnSuccess;
            }

            public int ResultCode { get; }

            public bool HaltExecution { get; }

            public bool LogAndReturnSuccess { get; set; }
        }

        private static class RC
        {
            public static int Success = 0;
            public static int Unhandled = 1;
            public static int FunctionHalting = 2;
            public static int InvalidSID = 50;
        }
    }
}
