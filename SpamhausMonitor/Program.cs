using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.EDW.Queueing;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

namespace SpamhausMonitor
{
    class Program
    {

        private static FrameworkWrapper Fw;
        private static readonly string ConnectionName = "SpamhausMonitor";

        private static async Task Main(string[] args)
        {
            Fw = new FrameworkWrapper();
            await Fw.Log(nameof(Main), "Starting");

            var nameServer = Fw.StartupConfiguration.GetS("Config/Nameserver");
            var ignoreResponseList = new List<string>(Fw.StartupConfiguration.GetL("Config/IgnoreResponseList").Select(i => i.GetS("")));

            var blacklistDomainServerGe = await Data.CallFn("Config", "SelectConfigBody", Jw.Json(new { ConfigType = "DnsblDomainBlacklistServer" }), "");
            var blacklistIpServerGe = await Data.CallFn("Config", "SelectConfigBody", Jw.Json(new { ConfigType = "DnsblIpBlacklistServer" }), "");

            var notifyWhenListed = Fw.StartupConfiguration.GetB("Config/NotifyWhenListed");
#if DEBUG
            notifyWhenListed = false;
#endif
            var hoursBetweenNotifications = Convert.ToInt32(Fw.StartupConfiguration.GetS("Config/HoursBetweenNotifications") ?? "24");

            var domainResponses = new BlockingCollection<string>();
            var ipResponses = new BlockingCollection<string>();
            var domainNotifications = new BlockingCollection<string>();
            var postingQueuePayload = new BlockingCollection<string>();

            try
            {
                var domainList = await Data.CallFn(ConnectionName, "GetActiveDomains", Jw.Json(new { fetch_type = "domain" }));
                var statusJob = await Data.CallFn(ConnectionName, "AddOrUpdateStatusJob", Jw.Empty);

                var statusJobId = statusJob.GetS("status_job_id");

                await ParallelWrapper.ForEachAsync(domainList.GetL(""), 8, async (domainGe) =>
                {
                    var profileId = domainGe.GetS("notification_profile_id");
                    var partnerId = domainGe.GetS("partner_id");
                    var domain = domainGe.GetS("domain");
#if DEBUG
                    if (
                        domain != "dbltest.com" && domain != "affboutique.net" &&
                        domain != "e.onlinefinancialassistance.com"
                    )
                    {
                        //return;
                    }
#endif
                    var listed = new Dictionary<string, string>();
                    var lastNotified = domainGe.GetS("last_notified");
                    var notificationTimeoutExpired = true;

                    if (!lastNotified.IsNullOrWhitespace())
                    {
                        var timeSinceLastNotification = DateTime.UtcNow - Convert.ToDateTime(lastNotified);
                        notificationTimeoutExpired = timeSinceLastNotification.TotalHours >= hoursBetweenNotifications;
                    }

                    var listedDomain = await CheckDomainListing(domainResponses, ignoreResponseList, domainGe, blacklistDomainServerGe, partnerId, statusJobId);
                    var listedIp = await CheckDomainIpListing(ipResponses, ignoreResponseList, domainGe, blacklistIpServerGe, partnerId, statusJobId, nameServer);

                    if ((listedIp || listedDomain) && notifyWhenListed && notificationTimeoutExpired)
                    {
                        var contactPhones = domainGe.GetS("phone_numbers");
                        var contactEmails = domainGe.GetS("email_addresses");
                        var payload = PL.O(new { domain = domain });
                        if (!contactPhones.IsNullOrWhitespace()) payload.Add(PL.O(new { phone_numbers = contactPhones }, new bool[] { false }));
                        if (!contactEmails.IsNullOrWhitespace()) payload.Add(PL.O(new { email_addresses = contactEmails }, new bool[] { false }));
                        domainNotifications.Add(Jw.Json(new { domain = domain, notification_profile = profileId }));
                        postingQueuePayload.Add(payload.ToString());
                    }
                });

                domainResponses.ForEach(async x => await Data.CallFn(ConnectionName, "AddDomainResponse", x));
                ipResponses.ForEach(async x => await Data.CallFn(ConnectionName, "AddDomainIpStatusResponse", x));
                domainNotifications.ForEach(async x => await Data.CallFn(ConnectionName, "AddDomainNotification", x));
                postingQueuePayload.ForEach(async x => await Fw.PostingQueueWriter.Write(new PostingQueueEntry("SpamhausBlacklistEntry", DateTime.Now, x)));

                // mark the job finished
                var finishedStatusJob = await Data.CallFn(ConnectionName, "AddOrUpdateStatusJob", Jw.Json(new { status_job_id = statusJobId }));
                await Fw.Log(nameof(Main), "Stopping");
            }
            catch (Exception e)
            {
                await Fw.Error(nameof(Main), $"Caught exception while processing Spamhaus domains: { e.UnwrapForLog() }");
            }

            Console.WriteLine($"domain count: {domainResponses.Count}, ip count : {ipResponses.Count}");
        }

