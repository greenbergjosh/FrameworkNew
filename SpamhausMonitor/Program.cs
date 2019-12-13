using System;
using Utility.GenericEntity;
using Jw = Utility.JsonWrapper;

using Heijden.DNS;
using Utility;
using Utility.DataLayer;
using System.Collections.Generic;
using Utility.EDW.Reporting;
using Utility.EDW.Queueing;
using Newtonsoft.Json;
using System.Net.Mail;
using System.Threading.Tasks;
using System.Collections.Concurrent;
using System.Linq;

namespace SpamhausMonitor
{
    class Program
    {

        public static FrameworkWrapper Fw;
        public static readonly string ConnectionName = "SpamhausMonitor";
        public static Resolver PublicResolver;
        static async System.Threading.Tasks.Task Main(string[] args)
        {
            Fw = new FrameworkWrapper();
            await Fw.Log(nameof(Main), "Starting");
            //IGenericEntity Sp await Data.CallFn("Config", "SelectConfigBody", Jw.Json(new { ConfigType = "PostmasterAccount" }), "");
            string NameServer = Fw.StartupConfiguration.GetS("Config/Nameserver");
            List<string> IgnoreResponseList = new List<string>();
            Fw.StartupConfiguration.GetL("Config/IgnoreResponseList").ForEach(x => IgnoreResponseList.Add(x.GetS("")));
            //string BlacklistServer = Fw.StartupConfiguration.GetS("Config/BlacklistNameserver");

            IGenericEntity BlacklistDomainServerGe = Data.CallFn("Config", "SelectConfigBody", Jw.Json(new { ConfigType = "DnsblDomainBlacklistServer" }), "").GetAwaiter().GetResult();
            IGenericEntity BlacklistIpServerGe = Data.CallFn("Config", "SelectConfigBody", Jw.Json(new { ConfigType = "DnsblIpBlacklistServer" }), "").GetAwaiter().GetResult();

            bool NotifyWhenListed = Fw.StartupConfiguration.GetB("Config/NotifyWhenListed");
#if DEBUG
            NotifyWhenListed = false;
#endif
            int HoursBetweenNotifications = Convert.ToInt32(Fw.StartupConfiguration.GetS("Config/HoursBetweenNotifications") ?? "24");

            PublicResolver = new Resolver(NameServer);

            BlockingCollection<string> domainResponses = new BlockingCollection<string>();
            BlockingCollection<string> ipResponses = new BlockingCollection<string>();
            BlockingCollection<string> domainNotifications = new BlockingCollection<string>();
            BlockingCollection<string> postingQueuePayload = new BlockingCollection<string>();
            try { 
                IGenericEntity DomainList = await Data.CallFn(ConnectionName, "GetActiveDomains", Jw.Json( new { fetch_type = "domain" }));
                IGenericEntity StatusJob = await Data.CallFn(ConnectionName, "AddOrUpdateStatusJob", Jw.Empty);

                var StatusJobId = StatusJob.GetS("status_job_id");

                Parallel.ForEach(DomainList.GetL(""), (DomainGe) =>
                {
                    var ProfileId = DomainGe.GetS("notification_profile_id");
                    var PartnerId = DomainGe.GetS("partner_id");
                    var Domain = DomainGe.GetS("domain");
#if DEBUG
                    if (
                    Domain != "dbltest.com" && Domain != "affboutique.net" &&
                    Domain != "e.onlinefinancialassistance.com"
                    ) {
                        //return;
                    }
#endif
                    var Listed = new Dictionary<string, string>();
                    var LastNotified = DomainGe.GetS("last_notified");
                    bool NotificationTimeoutExpired = true;

                    if (!LastNotified.IsNullOrWhitespace())
                    {
                        TimeSpan TimeSinceLastNotification = DateTime.UtcNow - Convert.ToDateTime(LastNotified);
                        NotificationTimeoutExpired = TimeSinceLastNotification.TotalHours >= HoursBetweenNotifications;
                    }

                    bool listedDomain = CheckDomainListing(domainResponses, IgnoreResponseList, DomainGe, BlacklistDomainServerGe, PartnerId, StatusJobId);
                    bool listedIp = CheckDomainIpListing(ipResponses, IgnoreResponseList, DomainGe, BlacklistIpServerGe, PartnerId, StatusJobId);

                    if ( (listedIp || listedDomain) && NotifyWhenListed && NotificationTimeoutExpired)
                    {
                        string ContactPhones = DomainGe.GetS("phone_numbers");
                        string ContactEmails = DomainGe.GetS("email_addresses");
                        var payload = PL.O(new { domain = Domain });
                        if (!ContactPhones.IsNullOrWhitespace()) payload.Add(PL.O(new { phone_numbers = ContactPhones }, new bool[] { false }));
                        if (!ContactEmails.IsNullOrWhitespace()) payload.Add(PL.O(new { email_addresses = ContactEmails }, new bool[] { false }));
                        domainNotifications.Add(Jw.Json(new { domain = Domain, notification_profile = ProfileId }));
                        postingQueuePayload.Add(payload.ToString());
                    }
                });
                domainResponses.ForEach(async x => await Data.CallFn(ConnectionName, "AddDomainResponse", x));
                ipResponses.ForEach(async x => await Data.CallFn(ConnectionName, "AddDomainIpStatusResponse", x));
                domainNotifications.ForEach(async x => await Data.CallFn(ConnectionName, "AddDomainNotification", x));
                postingQueuePayload.ForEach(async x => await Fw.PostingQueueWriter.Write(new PostingQueueEntry("SpamhausBlacklistEntry", DateTime.Now, x)));

                // mark the job finished
                IGenericEntity FinishedStatusJob = await Data.CallFn(ConnectionName, "AddOrUpdateStatusJob", Jw.Json( new { status_job_id = StatusJobId  }));
                await Fw.Log(nameof(Main), "Stopping");
            }
            catch(Exception e)
            {
                await Fw.Error(nameof(Main), $"Caught exception while processing Spamhaus domains: { e.UnwrapForLog() }");
            }

            Console.WriteLine($"domain count: {domainResponses.Count}, ip count : {ipResponses.Count}");
        }

