using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.EDW.Logging;
using Utility.GenericEntity;
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

                var minTimestampDays = fw.StartupConfiguration.GetS("Config/MinimumTimestampDays").ParseInt() ?? 5;
                var smtpRelay = fw.StartupConfiguration.GetS("Config/SmtpRelay");
                var smtpPort = fw.StartupConfiguration.GetS("Config/SmtpPort").ParseInt() ?? 0;

                var lastSeqIds = (await Data.CallFn("History", "LastSeqIds", "", "")).GetL("").ToDictionary(d => d.GetS("ConfigName"), d => d.GetS("LastSeqId").ParseLong().Value);
                var emails = new List<(string configName, long lastSeqId, MailMessage msg)>();

                emails.AddRange(await GetEmailAlertDescriptorEvents(lastSeqIds, DateTime.Today.AddDays(minTimestampDays * -1)));

                var results = ProtocolClient.SendMail(smtpRelay, smtpPort, emails.Select(e => (reference: e, msg: e.msg)), true);

                foreach (var ((configName, lastSeqId, msg), e) in results)
                {
                    if (e == null)
                    {
                        var res = await Data.CallFn("History", "InsertAlertsSent", Jw.Json(new { configName, lastSeqId }), "");
                        var err = res.GetS("ErrorMessage");

                        if (!err.IsNullOrWhitespace()) await fw.Err(ErrorSeverity.Error, nameof(Main), ErrorDescriptor.Exception, $"InsertAlertsSent failed: {err} Config: {configName} LastSeqId: {lastSeqIds}");
                    }
                    else await fw.Err(ErrorSeverity.Error, nameof(Main), ErrorDescriptor.Exception, $"Email delivery failed: {e}");
                }
            }
            catch (Exception e)
            {
                if (fw == null) Console.WriteLine($"Failed to load {nameof(FrameworkWrapper)}: {e}");
                else await fw.Err(ErrorSeverity.Error, nameof(Main), ErrorDescriptor.Exception, e.ToString());
            }
        }

        private static async Task<IEnumerable<(string configName, long lastSeqId, MailMessage msg)>> GetEmailAlertDescriptorEvents(Dictionary<string, long> lastSeqIds, DateTime minTimestamp)
        {
            // ToDo: Refactor to do in a single pass
            var config = fw.StartupConfiguration.GetE("Config/EmailAlerts");
            var configuredGroupNames = config.GetD("").Select(d => d.Item1);
            var minLastSeqId = lastSeqIds.Where(s => configuredGroupNames.Contains(s.Key)).Select(s => (long?)s.Value).Min() ?? 0;
            var rawEmailAlerts = await Data.CallFn("ErrorWarehouse", "EmailAlerts", Jw.Json(new { lastSeqId = minLastSeqId, minTimestamp }), "");
            var configGroup = new Dictionary<string, (IGenericEntity config, List<(long seqId, IGenericEntity log)> logs)>();
            var emails = new List<(string configName, long lastSeqId, MailMessage msg)>();

            foreach (var log in rawEmailAlerts.GetL(""))
            {
                var configName = log.GetS("Method");
                var alertConfig = config.GetE(configName);

                if (alertConfig == null)
                {
                    configName = "Default";
                    alertConfig = config.GetE(configName);
                }

                var seqId = log.GetS("Id").ParseLong();

                if (!seqId.HasValue || seqId.Value <= lastSeqIds.GetValueOrDefault(configName, 0)) continue;

                if (!configGroup.ContainsKey(configName)) configGroup.Add(configName, (config: alertConfig, logs: new List<(long seqId, IGenericEntity log)>()));

                configGroup[configName].logs.Add((seqId.Value, log));
            }

            foreach (var pgk in configGroup.Keys)
            {
                var pg = configGroup[pgk];
                var dataGroupPath = pg.config.GetS("GroupBy");
                string GetDataGroup(IGenericEntity log, IGenericEntity logData) => dataGroupPath == null ? log.GetS("Method") : logData.GetS(dataGroupPath);
                var dataGroups = new Dictionary<string, (string body, List<string> items)>();
                var bodyTemplate = pg.config.GetS("BodyTemplate");
                var itemTemplate = pg.config.GetS("BodyItemTemplate");
                var itemFailedTemplate = pg.config.GetS("BodyFailedItemTemplate");
                var from = new MailAddress(pg.config.GetS("From"));
                var to = pg.config.GetS("To").Split(";").Select(e=>new MailAddress(e));
                var subject = pg.config.GetS("Subject");
                var lastSeqId = lastSeqIds.GetValueOrDefault(pgk, 0);

                foreach (var (seqId, log) in pg.logs)
                {
                    if (seqId > lastSeqId) lastSeqId = seqId;
                    var logData = Jw.JsonToGenericEntity(log.GetS("Message"));
                    var timestamp = log.GetS("Timestamp").ParseDate().Value;

                    var dataGroup = GetDataGroup(log, logData);

                    if (!dataGroups.ContainsKey(dataGroup)) dataGroups.Add(dataGroup, (body: bodyTemplate.Replace("[Group]", dataGroup), items: new List<string>()));

                    dataGroups[dataGroup].items.AddRange(logData.GetL("Alerts").Select(a =>
                    {
                        return a.GetS("ErrorMsg").IsNullOrWhitespace()
                            ? ReplaceTokens(itemTemplate, a, timestamp)
                            : ReplaceTokens(itemFailedTemplate, a, timestamp);
                    }));
                }

                var body = dataGroups.Values.Aggregate("",
                    (s, dataGroup) =>
                    {
                        s += dataGroup.body.Replace("[Items]", dataGroup.items.Join(""));
                        return s;
                    });
                var msg = new MailMessage()
                {
                    IsBodyHtml = true,
                    From = from,
                    Subject = subject,
                    Body = body
                };

                to.ForEach(t=>msg.To.Add(t));

                emails.Add((configName: pgk, lastSeqId, msg));
            }

            return emails;
        }

        private static string ReplaceTokens(string template, IGenericEntity entity, DateTime timestamp)
        {
            foreach (var key in entity.GetD("").Select(p => p.Item1))
            {
                template = template.Replace($"[{key}]", entity.GetS(key));
            }

            return template.Replace("[Timestamp]", $"{timestamp:yy-MM-dd HH:mm:ss}");
        }

    }
}
