using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
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
                var requestFromPost = await context.GetRawBodyStringAsync();

                bodyForError = $"\r\nBody:\r\n{requestFromPost}";

                _fw.Trace(nameof(Run), $"Request ({requestId}): {requestFromPost}");
                var req = Jw.JsonToGenericEntity(requestFromPost);
                var (result, sid) = await HandleEdwEvents(req, requestFromPost);

                rc = result;

                if (rc == RC.Success)
                {
                    var identity = req.GetS("i");
                    var funcs = req.GetD("p").Where(p => p.Item1 != "s" && p.Item1 != "e" && p.Item1 != "sid").ToArray();
                    var cancellation = new CancellationTokenSource();

                    // ToDo: make allOk thread safe with cancellationtoken
                    async Task<(string key, string result)> HandleFunc(Tuple<string, string> p)
                    {
                        if (cancellation.Token.IsCancellationRequested) return (p.Item1, null);

                        string fResult = null;
                        var fResultCode = 100;

                        try
                        {
                            switch (p.Item1)
                            {
                                case "sendcode":
                                    await SendCode(p.Item2);
                                    break;
                                case "createpass":
                                    fResult = await CommitUserRegistration(p.Item2, sid, requestFromPost);
                                    break;
                                case "login":
                                    fResult = await Login(p.Item2);
                                    break;
                                default:
                                    fResult = await ExecuteDbFunc(p.Item1, p.Item2, identity);
                                    break;
                            }
                            fResultCode = 0;
                        }
                        catch (Exception e)
                        {
                            var identityStr = identity == null ? "null" : $"\r\n{identity}\r\n";
                            var payloadStr = p.Item2 == null ? "null" : $"\r\n{p.Item2}\r\n";
                            var funcContext = $"\r\nName: {p.Item1}\r\nIdentity: {identityStr}\r\nArgs: {payloadStr}\r\nRequestId: {requestId}";

                            var fe = e as FunctionException;

                            if (fe == null) await _fw.Error(nameof(Run), $"Unhandled function exception:{funcContext}\r\n{e.UnwrapForLog()}");
                            else
                            {
                                var inner = fe.InnerException == null ? "" : $"\r\n\r\nInner Exception:\r\n{fe.InnerException.UnwrapForLog()}";

                                await _fw.Error($"DB:{p.Item1}", $"Function exception:{funcContext}\r\nResponse: {fe.Message}\r\n{fe.StackTrace}{inner}");

                                fResultCode = fe.ResultCode;
                            }

                            if (fe?.HaltExecution == true)
                            {
                                rc = RC.FunctionHalting;
                                // cancel the token
                            }
                        }

                        var pl = PL.C("r", fResultCode);

                        if (fResult != null && fResult != Jw.Empty) pl = pl.Add(PL.C("o", fResult, false));

                        return (p.Item1, pl.ToString());
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

        public async Task SendCode(string payload)
        {
            var ge = Jw.JsonToGenericEntity(payload);
            var contact = ValidateContact(ge.GetS("u"));

            switch (contact.Type)
            {
                case ContactType.Email:
                    var (code, accountName) = await GetAvailableConfirmationCode(Jw.Serialize(new { u = contact.Cleaned }));

                    if (!code.IsNullOrWhitespace()) ProtocolClient.SendMail(_smtpRelay, _smtpPort, _emailFromAddress, contact.Cleaned, "GetGot Confirmation Code", code);
                    else ProtocolClient.SendMail(_smtpRelay, _smtpPort, _emailFromAddress, contact.Cleaned, "You already have an account", accountName);
                    break;
                default:
                    throw new FunctionException(103, $"{contact.Type} not supported");
            }
        }

        private Contact ValidateContact(string contactStr)
        {
            var contact = new Contact(contactStr);

            if (contact.Type == ContactType.Unknown) throw new FunctionException(102, $"Unable to extract contact type: {contactStr}");

            return contact;
        }

        private async Task<(string code, string accountName)> GetAvailableConfirmationCode(string args)
        {
            var randomCodes = Random.Numbers(10000, 999999, 6);
            const int maxRetries = 3;
            var tried = 0;

            while (tried < maxRetries)
            {
                var res = await Data.CallFn(Conn, "GetAvailableConfirmationCode", args, Jw.Serialize(randomCodes));
                var code = res.GetS("code");

                if (!code.IsNullOrWhitespace()) return (code.PadLeft(6, '0'), null);
                var userName = res.GetS("userName");

                if (!userName.IsNullOrWhitespace()) return (null, userName);

                tried++;
            }

            throw new FunctionException(100, $"Exceeded {nameof(maxRetries)} of {maxRetries} in {nameof(GetAvailableConfirmationCode)}");
        }

        public async Task<string> CommitUserRegistration(string payload, string sid, string requestBody)
        {
            var pl = Jw.JsonToGenericEntity(payload);
            var handle = pl.GetS("n");
            var contact = ValidateContact(pl.GetS("u"));
            var password = pl.GetS("p") ?? "";
            var code = pl.GetS("c").ParseInt() ?? -1;

            var res = await Data.CallFn(Conn, "submitcnfmcode", Jw.Empty, Jw.Serialize(new { u = contact.Cleaned, code }));
            var rc = res?.GetS("r");

            if (rc != "0") throw new FunctionException(rc.ParseInt() ?? 100, $"Error validating code: {res?.ToString() ?? "null"}");

            if (ValidatePasswordRules(password)) throw new FunctionException(104, "Password doesn't satisfy rules");

            if (handle.IsNullOrWhitespace()) throw new FunctionException(105, "Handle is empty");

            var handleAlternatives = new List<string>();

            // ToDo: handle alternatives

            var email = contact.Type == ContactType.Email ? contact.Cleaned : null;
            var phone = contact.Type == ContactType.USPhone ? contact.Cleaned : null;
            // Fake data
            var srcId = Guid.NewGuid().ToString();
            var saltHash = Random.GenerateRandomString(32, 32, Random.hex);
            // end Fake data
            var initHash = Hashing.ByteArrayToString(Hashing.CalculateSHA1Hash(requestBody));

            res = await Data.CallFn(Conn, "CreateUser", Jw.Empty, Jw.Serialize(new { handle, handleAlts = handleAlternatives, email, phone, sid, sourceId = srcId, saltHash, initHash }));

            rc = res?.GetS("r");
            if (rc != "0") throw new FunctionException(rc.ParseInt() ?? 100, $"Error creating user: {res?.ToString() ?? "null"}");

            var uid = res?.GetS("uid");
            var pwdHash = GeneratePasswordHash(password, new[] { sid, srcId, initHash, uid, saltHash });

            res = await Data.CallFn(Conn, "SavePassword", Jw.Empty, Jw.Serialize(new { uid, pwdHash }));

            rc = res?.GetS("r");
            if (rc != "0") throw new FunctionException(rc.ParseInt() ?? 100, $"Error saving password: {res?.ToString() ?? "null"}");

            // Purposefully F&F
            Data.CallFn(Conn, "ExpireConfirmationCode", Jw.Empty, Jw.Serialize(new { u = contact.Cleaned, code }));

            return await Login(uid, pwdHash);
        }

        private async Task<string> Login(string payload)
        {
            var ge = Jw.JsonToGenericEntity(payload);
            var password = ge?.GetS("p") ?? "";

            if (ValidatePasswordRules(password)) throw new FunctionException(106, "Password doesn't satisfy rules");

            var contact = ValidateContact(ge?.GetS("u"));
            var email = contact.Type == ContactType.Email ? contact.Cleaned : null;
            var phone = contact.Type == ContactType.USPhone ? contact.Cleaned : null;
            var handle = contact.Type == ContactType.Unknown ? contact.Raw : null;
            var res = await Data.CallFn(Conn, "GetUserDetails", Jw.Empty, Jw.Serialize(new { email, phone, handle }));
            var rc = res?.GetS("r");

            if (rc != "0") throw new FunctionException(rc.ParseInt() ?? 100, $"Error logging in: {res?.ToString() ?? "null"}");
            var uid = res.GetS("uid");
            var seid = res.GetS("seid");
            var srcId = res.GetS("sourceId");
            var initHash = res.GetS("initHash");
            var saltHash = res.GetS("saltHash");
            var passwordHash = GeneratePasswordHash(password, new[] { seid, srcId, initHash, uid, saltHash });

            return await Login(uid, passwordHash);
        }

        private async Task<string> Login(string uid, string passwordHash)
        {
            var res = await Data.CallFn(Conn, "GetAuthToken", Jw.Empty, Jw.Serialize(new { uid, passwordHash }));
            var rc = res?.GetS("r");

            if (rc != "0") throw new FunctionException(rc.ParseInt() ?? 100, $"Error logging in: {res?.ToString() ?? "null"}");

            return res.GetS("p");
        }

        // This is intentionally convoluted, tread lightly
        private string GeneratePasswordHash(string password, string[] salts)
        {
            var s = new[]
            {
                Hashing.StringToByteArray(Regex.Matches(salts[0], "[0-9a-f]+").Select(m => m.Value).Join("")).Take(10),
                Hashing.StringToByteArray(Regex.Matches(salts[3], "[0-9a-f]+").Select(m => m.Value).Join("")).Take(6),
                Hashing.StringToByteArray(salts[1]),
                Hashing.StringToByteArray(Regex.Matches(salts[2], "[0-9a-f]+").Select(m => m.Value).Join("")),
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

        private async Task<string> ExecuteDbFunc(string name, string payload, string identity)
        {
            var res = await Data.CallFn(Conn, name, identity.IfNullOrWhitespace(Jw.Empty), payload);

            if (res == null) throw new FunctionException(100, "Empty DB response");

            var r = res.GetS("r")?.ParseInt();

            if (!r.HasValue) throw new FunctionException(100, $"Invalid db response {res.GetS("")}");

            if (r.Value != 0) throw new FunctionException(r.Value, $"DB response: {res.GetS("")}");

            return res.GetS("p");
        }

        private class FunctionException : Exception
        {
            public FunctionException(int resultCode, string message) : base(message)
            {
                ResultCode = resultCode;
            }

            public FunctionException(int resultCode, string message, Exception innerException) : base(message, innerException)
            {
                ResultCode = resultCode;
            }

            public int ResultCode { get; }

            public bool HaltExecution { get; }
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
