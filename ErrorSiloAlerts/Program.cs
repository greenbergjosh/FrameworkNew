using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;
using Utility;
using Jw = Utility.JsonWrapper;

namespace ErrorSiloAlerts
{
    class Program
    {
        private static FrameworkWrapper fw = null;

        public static async Task Main(string[] args)
        {
            try
            {
                fw = new FrameworkWrapper();
                var lastSeqIds = await SqlWrapper.SqlToGenericEntity("History", "LastSeqIds", "", "");
                var emails = new List<MailMessage>();

                emails.AddRange(await GetEmailAlertDescriptorEvents(lastSeqIds.GetS("EmailAlerts").ParseLong() ?? 0));

                using (var smtp = new SmtpClient("", 0))
                {
                    smtp.EnableSsl = true;

                    foreach (var m in emails)
                    {
                        try
                        {
                            smtp.Send(m);
                        }
                        catch (Exception e)
                        {
                            await fw.Err(ErrorSeverity.Error, nameof(Main), ErrorDescriptor.Exception, $"Email delivery failed: {e}");
                        }
                    }
                }

            }
            catch (Exception e)
            {
                if (fw == null) Console.WriteLine($"Failed to load {nameof(FrameworkWrapper)}: {e}");
                else await fw.Err(ErrorSeverity.Error, nameof(Main), ErrorDescriptor.Exception, e.ToString());
            }
        }

        private static async Task<IEnumerable<MailMessage>> GetEmailAlertDescriptorEvents(long lastSeqId)
        {
            // ToDo: Refactor to do in a single pass
            var config = fw.StartupConfiguration.GetE("Config/EmailAlerts");
            var rawEmailAlerts = await SqlWrapper.SqlToGenericEntity("ErrorWarehouse", "EmailAlerts", Jw.Json(new { lastSeqId }), "");
            var configGroup = new Dictionary<string, (IGenericEntity config, List<IGenericEntity> alerts)>();
            var emails = new List<MailMessage>();

            foreach (var alert in rawEmailAlerts.GetL(""))
            {
                var configName = alert.GetS("Method");
                var alertConfig = config.GetE(configName);

                if (alertConfig == null)
                {
                    configName = "Default";
                    alertConfig = config.GetE(configName);
                }

                if (!configGroup.ContainsKey(configName)) configGroup.Add(configName, (config: alertConfig, alerts: new List<IGenericEntity>()));

                configGroup[configName].alerts.Add(alert);
            }

            foreach (var pgk in configGroup.Keys)
            {
                var pg = configGroup[pgk];
                var dataGroupPath = pg.config.GetS("GroupBy") ?? "Method";
                string GetDataGroup(IGenericEntity e) => e.GetS(dataGroupPath);
                var dataGroups = new Dictionary<string, (string body, List<string> items)>();
                var bodyTemplate = pg.config.GetS("BodyTemplate");
                var itemTemplate = pg.config.GetS("BodyItemTemplate");
                var itemFailedTemplate = pg.config.GetS("BodyFailedItemTemplate");
                var from = pg.config.GetS("From");
                var to = pg.config.GetS("To");
                var subject = pg.config.GetS("Subject");

                foreach (var alert in pg.alerts)
                {
                    var dataGroup = GetDataGroup(alert);

                    if (!dataGroups.ContainsKey(dataGroup)) dataGroups.Add(dataGroup, (body: bodyTemplate.Replace("Group", dataGroup), items: new List<string>()));

                    if (alert.GetS("ErrorMsg").IsNullOrWhitespace()) dataGroups[dataGroup].items.Add(ReplaceTokens(itemTemplate, alert));
                    else dataGroups[dataGroup].items.Add(ReplaceTokens(itemFailedTemplate, alert));
                }

                var body = dataGroups.Values.Aggregate("",
                    (s, dataGroup) =>
                    {
                        s += dataGroup.body.Replace("[Items]", dataGroup.items.Join(""));
                        return s;
                    });

                emails.Add(new MailMessage(from, to, subject, body));
            }

            return emails;
        }

        private static string ReplaceTokens(string template, IGenericEntity entity)
        {
            foreach (var key in entity.GetD("").Select(p => p.Item1))
            {
                template = template.Replace($"[{key}]", entity.GetS(key));
            }

            return template;
        }

    }
}
