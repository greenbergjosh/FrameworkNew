using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using HtmlAgilityPack;
using Renci.SshNet;
using Renci.SshNet.Async;
using Fs = Utility.FileSystem;

namespace Utility
{
    public static class ProtocolClient
    {
        private static readonly ConcurrentDictionary<(int maxConnectionsPerServer, DecompressionMethods decompressionMethods, string proxyHostAndPort, double timeoutSeconds), HttpClient> _httpClients = new();

        public static async Task DownloadFile(string downloadLink, string destinationDirectoryName, string destinationFileName)
        {
            var tmpLocation = $@"{destinationDirectoryName}\__dwnld.{destinationFileName}";
            using (var wc = new WebClient())
            {
                await wc.DownloadFileTaskAsync(new Uri(downloadLink), tmpLocation)
                    .ConfigureAwait(continueOnCapturedContext: false);
            }

            File.Move(tmpLocation, $@"{destinationDirectoryName}\{destinationFileName}");
            _ = Task.Factory.StartNew(() => File.Delete(tmpLocation), TaskCreationOptions.LongRunning);
        }

        public static async Task<object> DownloadPage(string url, string basicAuthString, Func<string, Task<string>> zipEntryTester, Dictionary<string, Func<string, Task<object>>> zipEntryProcessors, string proxyHostAndPort = null, double timeoutSeconds = 180.0, bool decompress = false, int maxConnectionsPerServer = 5)
        {
            object resp = null;
            var client = GetHttpClient(maxConnectionsPerServer, timeoutSeconds, decompress ? DecompressionMethods.GZip | DecompressionMethods.Deflate : DecompressionMethods.None, proxyHostAndPort);

            Task<HttpResponseMessage> GetResponse()
            {
                if (basicAuthString != null)
                {
                    var byteArray = Encoding.ASCII.GetBytes(basicAuthString);
                    using var requestMessage = new HttpRequestMessage(HttpMethod.Get, url);
                    requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", Convert.ToBase64String(byteArray));
                    return client.SendAsync(requestMessage);
                }
                else
                {
                    return client.GetAsync(url);
                }
            }

            using (var response = await GetResponse())
            {
                if (response.IsSuccessStatusCode)
                {
                    if (decompress)
                    {
                        var rs = new Dictionary<string, object>();
                        var responseStream = await response.Content.ReadAsStreamAsync();
                        using (var zip = new ZipArchive(responseStream, ZipArchiveMode.Read))
                        {
                            foreach (var entry in zip.Entries)
                            {
                                using var sr = new StreamReader(entry.Open());
                                var responseBody = await sr.ReadToEndAsync();
                                var tr = await zipEntryTester(responseBody);
                                var pr = await zipEntryProcessors[tr](responseBody);
                                rs[tr] = pr;
                            }
                        }

                        resp = rs;
                    }
                    else
                    {
                        resp = await response.Content.ReadAsStringAsync();
                    }
                }
                else
                {
                    throw new Exception("HttpResponseMessage.IsSuccessStatusCode was false.", new Exception(response.StatusCode.ToString()));
                }
            }

            return resp;
        }

        public static async Task<Dictionary<string, IEnumerable<T>>> DownloadUnzipUnbuffered<T>(string logName, string url, string authScheme, string authParameter, Func<FileInfo, Task<string>> zipEntryTester, Dictionary<string, Func<FileInfo, Task<T>>> zipEntryProcessors, string workingDirectory, double timeoutSeconds, int maxConnectionsPerServer, FrameworkWrapper fw, IDictionary<string, string> postData = null)
        {
            var responseBody = string.Empty;

            var ufn = Guid.NewGuid().ToString();
            var fileName = ufn + ".tmp";
            var rs = new Dictionary<string, IEnumerable<T>>();

            var client = GetHttpClient(maxConnectionsPerServer, timeoutSeconds: timeoutSeconds);

            async Task<HttpResponseMessage> GetResponse()
            {
                if (!string.IsNullOrWhiteSpace(authScheme) && !string.IsNullOrWhiteSpace(authParameter))
                {
                    if (authScheme == "Basic")
                    {
                        var byteArray = Encoding.ASCII.GetBytes(authParameter);
                        authParameter = Convert.ToBase64String(byteArray);
                    }

                    using var requestMessage = new HttpRequestMessage(HttpMethod.Get, url);
                    requestMessage.Headers.Authorization = new AuthenticationHeaderValue(authScheme, authParameter);
                    return await client.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead);
                }
                else if (postData?.Count > 0)
                {
                    var postContent = new FormUrlEncodedContent(postData);
                    using var requestMessage = new HttpRequestMessage(HttpMethod.Post, url);
                    requestMessage.Content = postContent;
                    return await client.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead);
                }
                else
                {
                    return await client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
                }
            }

