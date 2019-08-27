using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace Utility
{
    public static class Hashing
    {
        public static byte[] AsciiMD5HashAsByteArray(string input)
        {
            // step 1, calculate MD5 hash from input
            MD5 md5 = MD5.Create();
            byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(input);
            byte[] hash = md5.ComputeHash(inputBytes);
            return hash;
        }

        private static readonly MD5CryptoServiceProvider Md5Provider = new MD5CryptoServiceProvider();

        public static string Utf8MD5HashAsHexString(string input)
        {
            var hash = new StringBuilder();
            var bytes = Md5Provider.ComputeHash(new UTF8Encoding().GetBytes(input));

            for (int i = 0; i < bytes.Length; i++)
            {
                hash.Append(bytes[i].ToString("x2"));
            }
            return hash.ToString();
        }

        public static byte[] CalculateSHA1Hash(string input)
        {
            // step 1, calculate MD5 hash from input
            SHA1 sha1 = SHA1.Create();
            byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(input);
            byte[] hash = sha1.ComputeHash(inputBytes);
            return hash;

            // step 2, convert byte array to hex string
            //StringBuilder sb = new StringBuilder();
            //for (int i = 0; i < hash.Length; i++)
            //{
            //    sb.Append(hash[i].ToString("X2"));
            //}
            //return sb.ToString();
        }

        public static string Base64EncodeForUrl(string s)
        {
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(s)).Replace('+', '-').Replace('/', '_').Replace('=', '~').Trim();
        }

        public static string Base64DecodeFromUrl(string s)
        {
            if (String.IsNullOrEmpty(s)) return s;
            return Encoding.UTF8.GetString(
                Convert.FromBase64String(s.Replace('-', '+').Replace('_', '/').Replace('~', '=')));
        }

        public static string CalculateMD5Hash(string input)
        {
            String hash;

            using (var md5 = System.Security.Cryptography.MD5.Create())
            {
                hash = String.Concat(md5.ComputeHash(System.Text.Encoding.ASCII.GetBytes(input))
                  .Select(x => x.ToString("x2")));
            }

            return hash;
        }

        public static byte[] StringToByteArray(string hex)
        {
            return Enumerable.Range(0, hex.Length)
                             .Where(x => x % 2 == 0)
                             .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                             .ToArray();
        }

        public static string ByteArrayToString(byte[] ba)
        {
            StringBuilder hex = new StringBuilder(ba.Length * 2);
            foreach (byte b in ba)
                hex.AppendFormat("{0:x2}", b);
            return hex.ToString();
        }

        public static string EncodeTo64(string toEncode)
        {
            byte[] toEncodeAsBytes
                  = System.Text.ASCIIEncoding.ASCII.GetBytes(toEncode);
            string returnValue
                  = System.Convert.ToBase64String(toEncodeAsBytes);
            return returnValue;
        }

        public static string DecodeFrom64(string encodedData)
        {
            byte[] encodedDataAsBytes
                = System.Convert.FromBase64String(encodedData);
            string returnValue =
               System.Text.ASCIIEncoding.ASCII.GetString(encodedDataAsBytes);
            return returnValue;
        }

        public static string DecodeUtf8From64(string encodedData)
        {
            byte[] encodedDataAsBytes
                = System.Convert.FromBase64String(encodedData);
            string returnValue =
               System.Text.ASCIIEncoding.UTF8.GetString(encodedDataAsBytes, 0, encodedDataAsBytes.Length);
            return returnValue;
        }
    }
}
