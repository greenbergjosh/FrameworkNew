using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.DataLayer;
using Utility.GenericEntity;

namespace EmailReports
{
    public class Program
    {
        private static FrameworkWrapper _fw = null;
        private static List<Action> _dispose = new List<Action>();

        static async Task Main(string[] args)
        {

            IGenericEntity jconf;
            var jobName = args.FirstOrDefault();
            string smtpRelay;
            int smtpPort;
            bool smtpSsl;
            string bodyTmpl;
            string hdrTmpl;
            string itemTmpl;
            string itemValueTmpl;

            if (jobName.IsNullOrWhitespace())
            {
                var msg = $"Job name not defined";

                Console.WriteLine(msg);
                return;
            }

            try
            {
                _fw = new FrameworkWrapper();
                var conf = _fw.StartupConfiguration.GetE("Config");

                smtpRelay = conf.GetS("SmtpRelay");
                var portStr = conf.GetS("SmtpPort");

                smtpPort = portStr.ParseInt() ?? 0;
                smtpSsl = conf.GetS("UseSSL").ParseBool() ?? true;

                if (smtpRelay.IsNullOrWhitespace() || smtpPort < 1)
                {
                    var msg = $"Missing or invalid smtp info. SmtpRelay: {smtpRelay.IfNullOrWhitespace("null")}; SmtpPort: {portStr.IfNullOrWhitespace("null")} ";

                    await _fw.Error(nameof(Main), msg);
                    Console.WriteLine(msg);
                    return;
                }

                bodyTmpl = conf.GetS("BodyTemplate");
                hdrTmpl = conf.GetS("HeaderTemplate");
                itemTmpl = conf.GetS("ItemTemplate");
                itemValueTmpl = conf.GetS("ItemValueTemplate");

                jconf = conf.GetE($"Jobs/{jobName}");

                if (jconf == null)
                {
                    var msg = $"No config found for job name {jobName}";

                    await _fw.Error(nameof(Main), msg);
                    Console.WriteLine(msg);
                    return;
                }
            }
            catch (Exception e)
            {
                await (_fw?.Error(nameof(Main), e.UnwrapForLog()) ?? Task.CompletedTask);
                Console.WriteLine(e.UnwrapForLog());
                return;
            }

            var mail = await RunJob(jobName, bodyTmpl, hdrTmpl, itemTmpl, itemValueTmpl, jconf);

            if (mail != null)
            {
                try
                {

                    ProtocolClient.SendMail(smtpRelay, smtpPort, mail, smtpSsl);
                    await _fw.Log("Sent", JsonWrapper.Serialize(new
                    {
                        Job = jobName,
                        Config = JToken.Parse(jconf.GetS(""))
                    }));
                }
                catch (Exception e)
                {
                    await _fw.Error(nameof(Main), $"Failed to send email: Job: {jobName} {e.UnwrapForLog()}");
                }
            }

            _dispose.ForEach(d => d());
        }

