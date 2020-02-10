using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Framework.Core
{
    public static class FileSystem
    {
        private static readonly ReaderWriterLockSlim ReadWriteLock = new ReaderWriterLockSlim();

        //https://johandorper.com/log/
        // I'm pretty sure the way this is implemented it puts a lock on all file writing used by this method regardless if it's different files
        public static void WriteLineToFileThreadSafe(string path, string text)
        {
            // Set Status to Locked
            ReadWriteLock.EnterWriteLock();
            try
            {
                // Append text to the file
                using (StreamWriter sw = File.AppendText(path))
                {
                    // Yes, there is an async version of this, it did not end well
                    sw.WriteLine(text);
                    sw.Close();
                }
            }
            finally
            {
                // Release lock
                ReadWriteLock.ExitWriteLock();
            }
        }

        public static async Task<string> ReadFileTextAsync(string path)
        {
            using (var fs = File.OpenText(path))
            {
                return await fs.ReadToEndAsync();
            }
        }

        public static string QuotePathParts(string path)
        {
            var quotedPath = new StringBuilder();

            var ps = path.Split('\\');
            for (var i = 0; i < ps.Length - 1; i++)
            {
                if (i == 0) quotedPath.Append(ps[i] + "\\");
                else if (ps[i].Contains(' ')) quotedPath.Append("\"" + ps[i] + "\"\\");
                else quotedPath.Append(ps[i] + "\\");
            }
            quotedPath.Append(ps[ps.Length - 1]);

            return quotedPath.ToString();
        }

        public static void MoveFiles(string sourcePath, string destinationPath, string searchPattern)
        {
            var sourceDir = new DirectoryInfo(sourcePath);
            var destinationDir = new DirectoryInfo(destinationPath);

            var files = sourceDir.GetFiles(searchPattern, SearchOption.AllDirectories);

            foreach (var file in files)
            {
                file.MoveTo(destinationDir.FullName + "\\" + file.Name);
            }
        }

        public static void DeleteDirectoryContents(string dirPath)
        {
            var dir = new DirectoryInfo(dirPath);

            foreach (var f in dir.GetFiles())
            {
                f.Delete();
            }
            foreach (var d in dir.GetDirectories())
            {
                d.Delete(true);
            }
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
