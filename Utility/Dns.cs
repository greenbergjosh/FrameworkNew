using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using DnsClient;
using DnsClient.Protocol;

namespace Utility
{
    public static class Dns
    {
        public const string DefaultDnsHost = "4.2.2.1";
        public static readonly ILookupClient _lookupClient = new LookupClient(IPAddress.Parse(DefaultDnsHost));

        public static string ReverseIp(string ip)
        {
            string[] octets = ip.Trim().Split('.');
            Array.Reverse(octets);
            return string.Join(".", octets);
        }

        public static async Task<string> LookupIp(string name, string dnsHost = DefaultDnsHost)
        {
            var response = await _lookupClient.QueryServerAsync(new[] { IPAddress.Parse(dnsHost) }, name, QueryType.A);
            var result = (ARecord)response.Answers.FirstOrDefault();

            return result?.Address.ToString() ?? "";
        }

        public static async Task<IEnumerable<string>> LookupIps(string name, string dnsHost = DefaultDnsHost)
        {
            var response = await _lookupClient.QueryServerAsync(new[] { IPAddress.Parse(dnsHost) }, name, QueryType.A);

            return response.Answers.Cast<ARecord>().Select(a => a.Address.ToString());
        }

        public static async Task<string> ReverseLookupIp(string ip, string dnsHost = DefaultDnsHost)
        {
            var response = await _lookupClient.QueryServerReverseAsync(new[] { IPAddress.Parse(dnsHost) }, IPAddress.Parse(ip));
            var result = (PtrRecord)response.Answers.FirstOrDefault();

            return result?.DomainName ?? "";
        }
    }
}