            try
            {
                using var response = await GetResponse();
                using (var fs = new FileStream(workingDirectory + "\\" + fileName, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    await response.Content.CopyToAsync(fs);
                    await fw.Log($"{nameof(DownloadUnzipUnbuffered)}-{logName}", $"Downloaded file {url} to {fileName}, size: {fs.Length} position: {fs.Position}");
                }

                if (await UnixWrapper.IsZip(logName, Path.Combine(workingDirectory, fileName), fw))
                {
                    await fw.Log($"{nameof(DownloadUnzipUnbuffered)}-{logName}", $"File is zip, calling {nameof(UnzipUnbuffered)} for {url} -> {fileName}");
                    rs = await UnzipUnbuffered(logName, fw, fileName, zipEntryTester, zipEntryProcessors, workingDirectory, workingDirectory);
                }
                else
                {
                    await fw.Log($"{nameof(DownloadUnzipUnbuffered)}-{logName}", $"File is not a zip, calling {nameof(ProcessFile)} for {url} -> {fileName}");
                    var (tr, pr) = await ProcessFile(new FileInfo(Path.Combine(workingDirectory, fileName)), zipEntryTester, zipEntryProcessors);
                    rs[tr] = new[] { pr };
                }
            }
            finally
            {
                await fw.Log($"{nameof(DownloadUnzipUnbuffered)}-{logName}", $"Deleting files for {url} -> {fileName}");
                _ = Fs.TryDeleteFile(workingDirectory + "\\" + ufn + ".tmp");
                var dir = new DirectoryInfo(workingDirectory + "\\" + ufn);
                if (dir.Exists)
                {
                    dir.Delete(true);
                }
            }

            await fw.Log($"{nameof(DownloadUnzipUnbuffered)}-{logName}", $"Completed for {url} -> {fileName}");

            return rs;
        }

        public static async Task<Dictionary<string, IEnumerable<T>>> UnzipUnbuffered<T>(string logName, FrameworkWrapper fw, string fileName, Func<FileInfo, Task<string>> zipEntryTester, Dictionary<string, Func<FileInfo, Task<T>>> zipEntryProcessors, string fileSourceDirectory, string fileDestinationDirectory, int? timeout = null)
        {
            var ufn = Guid.NewGuid().ToString();
            var results = new Dictionary<string, IList<T>>();
            try
            {
                if (timeout.HasValue)
                {
                    await UnixWrapper.UnzipZip(fileSourceDirectory, fileName, fileDestinationDirectory + "\\" + ufn, timeout.Value);
                }
                else
                {
                    await UnixWrapper.UnzipZip(fileSourceDirectory, fileName, fileDestinationDirectory + "\\" + ufn);
                }

                await fw.Log($"{nameof(UnzipUnbuffered)}-{logName}", $"Unzipped {fileName} to {fileDestinationDirectory}\\{ufn}");

                var dir = new DirectoryInfo(fileDestinationDirectory + "\\" + ufn);
                var files = dir.GetFiles("*", SearchOption.AllDirectories);

                await fw.Log($"{nameof(UnzipUnbuffered)}-{logName}", $"{fileName} contains {files.Length} files");

                foreach (var f in files)
                {
                    var (tr, pr) = await ProcessFile(f, zipEntryTester, zipEntryProcessors);
                    await fw.Log($"{nameof(UnzipUnbuffered)}-{logName}", $"ProcessFile {f.Name} returned {tr} {pr}");
                    if (!results.TryGetValue(tr, out var prs))
                    {
                        prs = new List<T>();
                        results[tr] = prs;
                    }

                    prs.Add(pr);
                }
            }
            finally
            {
                var dir = new DirectoryInfo(fileDestinationDirectory + "\\" + ufn);
                if (dir.Exists)
                {
                    dir.Delete(true);
                }
            }

            return results.ToDictionary(kvp => kvp.Key, kvp => (IEnumerable<T>)kvp.Value);
        }

        public static async Task<(string, T)> ProcessFile<T>(FileInfo file, Func<FileInfo, Task<string>> fileTester, Dictionary<string, Func<FileInfo, Task<T>>> fileProcessors)
        {
            var tr = await fileTester(file);
            var pr = await fileProcessors[tr](file);
            return (tr, pr);
        }

