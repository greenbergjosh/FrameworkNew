using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace Utility
{
    public static class Hashing
    {
        public const int SHA512StringLength = 128;
        public const int HexSHA512StringLength = 130;
        public const int Md5StringLength = 32;

        public static Regex SHA512StringRegex() => new("^(?:0[xX])?(?:[0-9a-fA-F]{" + SHA512StringLength.ToString() + "})$");

        public static Regex MD5StringRegex() => new("^[0-9a-fA-F]{" + Md5StringLength.ToString() + "}$");

        public static byte[] AsciiMD5HashAsByteArray(string input)
        {
            var md5 = MD5.Create();
            var inputBytes = Encoding.ASCII.GetBytes(input);
            var hash = md5.ComputeHash(inputBytes);
            return hash;
        }

        private static readonly MD5CryptoServiceProvider Md5Provider = new();

        public static string Utf8MD5HashAsHexString(string input)
        {
            var hash = new StringBuilder();
            var bytes = Md5Provider.ComputeHash(new UTF8Encoding().GetBytes(input));

            for (var i = 0; i < bytes.Length; i++)
            {
                _ = hash.Append(bytes[i].ToString("x2"));
            }

            return hash.ToString();
        }

        public static byte[] CalculateSHA1Hash(string input)
        {
            var sha1 = SHA1.Create();
            var inputBytes = Encoding.ASCII.GetBytes(input);
            var hash = sha1.ComputeHash(inputBytes);
            return hash;
        }

        public static string Base64EncodeForUrl(string s) => Convert.ToBase64String(Encoding.UTF8.GetBytes(s)).Replace('+', '-').Replace('/', '_').Replace('=', '~').Trim();

        public static string Base64DecodeFromUrl(string s) => string.IsNullOrEmpty(s)
                ? s
                : Encoding.UTF8.GetString(
                Convert.FromBase64String(s.Replace('-', '+').Replace('_', '/').Replace('~', '=')));

        public static string CalculateMD5Hash(string input)
        {
            string hash;

            using (var md5 = MD5.Create())
            {
                hash = string.Concat(md5.ComputeHash(Encoding.ASCII.GetBytes(input))
                  .Select(x => x.ToString("x2")));
            }

            return hash;
        }

        public static string CalculateSHA512Hash(string input)
        {
            string hash;

            using (var sha512 = SHA512.Create())
            {
                hash = string.Concat(sha512.ComputeHash(Encoding.ASCII.GetBytes(input))
                  .Select(x => x.ToString("x2")));
            }

            return hash;
        }

        public static string ByteArrayToString(byte[] ba)
        {
            var hex = new StringBuilder(ba.Length * 2);
            foreach (var b in ba)
            {
                _ = hex.AppendFormat("{0:x2}", b);
            }

            return hex.ToString();
        }
    }
}