        static bool CheckDomainListing(BlockingCollection<string> domainResponses, List<string> IgnoreResponseList, IGenericEntity domainGe, IGenericEntity domainServers, string partnerId, string statusJobId )
        {
            bool listedAnywhere = false;
            var domain = domainGe.GetS("domain");
            var domainNotificationProfile = domainGe.GetS("notification_profile_id");
            Parallel.ForEach(domainServers.GetL("").Where(d => d.GetB("Config/enabled")), (server) =>
            {
                var configId = server.GetS("Id");
                var configName = server.GetS("Name");
                var serverNotificationProfile = server.GetS("Config/notification_profile_id");
                // skip over servers where a notification profile is explicitly set, but doesn't match - this overrides inclusion
                if( ! serverNotificationProfile.IsNullOrWhitespace() && domainNotificationProfile != serverNotificationProfile) { return; }
                //Resolver BlacklistResolver = new Resolver(server.GetS("Config/address")) { Recursion = false, UseCache = false, TimeOut = 1000, Retries = 3, TransportType = TransportType.Udp };
                Resolver BlacklistResolver = new Resolver(server.GetS("Config/address")) { TimeOut = 100 };

                Response DblResponse = BlacklistResolver.Query(domain + "." + server.GetS("Config/append_tld"), QType.A);
                if (DblResponse.RecordsA.Length > 0)
                {
                    DblResponse.RecordsA.ForEach(record =>
                    {
                        if (IgnoreResponseList.Contains(record.ToString())) { return; }
                        listedAnywhere = true;
                        Console.WriteLine($"Found listing for {domain} against DNSBL server: {configName} with status {record.ToString()}");
                        domainResponses.Add(Jw.Json(new { partner_id = partnerId, domain, response_config_id = configId, config_name = configName, response = record.ToString(), status_job_id = statusJobId }));
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

        static bool CheckDomainIpListing(BlockingCollection<string> ipResponses, List<string> IgnoreResponseList, IGenericEntity domainGe, IGenericEntity ipServers, string partnerId, string statusJobId)
        {
            bool listedAnywhere = false;

            var domain = domainGe.GetS("domain");
            var domainNotificationProfile = domainGe.GetS("notification_profile_id");
            Parallel.ForEach(ipServers.GetL("").Where(i => i.GetB("Config/enabled")), (server) =>
            {
                var configId = server.GetS("Id");
                var configName = server.GetS("Name");
                Response PublicDomainResponse = PublicResolver.Query(domain, QType.A);       // use a real DNS resolver (to get real IP)
                var serverNotificationProfile = server.GetS("Config/notification_profile_id");
                // skip over servers where a notification profile is explicitly set, but doesn't match - this overrides inclusion
                if( ! serverNotificationProfile.IsNullOrWhitespace() && domainNotificationProfile != serverNotificationProfile) { return; }

                foreach (var ARecord in PublicDomainResponse.RecordsA)
                {
                    var Ip = ARecord.ToString();
                    var ReversedIp = Dns.ReverseIp(Ip);
                    string reverseDomain = "";
                    Response ReverseLookupResponse = PublicResolver.Query(ReversedIp + ".in-addr.arpa", QType.PTR);
                    if (ReverseLookupResponse.RecordsPTR.Length > 0)
                    {
                        reverseDomain = ReverseLookupResponse.RecordsPTR[0].ToString();
                    }
                    Resolver blacklistResolver = new Resolver(server.GetS("Config/address")) {TimeOut = 100 };
                    Response blResponse = blacklistResolver.Query(ReversedIp + "." + server.GetS("Config/append_tld"), QType.A);
                    if (blResponse.RecordsA.Length > 0)
                    {
                        blResponse.RecordsA.ForEach( record => {
                            if (IgnoreResponseList.Contains(record.ToString())) { return; }
                            listedAnywhere = true;
                            Console.WriteLine($"Found IP {Ip} for {domain} listing in {configName} with type {record.ToString()}");
                            ipResponses.Add(Jw.Json(new { domain, ip = Ip, response = record.ToString(), response_config_id = configId, config_name = configName, status_job_id = statusJobId, reverse_dns_domain = reverseDomain }));
                        });
                    }
                    else
                    {
                        Console.WriteLine($"No listing for IP {Ip} for {domain} listing in {configName}");
                        ipResponses.Add(Jw.Json(new { domain, ip = Ip, status_job_id = statusJobId, response_config_id = configId, config_name = configName, reverse_dns_domain = reverseDomain }));
                    }
                }
            });
            return listedAnywhere;
        }


    }
}