        public static async Task UploadStream(string fileName, Stream stream, string host, string userName, string password, bool enableSsl = false)
        {
            var ftpReq = (FtpWebRequest)WebRequest.Create("ftp://" + host + "/" + fileName);
            ftpReq.UseBinary = true;
            ftpReq.Method = WebRequestMethods.Ftp.UploadFile;
            ftpReq.Credentials = new NetworkCredential(userName, password);
            ftpReq.EnableSsl = enableSsl;

            using (var s = ftpReq.GetRequestStream())
            {
                ftpReq.ContentLength = stream.Length;
                while (true)
                {
                    var buf = new byte[1000000];
                    var numRead = await stream.ReadAsync(buf);

                    if (numRead > 0)
                    {
                        await s.WriteAsync(buf.AsMemory(0, numRead));
                    }
                    else
                    {
                        break;
                    }
                }
            }

            _ = await ftpReq.GetResponseAsync();
        }

        public static async Task UploadFile(string sourceFile, string targetFile, string host, string userName, string password, bool enableSsl = false)
        {
            using var f = File.OpenRead(sourceFile);
            await UploadStream(targetFile, f, host, userName, password, enableSsl);
        }

        public static async Task DeleteFileFromFtpServer(string remoteFile, string host, int port, string userName, string password, bool enableSsl = false)
        {
            FtpWebResponse response = null;

            try
            {
                var request = (FtpWebRequest)WebRequest.Create(new Uri($@"ftp://{host}:{port}//{remoteFile}"));
                request.Method = WebRequestMethods.Ftp.DeleteFile;
                request.Credentials = new NetworkCredential(userName, password);
                request.EnableSsl = enableSsl;
                response = (FtpWebResponse)await request.GetResponseAsync();
                response.Close();
            }
            finally
            {
                if (response != null)
                {
                    response.Close();
                }
            }
        }

        public static async Task<Stream> GetSFtpFileStream(string sourceFile, string host, int? port, string userName, string keyFilePath = null, string password = null)
        {
            if (keyFilePath.IsNullOrWhitespace() && password.IsNullOrWhitespace())
            {
                throw new ArgumentException($"{nameof(GetSFtpFileStream)} requires either key file or password, both were null.");
            }

            if (!sourceFile.StartsWith("/"))
            {
                sourceFile = $"/{sourceFile}";
            }

            using var client = keyFilePath.IsNullOrWhitespace() ?
                 new SftpClient(host, port ?? 22, userName, password) :
                 new SftpClient(host, port ?? 22, userName, new PrivateKeyFile(keyFilePath));
            try
            {
                client.Connect();
                var ms = new MemoryStream();

                await Task.Factory.FromAsync(client.BeginDownloadFile(sourceFile, ms), client.EndDownloadFile);

                ms.Position = 0;

                return ms;
            }
            finally
            {
                client.Disconnect();
            }
        }

        public static async Task UploadSFtpStream(string destinationPath, Stream stream, string host, int? port, string userName, string keyFilePath = null, string password = null)
        {
            if (keyFilePath.IsNullOrWhitespace() && password.IsNullOrWhitespace())
            {
                throw new ArgumentException($"{nameof(UploadSFtpStream)} requires either key file or password, both were null.");
            }

            if (!destinationPath.StartsWith("/"))
            {
                destinationPath = $"/{destinationPath}";
            }

            using var client = keyFilePath.IsNullOrWhitespace() ?
                 new SftpClient(host, port ?? 22, userName, password) :
                 new SftpClient(host, port ?? 22, userName, new PrivateKeyFile(keyFilePath));
            try
            {
                client.Connect();

                await Task.Factory.FromAsync(client.BeginUploadFile(stream, destinationPath), client.EndUploadFile);
            }
            finally
            {
                client.Disconnect();
            }
        }

        public delegate bool EnumerateDirectoryFunc(int depth, string parent, string name);

        public static async Task<List<(string directory, string file)>> SFtpGetFiles(string dirName, string host, int? port, string userName, string keyFilePath = null, string password = null, EnumerateDirectoryFunc enumerateDirectory = null)
        {

            if (keyFilePath.IsNullOrWhitespace() && password.IsNullOrWhitespace())
            {
                throw new ArgumentException($"{nameof(SFtpGetFiles)} requires either key file or password, both were null.");
            }

            var result = new List<(string directory, string file)>();

            if (dirName.IsNullOrWhitespace())
            {
                dirName = "";
            }
            else if (!dirName.StartsWith("/"))
            {
                dirName = $"/{dirName}";
            }

            using (var client = keyFilePath.IsNullOrWhitespace() ?
                 new SftpClient(host, port ?? 22, userName, password) :
                 new SftpClient(host, port ?? 22, userName, new PrivateKeyFile(keyFilePath)))
            {
                try
                {
                    client.Connect();
                    var depth = -1;

                    async Task getFiles(string basePath)
                    {
                        depth++;
                        foreach (var item in await client.ListDirectoryAsync(basePath))
                        {
                            if (item.IsDirectory)
                            {
                                if (enumerateDirectory?.Invoke(0, basePath, item.Name) == true)
                                {
                                    await getFiles(item.FullName);
                                }
                            }
                            else
                            {
                                result.Add((directory: item.FullName.Replace(item.Name, ""), file: item.Name));
                            }
                        }

                        depth--;
                    }

                    await getFiles(dirName.IfNullOrWhitespace(""));
                }
                finally
                {
                    client.Disconnect();
                }
            }

            return result;
        }

