using Heijden.DNS;
using System;
using System.Collections.Generic;
using System.Text;

namespace Utility
{
    public static class Dns
    {
        public const string DefaultDnsHost = "4.2.2.1";

        public static string ReverseIp(string Ip)
        {
            string[] octets = Ip.Trim().Split('.');
            Array.Reverse(octets);
            return String.Join(".", octets);
        }

        public static string ReverseLookupIp (string ip, string dnsHost = DefaultDnsHost)
        {
            Response ReverseLookupResponse = new Resolver(dnsHost).Query(ReverseIp(ip) + ".in-addr.arpa", QType.PTR);
            return ReverseLookupResponse.RecordsPTR.Length > 0 ? ReverseLookupResponse.RecordsPTR[0].ToString() : "";
        }

        public static string ReverseLookupIp (string ip, Dictionary<string, string> cache, string dnsHost = DefaultDnsHost)
        {
            if (cache.ContainsKey(ip) && ! cache[ip].IsNullOrWhitespace()) return cache[ip];
            cache[ip] = ReverseLookupIp(ip, dnsHost);
            return cache[ip];
        }
    }
}
