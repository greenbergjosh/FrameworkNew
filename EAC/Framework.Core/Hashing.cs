using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace Framework.Core
{
    public static class Hashing
    {
        public static byte[] AsciiMD5HashAsByteArray(string input)
        {
            using (var md5 = MD5.Create())
            {
                var inputBytes = Encoding.ASCII.GetBytes(input);
                var hash = md5.ComputeHash(inputBytes);
                return hash;
            }
        }

        public static string Utf8MD5HashAsHexString(string input)
        {
            using (var md5provider = new MD5CryptoServiceProvider())
            {
                var hash = new StringBuilder();
                var bytes = md5provider.ComputeHash(new UTF8Encoding().GetBytes(input));
                for (var i = 0; i < bytes.Length; i++)
                {
                    hash.Append(bytes[i].ToString("x2"));
                }
                return hash.ToString();
            }
        }

        public static byte[] CalculateSHA1Hash(string input)
        {
            using (var sha1 = SHA1.Create())
            {
                var inputBytes = Encoding.ASCII.GetBytes(input);
                var hash = sha1.ComputeHash(inputBytes);
                return hash;
            }
        }

        public static string Base64EncodeForUrl(string s)
        {
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(s))
                .Replace('+', '-').Replace('/', '_').Replace('=', '~').Trim();
        }

        public static string Base64DecodeFromUrl(string s)
        {
            if (string.IsNullOrEmpty(s)) return s;
            return Encoding.UTF8.GetString(
                Convert.FromBase64String(s.Replace('-', '+').Replace('_', '/').Replace('~', '=')));
        }

        public static string CalculateMD5Hash(string input)
        {
            using (var md5 = MD5.Create())
            {
                var hash = string.Concat(md5.ComputeHash(Encoding.ASCII.GetBytes(input))
                  .Select(x => x.ToString("x2")));
                return hash;
            }
        }

        public static byte[] StringToByteArray(string hex)
        {
            return Enumerable
                .Range(0, hex.Length)
                .Where(x => x % 2 == 0)
                .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                .ToArray();
        }

        public static string ByteArrayToString(byte[] ba)
        {
            var hex = new StringBuilder(ba.Length * 2);
            foreach (var b in ba)
                hex.AppendFormat("{0:x2}", b);
            return hex.ToString();
        }

        public static string EncodeTo64(string toEncode)
        {
            var toEncodeAsBytes = Encoding.ASCII.GetBytes(toEncode);
            var returnValue = Convert.ToBase64String(toEncodeAsBytes);
            return returnValue;
        }

        public static string DecodeFrom64(string encodedData)
        {
            var encodedDataAsBytes = Convert.FromBase64String(encodedData);
            var returnValue = Encoding.ASCII.GetString(encodedDataAsBytes);
            return returnValue;
        }

        public static string DecodeUtf8From64(string encodedData)
        {
            var encodedDataAsBytes = Convert.FromBase64String(encodedData);
            var returnValue = Encoding.UTF8.GetString(encodedDataAsBytes, 0, encodedDataAsBytes.Length);
            return returnValue;
        }
    }
}