        public static async Task<List<string>> DownloadFilesSFtp(string localPath, string pattern, Func<string, string, Task<bool>> ShouldDownload, string host, int port, string userName, string password)
        {
            SftpClient client;
            var fileNames = new List<string>();

            using (client = new SftpClient(host, port, userName, password))
            {
                client.Connect();
                var files = client.ListDirectory("");

                var tasks = new List<Task>();

                foreach (var file in files)
                {
                    var shouldDownload = await ShouldDownload(file.Name, pattern);
                    if (shouldDownload)
                    {
                        tasks.Add(DownloadFileSFtp(client, file.FullName, localPath + "\\" + file.Name));
                        fileNames.Add(localPath + "\\" + file.Name);
                    }
                }

                await Task.WhenAll(tasks);
                client.Disconnect();
            }

            return fileNames;
        }

        private static async Task DownloadFileSFtp(SftpClient client, string source, string destination)
        {
            using var saveFile = File.OpenWrite(destination);
            var task = Task.Factory.FromAsync(client.BeginDownloadFile(source, saveFile), client.EndDownloadFile);
            await task;
        }

        public static async Task<long> FtpGetFileSize(string fileName, string host, string userName, string password, bool enableSsl = false)
        {
            long fileSize = 0;

            var request = (FtpWebRequest)WebRequest.Create(new Uri(@"ftp://" + host + @"/" + fileName));
            request.Method = WebRequestMethods.Ftp.ListDirectoryDetails;
            request.Credentials = new NetworkCredential(userName, password);
            request.EnableSsl = enableSsl;
            var response = (FtpWebResponse)await request.GetResponseAsync();
            var responseStream = response.GetResponseStream();
            var reader = new StreamReader(responseStream);

            var line = await reader.ReadLineAsync();
            if (!string.IsNullOrEmpty(line))
            {
                var regex =
                    @"^" + //# Start of line
                    @"(?<dir>[\-ld])" + //# File size          
                    @"(?<permission>[\-rwx]{9})" + //# Whitespace          \n
                    @"\s+" + //# Whitespace          \n
                    @"(?<filecode>\d+)" +
                    @"\s+" + //# Whitespace          \n
                    @"(?<owner>\w+)" +
                    @"\s+" + //# Whitespace          \n
                    @"(?<group>\w+)" +
                    @"\s+" + //# Whitespace          \n
                    @"(?<size>\d+)" +
                    @"\s+" + //# Whitespace          \n
                    @"(?<month>\w{3})" + //# Month (3 letters)   \n
                    @"\s+" + //# Whitespace          \n
                    @"(?<day>\d{1,2})" + //# Day (1 or 2 digits) \n
                    @"\s+" + //# Whitespace          \n
                    @"(?<timeyear>[\d:]{4,5})" + //# Time or year        \n
                    @"\s+" + //# Whitespace          \n
                    @"(?<filename>(.*))" + //# Filename            \n
                    @"$"; //# End of line

                var split = new Regex(regex).Match(line);
                fileSize = long.Parse(split.Groups["size"].ToString());
            }

            return fileSize;
        }