        private static async Task<MailMessage> RunJob(string jobName, string bodyTmpl, string hdrTmpl, string itemTmpl, string itemValueTmpl, IGenericEntity job)
        {
            try
            {
                var isConfValid = true;
                var conn = job.GetS("Connection");
                var func = job.GetS("Method");
                var resultPath = job.GetS("ResultPath").IfNullOrWhitespace("");
                var args = job.GetS("Args") ?? JsonWrapper.Empty;
                var payload = job.GetS("Payload") ?? JsonWrapper.Empty;
                var fromStr = job.GetS("From");
                var from = ParseAddress(fromStr);
                var toStr = job.GetS("To");
                var to = ParseAddresses(toStr).ToArray();
                var subject = job.GetS("Subject");
                var outputStr = job.GetS("Output");
                var output = job.GetE("Output");
                var outPutType = output?.GetS("Type")?.ToLower();
                var csvThreshold = job.GetS("CsvThreshold").ParseInt() ?? 20;

                bodyTmpl = (output.GetS("BodyTemplate")).IfNullOrWhitespace(bodyTmpl);
                hdrTmpl = (output.GetS("HeaderTemplate")).IfNullOrWhitespace(hdrTmpl);
                itemTmpl = (output.GetS("ItemTemplate")).IfNullOrWhitespace(itemTmpl);
                itemValueTmpl = (output.GetS("ItemValueTemplate")).IfNullOrWhitespace(itemValueTmpl);

                #region validation
                if (from == null)
                {
                    await _fw.Error(nameof(RunJob), $"Invalid from address. Job: {jobName} From: {fromStr.IfNullOrWhitespace("null")}");
                    isConfValid = false;
                }

                if (!to.Any())
                {
                    await _fw.Error(nameof(RunJob), $"Invalid to addresses. Job: {jobName} To: {toStr.IfNullOrWhitespace("null")}");
                    isConfValid = false;
                }

                if (subject.IsNullOrWhitespace())
                {
                    await _fw.Error(nameof(RunJob), $"Missing or empty Subject in config. Job: {jobName}");
                    isConfValid = false;
                }

                if (bodyTmpl.IsNullOrWhitespace())
                {
                    await _fw.Error(nameof(RunJob), $"Missing or empty BodyTemplate in config. Job: {jobName}");
                    isConfValid = false;
                }

                if (hdrTmpl.IsNullOrWhitespace())
                {
                    await _fw.Error(nameof(RunJob), $"Missing or empty HeaderTemplate in config. Job: {jobName}");
                    isConfValid = false;
                }

                if (itemTmpl.IsNullOrWhitespace())
                {
                    await _fw.Error(nameof(RunJob), $"Missing or empty ItemTemplate in config. Job: {jobName}");
                    isConfValid = false;
                }

                if (itemValueTmpl.IsNullOrWhitespace())
                {
                    await _fw.Error(nameof(RunJob), $"Missing or empty ItemValueTemplate in config. Job: {jobName}");
                    isConfValid = false;
                }

                if (!isConfValid) return null;

                #endregion

                var res = await Data.CallFn(conn, func, args, payload);

#if TRACE
                var fn = $"{DateTime.Now:MM-dd-HH-mm-ss}";

                using (var fs = File.CreateText(Path.Join(Directory.GetCurrentDirectory(), $"{fn}.json")))
                {
                    fs.Write(res.GetS(""));
                }
#endif

                var resSet = res?.GetE(resultPath);
                var resStr = resSet?.GetS("")?.Trim();

                if (resStr.IsNullOrWhitespace() || resStr == JsonWrapper.Empty || resStr == "[]" || !resStr.StartsWith("["))
                {
                    await _fw.Error(nameof(RunJob), $"Empty or invalid result from DB. Job: {jobName} ResultPath: \"{resultPath}\" {resStr.IfNullOrWhitespace("null")}");
                    return null;
                }

                var items = resSet.GetL("").ToArray();

                if (!items.Any())
                {
                    await _fw.Error(nameof(RunJob), $"Empty result from DB. Job: {jobName} {resStr.IfNullOrWhitespace("null")}");
                    return null;
                }

                var props = items.First().GetD("").Select(t => t.Item1).ToArray();
                var ptf = job.GetD("PropertyToField")?.ToArray();
                var fieldNames = ptf?.Any() == true ? props.Select(p => ptf.FirstOrDefault(f => f.Item1 == p)?.Item2 ?? p).ToArray() : props;

                var msg = new MailMessage()
                {
                    Subject = subject,
                    From = @from
                };

                to.ForEach(e => msg.To.Add(e));

                if (outPutType == "csv" || items.Length > csvThreshold)
                {
                    var nameFunc = output.GetS("NameFunc");
                    var attName = $"{jobName}-{DateTime.Now:yy-MM-dd HH-mm}.csv";

                    if (!nameFunc.IsNullOrWhitespace())
                    {
                        try
                        {
                            attName = (string)await _fw.RoslynWrapper.Evaluate(nameFunc, new { a = "" }, new StateWrapper());
                        }
                        catch (Exception e)
                        {
                            await _fw.Error(nameof(RunJob), $"Failed to execute NameFunc: Job: {jobName} Func: {nameFunc} Err: {e.UnwrapForLog()}");
                        }
                    }

                    var strm = new MemoryStream();
                    var sw = new StreamWriter(strm, Encoding.UTF8);

                    _dispose.Add(() => sw.Close());

                    string CsvEscape(string str)
                    {
                        str = str.Contains(",") || str.Contains("\"") ? $"\"{str.Replace("\"", "\"\"")}\"" : str;

                        return str.Replace("\r", "\t").Replace("\n", "\t");
                    }

                    sw.WriteLine(fieldNames.Select(CsvEscape).Join(","));

                    items.ForEach(v => sw.WriteLine(props.Select(p => CsvEscape(v.GetS(p))).Join(",")));

                    sw.Flush();

                    strm.Position = 0;

#if TRACE
                    using (var fs = File.CreateText(Path.Join(Directory.GetCurrentDirectory(), attName))) strm.CopyTo(fs.BaseStream);

                    strm.Position = 0;
#endif

                    msg.Attachments.Add(new Attachment(strm, attName));
                }
                else
                {
                    var body = bodyTmpl
                        .Replace("[Headers]", fieldNames.Select(p => hdrTmpl.Replace("[Prop]", HtmlEscape(p))).Join(""))
                        .Replace("[Items]", items.Select(i =>
                        {
                            return itemTmpl.Replace("[Values]", props.Select(p => itemValueTmpl.Replace("[Value]", HtmlEscape(i.GetS(p)))).Join(""));
                        }).Join(""));

#if TRACE
                    using (var fs = File.CreateText(Path.Join(Directory.GetCurrentDirectory(), $"{fn}.html")))
                    {
                        fs.Write(body);
                    }
#endif
                    msg.IsBodyHtml = true;
                    msg.Body = body;
                }

                return msg;
            }
            catch (Exception e)
            {
                await _fw.Error(nameof(RunJob), e.UnwrapForLog());
                return null;
            }
        }

        private static string HtmlEscape(string str)
        {
            return WebUtility.HtmlEncode(str);
        }

        private static MailAddress ParseAddress(string addr)
        {
            try
            {
                return new MailAddress(addr.Trim());
            }
            catch (Exception e)
            {
                return null;
            }
        }

        private static IEnumerable<MailAddress> ParseAddresses(string addr)
        {
            try
            {
                return addr.Split(";", StringSplitOptions.RemoveEmptyEntries).Select(e => new MailAddress(e.Trim()));
            }
            catch (Exception e)
            {
                return new MailAddress[0];
            }
        }

    }
}
