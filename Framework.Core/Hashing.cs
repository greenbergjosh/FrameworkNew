using System.Security.Cryptography;
using System.Text;

namespace Framework.Core
{
    public static class Hashing
    {
        public static string Utf8MD5HashAsHexString(string input)
        {
            using var md5 = MD5.Create();
            var hash = new StringBuilder();
            var bytes = md5.ComputeHash(new UTF8Encoding().GetBytes(input));

            for (var i = 0; i < bytes.Length; i++)
            {
                _ = hash.Append(bytes[i].ToString("x2"));
            }

            return hash.ToString();
        }
    }
}