        public static async Task<List<string>> DownloadFilesFtp(string localPath, string pattern, Func<string, string, Task<bool>> shouldDownloadFunc, string host, int port, string userName, string password, bool enableSsl = false)
        {
            FtpWebResponse response = null;
            StreamReader reader = null;
            var fileNames = new List<string>();

            try
            {
                var request = (FtpWebRequest)WebRequest.Create(new Uri($@"ftp://{host}:{port}/"));
                request.Method = WebRequestMethods.Ftp.ListDirectoryDetails; // WebRequestMethods.Ftp.ListDirectory would be more efficient here
                request.Credentials = new NetworkCredential(userName, password);
                request.EnableSsl = enableSsl;
                response = (FtpWebResponse)await request.GetResponseAsync();
                var responseStream = response.GetResponseStream();
                reader = new StreamReader(responseStream);

                var files = new List<string>();

                var line = await reader.ReadLineAsync();
                while (!string.IsNullOrEmpty(line))
                {
                    var regex =
                        @"^" + //# Start of line
                        @"(?<dir>[\-ld])" + //# File size          
                        @"(?<permission>[\-rwx]{9})" + //# Whitespace          \n
                        @"\s+" + //# Whitespace          \n
                        @"(?<filecode>\d+)" +
                        @"\s+" + //# Whitespace          \n
                        @"(?<owner>\w+)" +
                        @"\s+" + //# Whitespace          \n
                        @"(?<group>\w+)" +
                        @"\s+" + //# Whitespace          \n
                        @"(?<size>\d+)" +
                        @"\s+" + //# Whitespace          \n
                        @"(?<month>\w{3})" + //# Month (3 letters)   \n
                        @"\s+" + //# Whitespace          \n
                        @"(?<day>\d{1,2})" + //# Day (1 or 2 digits) \n
                        @"\s+" + //# Whitespace          \n
                        @"(?<timeyear>[\d:]{4,5})" + //# Time or year        \n
                        @"\s+" + //# Whitespace          \n
                        @"(?<filename>(.*))" + //# Filename            \n
                        @"$"; //# End of line

                    var split = new Regex(regex).Match(line);
                    var dir = split.Groups["dir"].ToString();
                    var filename = split.Groups["filename"].ToString();
                    var isDirectory = !string.IsNullOrWhiteSpace(dir) &&
                                      dir.Equals("d", StringComparison.OrdinalIgnoreCase);
                    files.Add(filename);
                    line = await reader.ReadLineAsync();
                }

                var tasks = new List<Task>();

                foreach (var file in files)
                {
                    var shouldDownload = await shouldDownloadFunc(file, pattern);
                    if (shouldDownload)
                    {
                        tasks.Add(DownloadFileFtp(localPath, file, file, host, userName, password));
                        fileNames.Add(localPath + "\\" + file);
                    }
                }

                await Task.WhenAll(tasks);
            }
            catch (Exception)
            {
            }
            finally
            {
                if (reader != null)
                {
                    reader.Close();
                }

                if (response != null)
                {
                    response.Close();
                }
            }

            return fileNames;
        }