        static async Task<bool> CheckDomainListing(BlockingCollection<string> domainResponses, List<string> IgnoreResponseList, IGenericEntity domainGe, IGenericEntity domainServers, string partnerId, string statusJobId)
        {
            bool listedAnywhere = false;
            var domain = domainGe.GetS("domain");
            var domainNotificationProfile = domainGe.GetS("notification_profile_id");
            await ParallelWrapper.ForEachAsync(domainServers.GetL("").Where(d => d.GetB("Config/enabled")), 8, async (server) =>
            {
                var configId = server.GetS("Id");
                var configName = server.GetS("Name");
                var serverNotificationProfile = server.GetS("Config/notification_profile_id");
                // skip over servers where a notification profile is explicitly set, but doesn't match - this overrides inclusion
                if (!serverNotificationProfile.IsNullOrWhitespace() && domainNotificationProfile != serverNotificationProfile) { return; }
                var dblResponse = await Utility.Dns.LookupIps(domain + "." + server.GetS("Config/append_tld"), server.GetS("Config/address"));
                if (dblResponse.Any())
                {
                    dblResponse.ForEach(record =>
                    {
                        if (IgnoreResponseList.Contains(record)) { return; }
                        listedAnywhere = true;
                        Console.WriteLine($"Found listing for {domain} against DNSBL server: {configName} with status {record}");
                        domainResponses.Add(Jw.Json(new { partner_id = partnerId, domain, response_config_id = configId, config_name = configName, response = record, status_job_id = statusJobId }));
                    });
                }
                else
                {
                    Console.WriteLine($"Did not find listing for {domain} against DNSBL server: {configName}");
                    domainResponses.Add(Jw.Json(new { partner_id = partnerId, response_config_id = configId, config_name = configName, domain, status_job_id = statusJobId }));
                }
            });

            return listedAnywhere;
        }

        static async Task<bool> CheckDomainIpListing(BlockingCollection<string> ipResponses, List<string> IgnoreResponseList, IGenericEntity domainGe, IGenericEntity ipServers, string partnerId, string statusJobId, string nameServer)
        {
            bool listedAnywhere = false;

            var domain = domainGe.GetS("domain");
            var domainNotificationProfile = domainGe.GetS("notification_profile_id");
            await ParallelWrapper.ForEachAsync(ipServers.GetL("").Where(i => i.GetB("Config/enabled")), 8, async (server) =>
            {
                var configId = server.GetS("Id");
                var configName = server.GetS("Name");
                var publicDomainResponse = await Utility.Dns.LookupIps(domain, nameServer);       // use a real DNS resolver (to get real IP)
                var serverNotificationProfile = server.GetS("Config/notification_profile_id");
                // skip over servers where a notification profile is explicitly set, but doesn't match - this overrides inclusion
                if (!serverNotificationProfile.IsNullOrWhitespace() && domainNotificationProfile != serverNotificationProfile) { return; }

                foreach (var ip in publicDomainResponse)
                {
                    var reverseDomain = await Utility.Dns.ReverseLookupIp(ip, nameServer);

                    var blResponse = await Utility.Dns.LookupIps(Utility.Dns.ReverseIp(ip) + "." + server.GetS("Config/append_tld"), server.GetS("Config/address"));
                    if (blResponse.Any())
                    {
                        blResponse.ForEach(record =>
                        {
                            if (IgnoreResponseList.Contains(record)) { return; }
                            listedAnywhere = true;
                            Console.WriteLine($"Found IP {ip} for {domain} listing in {configName} with type {record}");
                            ipResponses.Add(Jw.Json(new { domain, ip = ip, response = record, response_config_id = configId, config_name = configName, status_job_id = statusJobId, reverse_dns_domain = reverseDomain }));
                        });
                    }
                    else
                    {
                        Console.WriteLine($"No listing for IP {ip} for {domain} listing in {configName}");
                        ipResponses.Add(Jw.Json(new { domain, ip = ip, status_job_id = statusJobId, response_config_id = configId, config_name = configName, reverse_dns_domain = reverseDomain }));
                    }
                }
            });
            return listedAnywhere;
        }
    }
}
