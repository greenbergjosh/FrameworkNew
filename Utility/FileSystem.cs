using System;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Utility
{
    public static class FileSystem
    {
        private static readonly ReaderWriterLockSlim ReadWriteLock = new();

        //https://johandorper.com/log/
        // I'm pretty sure the way this is implemented it puts a lock on all file writing used by this method regardless if it's different files
        public static void WriteLineToFileThreadSafe(string path, string text)
        {
            // Set Status to Locked
            ReadWriteLock.EnterWriteLock();
            try
            {
                // Append text to the file
                using var sw = File.AppendText(path);
                // Yes, there is an async version of this, it did not end well
                sw.WriteLine(text);
                sw.Close();
            }
            finally
            {
                // Release lock
                ReadWriteLock.ExitWriteLock();
            }
        }

        public static async Task<string[]> ReadLines(string path, int characterLimit)
        {
            string[] lines;
            using (var sr = File.OpenText(path))
            {
                var buffer = new char[characterLimit];
                var len = await sr.ReadAsync(buffer, 0, characterLimit);
                string theText = new(buffer, 0, len);

                lines = theText.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
            }

            return lines;
        }

        public static string QuotePathParts(string path)
        {
            var quotedPath = new StringBuilder();

            var ps = path.Split('\\');
            for (var i = 0; i < ps.Length - 1; i++)
            {
                _ = i == 0
                    ? quotedPath.Append(ps[i] + "\\")
                    : ps[i].Contains(' ') ? quotedPath.Append("\"" + ps[i] + "\"\\") : quotedPath.Append(ps[i] + "\\");
            }

            _ = quotedPath.Append(ps[^1]);

            return quotedPath.ToString();
        }

        public static bool TryDeleteFile(string fname)
        {
            try
            {
                new FileInfo(fname).Delete();
            }
            catch
            {
                return false;
            }

            return true;
        }

        public static bool TryDeleteFile(FileInfo f)
        {
            try
            {
                f.Delete();
            }
            catch
            {
                return false;
            }

            return true;
        }
    }
}
