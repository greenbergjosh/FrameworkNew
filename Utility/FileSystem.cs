using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace Utility
{
    public static class FileSystem
    {
        //public static FileStream IsFileReady(string filename)
        //{
        //    // If the file can be opened for exclusive access it means that the file
        //    // is no longer locked by another process.
        //    FileStream f = null;
        //    try
        //    {
        //        f = File.Open(filename, FileMode.Open, FileAccess.Read, FileShare.None);
        //        return f;
        //    }
        //    catch (Exception ex)
        //    {
        //        return f;
        //    }
        //}

        //public static async Task<FileStream> WaitForFile(string filename, int pollingInterval, CancellationToken ct)
        //{
        //    FileStream f = null;
        //    while ((f = IsFileReady(filename)) == null)
        //    {
        //        if (ct.IsCancellationRequested) throw new Exception("File Wait canceled.");
        //        await Task.Delay(pollingInterval);
        //    }
        //    return f;
        //}

        //public static void ReleaseFile(FileStream file)
        //{
        //    file.Close();
        //}

        //public static async Task CreateEmptyFiles(List<string> fileNames)
        //{
        //    foreach (var fileName in fileNames)
        //    {
        //        using (var f = File.CreateText(fileName))
        //        {
        //        }
        //    }
        //}

        public static async Task<string> ReadFileTextAsync(string path)
        {
            using (var fs = File.OpenText(path))
            {
                return await fs.ReadToEndAsync();
            }
        }

        public static string QuotePathParts(string path)
        {
            var quotedPath = new StringBuilder("");

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
