using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Utility;
using Utility.DataLayer;

namespace EmailReports
{
    public class Program
    {
        private static FrameworkWrapper _fw = null;

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
                    using (var smtp = new SmtpClient(smtpRelay, smtpPort))
                    {
                        smtp.EnableSsl = smtpSsl;
                        smtp.Send(mail);
                        await _fw.Log("Sent", JsonWrapper.Serialize(new
                        {
                            Job = jobName,
                            Config = JToken.Parse(jconf.GetS(""))
                        }));
                    }
                }
                catch (Exception e)
                {
                    await _fw.Error(nameof(Main), $"Failed to send email: Job: {jobName} {e.UnwrapForLog()}");
                }
            }
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
                var to = ParseAddress(toStr);
                var subject = job.GetS("Subject");

                bodyTmpl = (job.GetS("BodyTemplate")).IfNullOrWhitespace(bodyTmpl);
                hdrTmpl = (job.GetS("HeaderTemplate")).IfNullOrWhitespace(hdrTmpl);
                itemTmpl = (job.GetS("ItemTemplate")).IfNullOrWhitespace(itemTmpl);
                itemValueTmpl = (job.GetS("ItemValueTemplate")).IfNullOrWhitespace(itemValueTmpl);

                #region validation
                if (from == null)
                {
                    await _fw.Error(nameof(RunJob), $"Invalid from address. Job: {jobName} From: {fromStr.IfNullOrWhitespace("null")}");
                    isConfValid = false;
                }

                if (to == null)
                {
                    await _fw.Error(nameof(RunJob), $"Invalid to address. Job: {jobName} To: {toStr.IfNullOrWhitespace("null")}");
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
                var body = bodyTmpl
                    .Replace("[Headers]", props.Select(p => hdrTmpl.Replace("[Prop]", HtmlEscape(p))).Join(""))
                    .Replace("[Items]", items.Select(i =>
                    {
                        return itemTmpl.Replace("[Values]", props.Select(p => itemValueTmpl.Replace("[Value]", HtmlEscape(i.GetS(p)))).Join(""));
                    }).Join(""));

                return new MailMessage(from, to)
                {
                    IsBodyHtml = true,
                    Subject = subject,
                    Body = body
                };
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
                return new MailAddress(addr);
            }
            catch (Exception e)
            {
                return null;
            }
        }

    }
}
