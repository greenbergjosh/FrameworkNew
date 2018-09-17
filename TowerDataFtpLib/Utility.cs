using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace TowerDataFtpLib
{
    public class Utility
    {
        public static T GetBasicConfigValue<T>(Dictionary<string, string> basicConfig, string variableName, T defaultValue)
        {
            T genValue = defaultValue;
            try
            {
                string strValue;
                basicConfig.TryGetValue(variableName, out strValue);
                genValue = (T)Convert.ChangeType(strValue, typeof(T));
                return genValue;
            }
            catch (Exception ex)
            {
                genValue = defaultValue;
            }
            return genValue;
        }

        public static void MoveFiles(string sourcePath, string destinationPath, string searchPattern)
        {
            DirectoryInfo sourceDir = new DirectoryInfo(sourcePath);
            DirectoryInfo destinationDir = new DirectoryInfo(destinationPath);

            FileInfo[] files = sourceDir.GetFiles(searchPattern, SearchOption.AllDirectories);

            foreach (FileInfo file in files)
            {
                file.MoveTo(destinationDir.FullName + "\\" + file.Name);
            }
        }

        public static void DeleteDirectoryContents(string dirPath)
        {
            DirectoryInfo dir = new DirectoryInfo(dirPath);

            foreach (FileInfo f in dir.GetFiles())
            {
                f.Delete();
            }
            foreach (DirectoryInfo d in dir.GetDirectories())
            {
                d.Delete(true);
            }
        }

        // Probably should have just sorted the list based on the Length field
        public static void ListInsert(List<FileInfo> l, FileInfo f)
        {
            int idxToInsert = l.Count;
            for (int i = 0; i < l.Count; i++)
            {
                if (f.Length < l[0].Length)
                {
                    idxToInsert = i;
                    break;
                }
            }
            l.Insert(idxToInsert, f);
        }

        public static byte[] CalculateMD5Hash(string input)
        {
            // step 1, calculate MD5 hash from input
            MD5 md5 = MD5.Create();
            byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(input);
            byte[] hash = md5.ComputeHash(inputBytes);
            return hash;

            // step 2, convert byte array to hex string
            //StringBuilder sb = new StringBuilder();
            //for (int i = 0; i < hash.Length; i++)
            //{
            //    sb.Append(hash[i].ToString("X2"));
            //}
            //return sb.ToString();
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

        public static DateTime UnixTimeStampToDateTime(long unixTimeStamp)
        {
            System.DateTime dtDateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0, System.DateTimeKind.Utc);
            dtDateTime = dtDateTime.AddMilliseconds(unixTimeStamp);
            return dtDateTime;
        }

        public static int DateTimeToUnixTimestamp(DateTime dateTime)
        {
            return (TimeZoneInfo.ConvertTimeToUtc(dateTime) -
                   new DateTime(1970, 1, 1, 0, 0, 0, 0, System.DateTimeKind.Utc)).Milliseconds;
        }
    }
}