        public static async Task DownloadFileFtp(string baseDir, string sourceFile, string destinationFile, string host, string userName, string password, bool enableSsl = false)
        {
            using var f = File.OpenWrite(baseDir + @"\" + destinationFile);
            await DownloadFileFtp(f, sourceFile, host, userName, password, enableSsl);
        }

        public static async Task DownloadFilesFtp(string destRoot, string sourceRoot, string userName, string password, IEnumerable<string> fileNames)
        {
            using var c = new WebClient();
            c.Credentials = new NetworkCredential(userName, password);
            foreach (var f in fileNames)
            {
                try
                {
                    await c.DownloadFileTaskAsync(@"ftp://" + sourceRoot + @"/" + f, destRoot + @"\" + f);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    throw;
                }
            }
        }

        public static async Task<Stream> GetFtpFileStream(string sourceFile, string host, string userName, string password, bool enableSsl = false)
        {
            var request = (FtpWebRequest)WebRequest.Create(new Uri(@"ftp://" + host + @"/" + sourceFile));

            request.ServicePoint.ConnectionLimit = 10;
            request.Method = WebRequestMethods.Ftp.DownloadFile;
            request.Credentials = new NetworkCredential(userName, password);
            request.UseBinary = true;
            request.EnableSsl = enableSsl;

            var response = (FtpWebResponse)await request.GetResponseAsync();

            return response.GetResponseStream();
        }

        public static async Task DownloadFileFtp(Stream writeStream, string sourceFile, string host, string userName, string password, bool enableSsl = false)
        {
            using var stream = await GetFtpFileStream(sourceFile, host, userName, password, enableSsl);
            await stream.CopyToAsync(writeStream);
        }

        public static async Task DeleteDirectoriesFromFtpServer(string host, int port, string username, string password, List<string> dirs, bool enableSsl = false)
        {
            FtpWebResponse response = null;
            foreach (var dir in dirs)
            {
                try
                {
                    var request = (FtpWebRequest)WebRequest.Create(new Uri($@"ftp://{host}:{port}/{dir}"));
                    request.Method = WebRequestMethods.Ftp.RemoveDirectory;
                    request.Credentials = new NetworkCredential(username, password);
                    request.EnableSsl = enableSsl;
                    response = (FtpWebResponse)await request.GetResponseAsync();
                    response.Close();
                }
                catch (Exception)
                {
                }
                finally
                {
                    if (response != null)
                    {
                        response.Close();
                    }
                }
            }
        }

        public static void DeleteFileFromSftpServer(string remoteFile, string host, int port, string userName, string password)
        {
            SftpClient client;
            using (client = new SftpClient(host, port, userName, password))
            {
                client.Connect();
                client.DeleteFile(remoteFile);
            }
        }

        public static async Task<Dictionary<string, List<string>>> GetListFiles(string host, string userName, string password, bool enableSsl = false)
        {
            var listFiles = new Dictionary<string, List<string>>();
            var dirs = new List<string>();

            try
            {
                var request = (FtpWebRequest)WebRequest.Create(new Uri($@"ftp://{host}/"));
                request.Method = WebRequestMethods.Ftp.ListDirectory;
                request.Credentials = new NetworkCredential(userName, password);
                request.EnableSsl = enableSsl;
                using var response =
                    (FtpWebResponse)await request.GetResponseAsync()
                        .ConfigureAwait(continueOnCapturedContext: false);
                using var responseStream = response.GetResponseStream();
                using var reader = new StreamReader(responseStream);
                var line = await reader.ReadLineAsync().ConfigureAwait(continueOnCapturedContext: false);
                while (!string.IsNullOrEmpty(line))
                {
                    if (line is not "." and not "..")
                    {
                        dirs.Add(line);
                    }

                    line = await reader.ReadLineAsync().ConfigureAwait(continueOnCapturedContext: false);
                }

                foreach (var dir in dirs)
                {
                    listFiles[dir] = new List<string>();
                    var fileRequest = (FtpWebRequest)WebRequest.Create(new Uri($@"ftp://{host}/{dir}/"));
                    fileRequest.Method = WebRequestMethods.Ftp.ListDirectory;
                    fileRequest.Credentials = new NetworkCredential(userName, password);
                    fileRequest.EnableSsl = enableSsl;
                    using var fileResponse = (FtpWebResponse)await fileRequest.GetResponseAsync()
                        .ConfigureAwait(continueOnCapturedContext: false);
                    using var fileResponseStream = fileResponse.GetResponseStream();
                    using var fileReader = new StreamReader(fileResponseStream);
                    var fileLine = await fileReader.ReadLineAsync()
                        .ConfigureAwait(continueOnCapturedContext: false);
                    while (!string.IsNullOrEmpty(fileLine))
                    {
                        if (fileLine is not "." and not "..")
                        {
                            listFiles[dir].Add(fileLine);
                        }

                        fileLine = await fileReader.ReadLineAsync()
                            .ConfigureAwait(continueOnCapturedContext: false);
                    }
                }
            }
            catch (Exception)
            {
            }

            return listFiles;
        }

        public static async Task<List<string>> FtpGetFiles(string dirName, string host, string userName, string password, bool enableSsl = false)
        {
            var files = new List<string>();

            var fileRequest = dirName != null && dirName.Length > 0
                ? (FtpWebRequest)WebRequest.Create(new Uri($@"ftp://{host}/{dirName}/"))
                : (FtpWebRequest)WebRequest.Create(new Uri($@"ftp://{host}/"));
            fileRequest.Method = WebRequestMethods.Ftp.ListDirectory;
            fileRequest.Credentials = new NetworkCredential(userName, password);
            fileRequest.EnableSsl = enableSsl;
            using (var fileResponse =
                (FtpWebResponse)await fileRequest.GetResponseAsync()
                    .ConfigureAwait(continueOnCapturedContext: false))
            {
                using var fileResponseStream = fileResponse.GetResponseStream();
                using var fileReader = new StreamReader(fileResponseStream);
                var fileLine = await fileReader.ReadLineAsync()
                    .ConfigureAwait(continueOnCapturedContext: false);
                while (!string.IsNullOrEmpty(fileLine))
                {
                    if (fileLine is not "." and not "..")
                    {
                        files.Add(fileLine);
                    }

                    fileLine = await fileReader.ReadLineAsync()
                        .ConfigureAwait(continueOnCapturedContext: false);
                }
            }

            return files;
        }

        public static async Task<Entity.Entity> HttpPostAsyncGe(Entity.Entity entity)
        {
            var parms = await entity.GetD<string>("parms");

            var resp = await HttpPostAsync(await entity.GetS("uri"), parms, !string.IsNullOrEmpty(await entity.GetS("timeout")) ? double.Parse(await entity.GetS("timeout")) : 60, await entity.GetS("mediaType") ?? "");
            return entity.Create(new { result = await entity.Parse("application/json", resp) });
        }

        public static async Task<string> HttpPostAsync(string uri, IDictionary<string, string> parms, double timeoutSeconds = 60, string mediaType = "", int maxConnections = 5, IEnumerable<(string key, string value)> headers = null, bool doThrow = false)
        {
            var result = await HttpPostGetHeadersAsync(uri, parms, timeoutSeconds, mediaType, maxConnections, headers, doThrow);
            return result.body;
        }

        public static async Task<(string body, IDictionary<string, IEnumerable<string>> headers)> HttpPostGetHeadersAsync(string uri, IDictionary<string, string> parms, double timeoutSeconds = 60, string mediaType = "", int maxConnections = 5, IEnumerable<(string key, string value)> headers = null, bool doThrow = false)
        {
            HttpContent httpContent = null;
            if (parms.Count == 1 && parms[""] != null)
            {
                httpContent = new StringContent(parms[""].ToString(), Encoding.UTF8, mediaType);
            }
            else if (parms.Any())
            {
                httpContent = new FormUrlEncodedContent(parms);
            }

            string responseBody = null;
            IDictionary<string, IEnumerable<string>> responseHeaders = null;

            var client = GetHttpClient(maxConnections, timeoutSeconds);

            using (var requestMessage = new HttpRequestMessage(HttpMethod.Post, uri))
            {
                headers?.ForEach(h => requestMessage.Headers.Add(h.key, h.value));
                requestMessage.Content = httpContent;
                using var response = await client.SendAsync(requestMessage);
                if (response.IsSuccessStatusCode)
                {
                    responseHeaders = response.Headers.ToDictionary(h => h.Key, h => h.Value);
                    responseBody = await response.Content.ReadAsStringAsync();
                }
                else if (doThrow)
                {
                    try
                    {
                        responseBody = await response.Content.ReadAsStringAsync();
                    }
                    catch
                    {
                    }

                    throw new InvalidOperationException($"HttpPostGetHeadersAsync Failed. code: {response.StatusCode} reason: {response.ReasonPhrase} body: {responseBody}");
                }
            }

            return (responseBody, responseHeaders);
        }

        public static async Task<string> HttpPostAsync(string uri, string content = null, string mediaType = null, int timeoutSeconds = 60)
        {
            var client = GetHttpClient(timeoutSeconds: timeoutSeconds);

            var httpContent = new StringContent(content ?? string.Empty, Encoding.UTF8, mediaType);

            using var requestMessage = new HttpRequestMessage(HttpMethod.Post, uri)
            {
                Content = httpContent
            };

            using var response = await client.SendAsync(requestMessage);
            return await response.Content.ReadAsStringAsync();
        }

        public static async Task<Entity.Entity> HttpGetAsync(Entity.Entity entity)
        {
            var (success, body) = await HttpGetAsync(await entity.GetS("uri"), null, !string.IsNullOrEmpty(await entity.GetS("timeout")) ? double.Parse(await entity.GetS("timeout")) : 60);
            return entity.Create(new { success, result = await entity.Parse("application/json", body) });
        }

        public static async Task<(bool success, string body)> HttpGetAsync(string path, IEnumerable<(string key, string value)> headers = null, double timeoutSeconds = 60)
        {
            var result = await HttpGetHeadersAsync(path, headers, timeoutSeconds);
            return (result.success, result.body);
        }

        public static async Task<(bool success, string body, IDictionary<string, IEnumerable<string>> headers)> HttpGetHeadersAsync(string path, IEnumerable<(string key, string value)> headers = null, double timeoutSeconds = 60)
        {
            var client = GetHttpClient(timeoutSeconds: timeoutSeconds);

            using var requestMessage = new HttpRequestMessage(HttpMethod.Get, path);
            headers?.ForEach(h => requestMessage.Headers.Add(h.key, h.value));

            using var response = await client.SendAsync(requestMessage);
            var responseHeaders = response.Headers.ToDictionary(h => h.Key, h => h.Value);
            return (success: response.IsSuccessStatusCode, body: await response.Content.ReadAsStringAsync(), headers: responseHeaders);
        }

        public static void SendMail(string smtpRelay, int smtpPort, MailMessage msg, bool useSsl = false)
        {
            using var smtp = new SmtpClient(smtpRelay, smtpPort);
            smtp.EnableSsl = useSsl;
            smtp.Send(msg);
        }

        public static IEnumerable<(T reference, Exception ex)> SendMail<T>(string smtpRelay, int smtpPort, IEnumerable<(T reference, MailMessage msg)> messages, bool useSsl = false)
        {
            using var smtp = new SmtpClient(smtpRelay, smtpPort);
            var results = new List<(T reference, Exception ex)>();
            smtp.EnableSsl = useSsl;
            foreach (var msg in messages)
            {
                try
                {
                    smtp.Send(msg.msg);
                    results.Add((msg.reference, null));
                }
                catch (Exception e)
                {
                    results.Add((msg.reference, e));
                }
            }

            return results;
        }

        public static void SendMail(string smtpRelay, int smtpPort, string from, string to, string subject, string body, bool bodyIsHtml = true, bool useSsl = false)
        {
            var msg = new MailMessage(from, to, subject, body) { IsBodyHtml = bodyIsHtml };

            SendMail(smtpRelay, smtpPort, msg, useSsl);
        }

        public static void SendMail(string smtpRelay, int smtpPort, string from, IEnumerable<string> to, string subject, string body, bool bodyIsHtml = true, bool useSsl = false)
        {
            var msg = new MailMessage()
            {
                IsBodyHtml = bodyIsHtml,
                From = new MailAddress(from),
                Subject = subject,
                Body = body
            };

            to.ForEach(t => msg.To.Add(t));

            SendMail(smtpRelay, smtpPort, msg, useSsl);
        }

        public static async Task DownloadFilesFromS3Bucket(string accessKeyId, string secretAccessKey, string bucketName, IEnumerable<string> files, int parallelism, Func<string, string, Task> action)
        {
            using var client = new AmazonS3Client(accessKeyId, secretAccessKey, RegionEndpoint.USEast1);
            using var t = new TransferUtility(client);
            await files.ForEachAsync(parallelism, async s =>
            {
                using var stream = await t.OpenStreamAsync(bucketName, s);
                using var reader = new StreamReader(stream);
                var content = reader.ReadToEnd();
                await action(s, content);
            });
        }

        public static async Task<List<string>> ListFilesFromS3Bucket(string accessKeyId, string secretAccessKey, string bucketName, string path, string pattern)
        {
            var regex = new Regex(pattern);
            using var client = new AmazonS3Client(accessKeyId, secretAccessKey, RegionEndpoint.USEast1);
            var request = new ListObjectsRequest
            {
                BucketName = bucketName,
                Prefix = path
            };
            var response = await client.ListObjectsAsync(request);
            var files = response.S3Objects
                .Where(o => regex.IsMatch(o.Key.Replace(path, string.Empty)))
                .Select(o => o.Key)
                .ToList();
            return files;
        }

        public static async Task<bool> CompareHttpContent(string remoteContentLocation, string contentToCompare)
        {
            var (success, body) = await HttpGetAsync(remoteContentLocation);
            return success && body == contentToCompare;
        }

        public static bool DomElementExists(string uri, string xpath, Stack<(string attr, string attrVal)> attrVals)
        {
            var web = new HtmlWeb();
            var doc = web.Load(uri);
            var nodes = doc.DocumentNode.SelectNodes(xpath);

            bool SearchNodes(Stack<(string attr, string attrVal)> recAttrVals)
            {
                (var attribute, var attributeVal) = recAttrVals.Pop();
                var found = nodes.Select(attr => new { attr, attrValue = attr.GetAttributeValue(attribute, string.Empty) })
                            .Where(x => x.attrValue == attributeVal)
                            .Select(x => x.attrValue).Any();

                return found && (recAttrVals.Count <= 0 || SearchNodes(recAttrVals));
            }
            // if no attributes were specified, rely only on XPath
            // if attributes were specified, rely on both
            return attrVals == null || attrVals.Count == 0 ? nodes.Count > 0 : SearchNodes(attrVals);
        }

        private static HttpClient GetHttpClient(int maxConnectionsPerServer = 0, double timeoutSeconds = 0, DecompressionMethods decompressionMethods = DecompressionMethods.None, string proxyHostAndPort = null) => _httpClients.GetOrAdd((maxConnectionsPerServer, decompressionMethods, proxyHostAndPort, timeoutSeconds), (_) =>
                                                                                                                                                                                                                                {
                                                                                                                                                                                                                                    var handler = new HttpClientHandler()
                                                                                                                                                                                                                                    {
                                                                                                                                                                                                                                        AutomaticDecompression = decompressionMethods,
                                                                                                                                                                                                                                        Proxy = string.IsNullOrWhiteSpace(proxyHostAndPort) ? null : new WebProxy(proxyHostAndPort)
                                                                                                                                                                                                                                    };

                                                                                                                                                                                                                                    if (maxConnectionsPerServer > 0)
                                                                                                                                                                                                                                    {
                                                                                                                                                                                                                                        handler.MaxConnectionsPerServer = maxConnectionsPerServer;
                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                    var client = new HttpClient(handler);

                                                                                                                                                                                                                                    if (timeoutSeconds > 0)
                                                                                                                                                                                                                                    {
                                                                                                                                                                                                                                        client.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                    return client;
                                                                                                                                                                                                                                });
    }
}
