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

namespace SpamhausMonitor
{
    class Program
    {

        public static FrameworkWrapper Fw;
        public const string ConnectionName = "SpamhausMonitor";
        static async System.Threading.Tasks.Task Main(string[] args)
        {
            Fw = new FrameworkWrapper();
            await Fw.Log(nameof(Main), "Starting");
            //IGenericEntity Sp await Data.CallFn("Config", "SelectConfigBody", Jw.Json(new { ConfigType = "PostmasterAccount" }), "");
            string NameServer = Fw.StartupConfiguration.GetS("Config/Nameserver");
            string BlacklistNameServer = Fw.StartupConfiguration.GetS("Config/BlacklistNameserver");
            bool WriteToNotify = Fw.StartupConfiguration.GetB("Config/NotifyWhenListed");

            Resolver PublicResolver = new Resolver(NameServer);

            Resolver BlacklistResolver = 
                new Resolver(BlacklistNameServer) { Recursion = false, UseCache = false, TimeOut = 1000, Retries = 3, TransportType = TransportType.Udp };

            try { 
                IGenericEntity DomainList = await Data.CallFn(ConnectionName, "GetActiveDomains", Jw.Json( new { fetch_type = "domain" }));
                IGenericEntity StatusJob = await Data.CallFn(ConnectionName, "AddOrUpdateStatusJob", Jw.Empty);

                var StatusJobId = StatusJob.GetS("status_job_id");

                foreach (var DomainGe in DomainList.GetL(""))
                {
                    var ProfileId = DomainGe.GetS("notification_profile_id");
                    var PartnerId = DomainGe.GetS("partner_id");
                    var Domain = DomainGe.GetS("domain");
                    var Listed = new Dictionary<string, string>();
                    foreach(var phone in DomainGe.GetL("phone_numbers"))
                    {
                        var foo = phone;
                    }
                    var Emailsge = DomainGe.GetL("email_addresses");
                    await Fw.Trace(nameof(Main), $"Processing domain {Domain}, for Profile {ProfileId}, and Partner {PartnerId}");

                    // query domain blacklist
                    Response DblResponse = BlacklistResolver.Query(Domain + ".dbl.dnsbl", QType.A);
                    if (DblResponse.RecordsA.Length > 0)
                    {
                        DblResponse.RecordsA.ForEach(
                            async record =>
                            {
                                var recordVal = record.ToString();
                                Listed.Add(Domain, recordVal);
                                await Fw.Trace(nameof(Main), $"Domain {Domain} found in Spamhaus with with listing type {recordVal}");
                                await Data.CallFn(ConnectionName, "AddDomainResponse",
                                    Jw.Json(new { partner_id = PartnerId, domain = Domain, response = recordVal, status_job_id = StatusJobId }));
                            });

                    }
                    else
                    {
                        await Fw.Trace(nameof(Main), $"Domain {Domain} not found in Spamhaus");
                        await Data.CallFn(ConnectionName, "AddDomainResponse",
                            Jw.Json(new { partner_id = PartnerId, domain = Domain, status_job_id = StatusJobId }));

                    }

                    // query the ip blacklists

                    Response PublicDomainResponse = PublicResolver.Query(Domain, QType.A);       // use a real DNS resolver (to get real IP)
                    foreach (var ARecord in PublicDomainResponse.RecordsA)
                    {
                        var Ip = ARecord.ToString();
                        var ReversedIp = ReverseIP(Ip);
                        string reverseDomain = "";
                        bool inBl = false;
                        List<string> BlLists = new List<string>() { ".sbl.dnsbl", ".wild.dnsbl" };
                        Response ReverseLookupResponse = PublicResolver.Query(ReversedIp + ".in-addr.arpa", QType.PTR);
                        if (ReverseLookupResponse.RecordsPTR.Length > 0)
                        {
                            reverseDomain = ReverseLookupResponse.RecordsPTR[0].ToString();
                        }

                        foreach (var bl in BlLists)
                        {
                            Response SblResponse = BlacklistResolver.Query(ReversedIp + bl, QType.A);
                            DblResponse.RecordsA.ForEach(
                                async record =>
                                {
                                    inBl = true;
                                    var recordVal = record.ToString();
                                    Listed.Add(ReversedIp + bl, recordVal);
                                    await Fw.Trace(nameof(Main), $"IP {Ip} for domain {Domain} found in Spamhaus with with listing type {recordVal}");
                                    await Data.CallFn(ConnectionName, "AddDomainIpStatusResponse",
                                        Jw.Json(new { domain = Domain, status = 1, response = recordVal, status_job_id = StatusJobId, reverse_dns_domain = reverseDomain }));
                                });
                        }

                        if (!inBl)
                        {
                            await Fw.Trace(nameof(Main), $"IP {Ip} for domain {Domain} not found in Spamhaus");
                            await Data.CallFn(ConnectionName, "AddDomainIpStatusResponse",
                                Jw.Json(new { domain = Domain, ip = Ip, status_job_id = StatusJobId, reverse_dns_domain = reverseDomain })); // no bl
                        }

                    }
                    if (Listed.Count > 0 && WriteToNotify)
                    {

                        string ListedJson = JsonConvert.SerializeObject(Listed);
                        string ContactPhones = DomainGe.GetS("phone_numbers"); 
                        string ContactEmails = DomainGe.GetS("email_addresses"); 
                        var payload = PL.O(new
                        {
                             domain = Domain
                        });
                        payload.Add( PL.O(new { listed = ListedJson, phone_numbers = ContactPhones, email_addresses = ContactEmails }, new bool[] { false, false, false }));

                        await Fw.PostingQueueWriter.Write(new PostingQueueEntry("SpamhausBlacklistEntry", DateTime.Now, payload.ToString()));
                    }
                }

                // mark the job finished
                IGenericEntity FinishedStatusJob = await Data.CallFn(ConnectionName, "AddOrUpdateStatusJob", Jw.Json( new { status_job_id = StatusJobId  }));
                await Fw.Log(nameof(Main), "Stopping");
            }
            catch(Exception e)
            {
                await Fw.Error(nameof(Main), $"Caught exception while processing Spamhaus domains: { e.UnwrapForLog() }");
            }
        }

        private static string ReverseIP(string IP)
        {
            string[] classes = IP.Trim().Split('.');
            Array.Reverse(classes);
            return String.Join(".", classes);
        }

    }
}
