using Renci.SshNet;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml;
using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using HtmlAgilityPack;
using Microsoft.Net.Http.Headers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Renci.SshNet.Async;
using TurnerSoftware.SitemapTools;
using TurnerSoftware.SitemapTools.Parser;
using Utility.EDW.Queueing;
using Utility.GenericEntity;
using Fs = Utility.FileSystem;

namespace Utility
{
    public static class ProtocolClient
    {
        public static async Task DownloadFile(string downloadLink, string destinationDirectoryName,
            string destinationFileName)
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

        public static async Task<object> DownloadPage(string QueryString,
            string basicAuthString,
            Func<string, Task<string>> zipEntryTester,
            Dictionary<string, Func<string, Task<object>>> zipEntryProcessors,
            string proxyHostAndPort = null,
            double timeoutSeconds = 180.0, bool decompress = false,
            int maxConnectionsPerServer = 5)

        {
            object resp = null;
            var responseBody = string.Empty;
            HttpClient client = null;

            if (decompress)
            {
                var handler = new HttpClientHandler()
                {
                    MaxConnectionsPerServer = maxConnectionsPerServer,
                    AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate,
                    Proxy = new WebProxy(proxyHostAndPort)
                };
                client = new HttpClient(handler);
            }
            else
            {
                var handler = new HttpClientHandler()
                {
                    MaxConnectionsPerServer = maxConnectionsPerServer
                };
                client = new HttpClient(handler);
            }

            client.Timeout = TimeSpan.FromSeconds(timeoutSeconds);

            if (basicAuthString != null)
            {
                var byteArray = Encoding.ASCII.GetBytes(basicAuthString);
                client.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
            }

            //client.BaseAddress = new Uri(Url);
            var response = await client.GetAsync(QueryString);
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
                            using (var sr = new StreamReader(entry.Open()))
                            {
                                responseBody = sr.ReadToEnd();
                                var tr = await zipEntryTester(responseBody);
                                var pr = await zipEntryProcessors[tr](responseBody);
                                rs[tr] = pr;
                            }
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

            return resp;
        }

        public static async Task<Dictionary<string, object>> DownloadUnzipUnbuffered(string QueryString,
            string basicAuthString,
            Func<FileInfo, Task<string>> zipEntryTester,
            Dictionary<string, Func<FileInfo, Task<object>>> zipEntryProcessors,
            string workingDirectory,
            double timeoutSeconds = 180.0,
            int maxConnectionsPerServer = 5)

        {
            var responseBody = string.Empty;
            HttpClient client = null;

            var handler = new HttpClientHandler()
            {
                MaxConnectionsPerServer = maxConnectionsPerServer
            };
            client = new HttpClient(handler)
            {
                Timeout = TimeSpan.FromSeconds(timeoutSeconds)
            };

            if (basicAuthString != null)
            {
                var byteArray = Encoding.ASCII.GetBytes(basicAuthString);
                client.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
            }

            var ufn = Guid.NewGuid().ToString();
            var fileName = ufn + ".tmp";
            var rs = new Dictionary<string, object>();

            try
            {
                //client.BaseAddress = new Uri(Url);
                using (var response = await client.GetStreamAsync(QueryString))
                {
                    using (var fs = new FileStream(workingDirectory + "\\" + fileName, FileMode.Create,
                        FileAccess.Write, FileShare.None))
                    {
                        await response.CopyToAsync(fs);
                    }
                }

                rs = await UnzipUnbuffered(fileName, zipEntryTester, zipEntryProcessors, workingDirectory,
                    workingDirectory);
            }
            catch (Exception)
            {
            }
            finally
            {
                Fs.TryDeleteFile(workingDirectory + "\\" + ufn + ".tmp");
                var dir = new DirectoryInfo(workingDirectory + "\\" + ufn);
                if (dir.Exists)
                {
                    dir.Delete(true);
                }
            }

            return rs;
        }

        public static async Task<Dictionary<string, object>> UnzipUnbuffered(string fileName,
            Func<FileInfo, Task<string>> zipEntryTester,
            Dictionary<string, Func<FileInfo, Task<object>>> zipEntryProcessors,
            string fileSourceDirectory,
            string fileDestinationDirectory)
        {
            var ufn = Guid.NewGuid().ToString();
            var rs = new Dictionary<string, object>();
            try
            {
                await UnixWrapper.UnzipZip(fileSourceDirectory, fileName, fileDestinationDirectory + "\\" + ufn);

                var dir = new DirectoryInfo(fileDestinationDirectory + "\\" + ufn);
                foreach (var f in dir.GetFiles())
                {
                    var tr = await zipEntryTester(f);
                    var pr = await zipEntryProcessors[tr](f);
                    rs[tr] = pr;
                }
            }
            finally
            {
                Fs.TryDeleteFile(fileSourceDirectory + "\\" + fileName);
                var dir = new DirectoryInfo(fileDestinationDirectory + "\\" + ufn);
                if (dir.Exists)
                {
                    dir.Delete(true);
                }
            }

            return rs;
        }

        public static async Task UploadStream(string fileName, Stream stream, string host, string userName,
            string password, bool enableSsl = false)
        {
            var ftpReq = (FtpWebRequest) WebRequest.Create("ftp://" + host + "/" + fileName);
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
                        await s.WriteAsync(buf, 0, numRead);
                    }
                    else
                    {
                        break;
                    }
                }
            }

            await ftpReq.GetResponseAsync();
        }

        public static async Task UploadFile(string sourceFile, string targetFile, string host, string userName,
            string password, bool enableSsl = false)
        {
            using (var f = File.OpenRead(sourceFile))
            {
                await UploadStream(targetFile, f, host, userName, password, enableSsl);
            }
        }

        public static async Task DeleteFileFromFtpServer(string remoteFile, string host, int port, string userName,
            string password, bool enableSsl = false)
        {
            FtpWebResponse response = null;

            try
            {
                var request = (FtpWebRequest) WebRequest.Create(new Uri(@"ftp://" + host + @"//" + remoteFile));
                request.Method = WebRequestMethods.Ftp.DeleteFile;
                request.Credentials = new NetworkCredential(userName, password);
                request.EnableSsl = enableSsl;
                response = (FtpWebResponse) (await request.GetResponseAsync());
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
        public static async Task<Stream> GetSFtpFileStreamWithPassword(string sourceFile, string host, int? port, string userName, string password)
        {
            using (var client = port.HasValue ? new SftpClient(host, port.Value, userName, password) : new SftpClient(host, userName, password))
            {
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
        }

        public static async Task<Stream> GetSFtpFileStream(string sourceFile, string host, int? port, string userName,
            string keyFilePath)
        {
            var pk = new PrivateKeyFile(keyFilePath);

            if (!sourceFile.StartsWith("/")) sourceFile = $"/{sourceFile}";

            using (var client = port.HasValue
                ? new SftpClient(host, port.Value, userName, pk)
                : new SftpClient(host, userName, pk))
            {
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
        }

        public static async Task UploadSFtpStream(string destinationPath, Stream stream, string host, int? port,
            string userName, string keyFilePath)
        {
            var pk = new PrivateKeyFile(keyFilePath);

            if (!destinationPath.StartsWith("/")) destinationPath = $"/{destinationPath}";

            using (var client = port.HasValue
                ? new SftpClient(host, port.Value, userName, pk)
                : new SftpClient(host, userName, pk))
            {
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
        }

        public delegate bool EnumerateDirectoryFunc(int depth, string parent, string name);

        public static async Task<List<(string directory, string file)>> SFtpGetFiles(string dirName, string host,
            int? port, string userName, string keyFilePath, EnumerateDirectoryFunc enumerateDirectory = null)
        {
            var pk = new PrivateKeyFile(keyFilePath);
            var result = new List<(string directory, string file)>();

            if (dirName.IsNullOrWhitespace()) dirName = "";
            else if (!dirName.StartsWith("/")) dirName = $"/{dirName}";

            using (var client = port.HasValue
                ? new SftpClient(host, port.Value, userName, pk)
                : new SftpClient(host, userName, pk))
            {
                try
                {
                    client.Connect();
                    int depth = -1;

                    async Task getFiles(string basePath)
                    {
                        depth++;
                        foreach (var item in await client.ListDirectoryAsync(basePath))
                        {
                            if (item.IsDirectory)
                            {
                                if (enumerateDirectory?.Invoke(0, basePath, item.Name) == true)
                                    await getFiles(item.FullName);
                            }
                            else result.Add((directory: item.FullName.Replace(item.Name, ""), file: item.Name));
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

        public static async Task<List<string>> DownloadFilesSFtp(
            string localPath, string pattern, Func<string, string, Task<bool>> ShouldDownload,
            string host, int port, string userName, string password)
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
            using (var saveFile = File.OpenWrite(destination))
            {
                var task = Task.Factory.FromAsync(client.BeginDownloadFile(source, saveFile), client.EndDownloadFile);
                await task;
            }
        }

        public static async Task<long> FtpGetFileSize(string fileName, string host, string userName, string password,
            bool enableSsl = false)
        {
            long fileSize = 0;

            var request = (FtpWebRequest) WebRequest.Create(new Uri(@"ftp://" + host + @"/" + fileName));
            request.Method = WebRequestMethods.Ftp.ListDirectoryDetails;
            request.Credentials = new NetworkCredential(userName, password);
            request.EnableSsl = enableSsl;
            var response = (FtpWebResponse) (await request.GetResponseAsync());
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

        public static async Task<List<string>> DownloadFilesFtp(
            string localPath, string pattern, Func<string, string, Task<bool>> shouldDownloadFunc,
            string host, int port, string userName, string password, bool enableSsl = false)
        {
            FtpWebResponse response = null;
            StreamReader reader = null;
            var fileNames = new List<string>();

            try
            {
                var request = (FtpWebRequest) WebRequest.Create(new Uri(@"ftp://" + host + @"/"));
                request.Method =
                    WebRequestMethods.Ftp
                        .ListDirectoryDetails; // WebRequestMethods.Ftp.ListDirectory would be more efficient here
                request.Credentials = new NetworkCredential(userName, password);
                request.EnableSsl = enableSsl;
                response = (FtpWebResponse) (await request.GetResponseAsync());
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

        public static async Task DownloadFileFtp(string baseDir, string sourceFile, string destinationFile, string host,
            string userName, string password, bool enableSsl = false)
        {
            using (var f = File.OpenWrite(baseDir + @"\" + destinationFile))
            {
                await DownloadFileFtp(f, sourceFile, host, userName, password, enableSsl);
            }
        }

        public static async Task DownloadFilesFtp(string destRoot, string sourceRoot, string userName, string password,
            IEnumerable<string> fileNames)
        {
            using (var c = new WebClient())
            {
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
        }

        public static async Task<Stream> GetFtpFileStream(string sourceFile, string host, string userName,
            string password, bool enableSsl = false)
        {
            var request = (FtpWebRequest) WebRequest.Create(new Uri(@"ftp://" + host + @"/" + sourceFile));

            request.ServicePoint.ConnectionLimit = 10;
            request.Method = WebRequestMethods.Ftp.DownloadFile;
            request.Credentials = new NetworkCredential(userName, password);
            request.UseBinary = true;
            request.EnableSsl = enableSsl;

            var response = (FtpWebResponse) (await request.GetResponseAsync());

            return response.GetResponseStream();
        }

        public static async Task DownloadFileFtp(Stream writeStream, string sourceFile, string host, string userName,
            string password, bool enableSsl = false)
        {
            using (var stream = await GetFtpFileStream(sourceFile, host, userName, password, enableSsl))
            {
                await stream.CopyToAsync(writeStream);
            }
        }

        public static async Task DeleteDirectoriesFromFtpServer(string connectionString, string host, int port,
            string userName,
            string password, List<string> dirs, bool enableSsl = false)
        {
            FtpWebResponse response = null;
            foreach (var dir in dirs)
            {
                try
                {
                    var request = (FtpWebRequest) WebRequest.Create(new Uri($@"ftp://{host}/{dir}"));
                    request.Method = WebRequestMethods.Ftp.RemoveDirectory;
                    request.Credentials = new NetworkCredential(userName, password);
                    request.EnableSsl = enableSsl;
                    response = (FtpWebResponse) (await request.GetResponseAsync());
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

        public static void DeleteFileFromSftpServer(string remoteFile, string host, int port, string userName,
            string password)
        {
            SftpClient client;
            using (client = new SftpClient(host, port, userName, password))
            {
                client.Connect();
                client.DeleteFile(remoteFile);
            }
        }

        public static async Task<Dictionary<string, List<string>>> GetListFiles(
            string host, string userName, string password, bool enableSsl = false)
        {
            //Dictionary<DirName, List<FileName>>
            var listFiles = new Dictionary<string, List<string>>();
            var dirs = new List<string>();

            try
            {
                var request = (FtpWebRequest) WebRequest.Create(new Uri($@"ftp://{host}/"));
                request.Method = WebRequestMethods.Ftp.ListDirectory;
                request.Credentials = new NetworkCredential(userName, password);
                request.EnableSsl = enableSsl;
                using (var response =
                    (FtpWebResponse) (await request.GetResponseAsync()
                        .ConfigureAwait(continueOnCapturedContext: false)))
                {
                    using (var responseStream = response.GetResponseStream())
                    {
                        using (var reader = new StreamReader(responseStream))
                        {
                            var line = await reader.ReadLineAsync().ConfigureAwait(continueOnCapturedContext: false);
                            while (!string.IsNullOrEmpty(line))
                            {
                                if (line != "." && line != "..")
                                {
                                    dirs.Add(line);
                                }

                                line = await reader.ReadLineAsync().ConfigureAwait(continueOnCapturedContext: false);
                            }

                            foreach (var dir in dirs)
                            {
                                listFiles[dir] = new List<string>();
                                var fileRequest = (FtpWebRequest) WebRequest.Create(new Uri($@"ftp://{host}/{dir}/"));
                                fileRequest.Method = WebRequestMethods.Ftp.ListDirectory;
                                fileRequest.Credentials = new NetworkCredential(userName, password);
                                fileRequest.EnableSsl = enableSsl;
                                using (var fileResponse = (FtpWebResponse) (await fileRequest.GetResponseAsync()
                                    .ConfigureAwait(continueOnCapturedContext: false)))
                                {
                                    using (var fileResponseStream = fileResponse.GetResponseStream())
                                    {
                                        using (var fileReader = new StreamReader(fileResponseStream))
                                        {
                                            var fileLine = await fileReader.ReadLineAsync()
                                                .ConfigureAwait(continueOnCapturedContext: false);
                                            while (!string.IsNullOrEmpty(fileLine))
                                            {
                                                if (fileLine != "." && fileLine != "..")
                                                {
                                                    listFiles[dir].Add(fileLine);
                                                }

                                                fileLine = await fileReader.ReadLineAsync()
                                                    .ConfigureAwait(continueOnCapturedContext: false);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception)
            {
            }

            return listFiles;
        }

        public static async Task<List<string>> FtpGetFiles(
            string dirName, string host, string userName, string password, bool enableSsl = false)
        {
            var files = new List<string>();

            FtpWebRequest fileRequest;
            if (dirName != null && dirName.Length > 0)
            {
                fileRequest = (FtpWebRequest) WebRequest.Create(new Uri($@"ftp://{host}/{dirName}/"));
            }
            else
            {
                fileRequest = (FtpWebRequest) WebRequest.Create(new Uri($@"ftp://{host}/"));
            }

            fileRequest.Method = WebRequestMethods.Ftp.ListDirectory;
            fileRequest.Credentials = new NetworkCredential(userName, password);
            fileRequest.EnableSsl = enableSsl;
            using (var fileResponse =
                (FtpWebResponse) (await fileRequest.GetResponseAsync()
                    .ConfigureAwait(continueOnCapturedContext: false)))
            {
                using (var fileResponseStream = fileResponse.GetResponseStream())
                {
                    using (var fileReader = new StreamReader(fileResponseStream))
                    {
                        var fileLine = await fileReader.ReadLineAsync()
                            .ConfigureAwait(continueOnCapturedContext: false);
                        while (!string.IsNullOrEmpty(fileLine))
                        {
                            if (fileLine != "." && fileLine != "..")
                            {
                                files.Add(fileLine);
                            }

                            fileLine = await fileReader.ReadLineAsync()
                                .ConfigureAwait(continueOnCapturedContext: false);
                        }
                    }
                }
            }

            return files;
        }

        public static async Task<IGenericEntity> HttpPostAsyncGe(FrameworkWrapper fw, IGenericEntity ge)
        {
            var parms = new Dictionary<string, string>();
            foreach (var di in ge.GetD("parms"))
            {
                parms.Add(di.Item1, di.Item2);
            }

            var resp = await HttpPostAsync(ge.GetS("uri"), parms,
                !string.IsNullOrEmpty(ge.GetS("timeout")) ? double.Parse(ge.GetS("timeout")) : 60,
                ge.GetS("mediaType") ?? "");
            return JsonWrapper.JsonToGenericEntity(JsonWrapper.Json(new {result = resp}));
        }

        public static async Task<string> HttpPostAsync(string uri, IDictionary<string, string> parms,
            double timeoutSeconds = 60, string mediaType = "", int maxConnections = 5,
            IEnumerable<(string key, string value)> headers = null)
        {
            var result = await HttpPostGetHeadersAsync(uri, parms, timeoutSeconds, mediaType, maxConnections, headers);
            return result.body;
        }

        public static async Task<(string body, IDictionary<string, IEnumerable<string>> headers)>
            HttpPostGetHeadersAsync(string uri, IDictionary<string, string> parms,
                double timeoutSeconds = 60, string mediaType = "", int maxConnections = 5,
                IEnumerable<(string key, string value)> headers = null)
        {
            string responseBody = null;

            HttpContent httpContent = null;
            if (parms.Count == 1 && parms[""] != null)
            {
                httpContent = new StringContent(parms[""].ToString(), Encoding.UTF8, mediaType);
            }
            else if (parms.Any())
            {
                httpContent = new FormUrlEncodedContent(parms);
            }

            var cookies = new CookieContainer();
            var handler = new HttpClientHandler
            {
                MaxConnectionsPerServer = maxConnections,
                CookieContainer = cookies
            };

            IDictionary<string, IEnumerable<string>> responseHeaders = null;
            using (var client = new HttpClient(handler))
            {
                headers?.ForEach(h => client.DefaultRequestHeaders.Add(h.key, h.value));
                client.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
                var response = await client.PostAsync(uri, httpContent);
                if (response.IsSuccessStatusCode)
                {
                    responseHeaders = response.Headers.ToDictionary(h => h.Key, h => h.Value);
                    var setCookies = cookies.GetCookies(new Uri(uri));
                    if (setCookies.Count > 0 && !responseHeaders.ContainsKey("Set-Cookie"))
                    {
                        var strList = setCookies.Cast<Cookie>().Select(c => c.ToString()).ToList();
                        var cookiesStr = string.Join(';', strList);
                        responseHeaders.Add("Set-Cookie", new[] {cookiesStr});
                    }

                    responseBody = await response.Content.ReadAsStringAsync();
                }
            }

            return (responseBody, responseHeaders);
        }

        // "application/json"
        public static async Task<string> HttpPostAsync(string uri, string content, string mediaType,
            int timeoutSeconds = 60)
        {
            var http = (HttpWebRequest) WebRequest.Create(new Uri(uri));
            http.Accept = mediaType;
            http.ContentType = mediaType;
            http.Method = "POST";
            http.Timeout = timeoutSeconds * 1000;

            var encoding = new ASCIIEncoding();
            var bytes = encoding.GetBytes(content);

            var newStream = await http.GetRequestStreamAsync();
            await newStream.WriteAsync(bytes, 0, bytes.Length);
            newStream.Close();

            var response = await http.GetResponseAsync();
            var stream = response.GetResponseStream();
            var sr = new StreamReader(stream);
            return await sr.ReadToEndAsync();
        }

        public static async Task<IGenericEntity> HttpGetAsync(FrameworkWrapper fw, IGenericEntity ge)
        {
            var (success, body) = await HttpGetAsync(ge.GetS("uri"), null,
                !string.IsNullOrEmpty(ge.GetS("timeout")) ? double.Parse(ge.GetS("timeout")) : 60);
            return JsonWrapper.JsonToGenericEntity(JsonWrapper.Json(new {success, result = body}));
        }

        public static async Task<(bool success, string body)> HttpGetAsync(string path,
            IEnumerable<(string key, string value)> headers = null, double timeoutSeconds = 60)
        {
            var result = await HttpGetHeadersAsync(path, headers, timeoutSeconds);
            return (result.success, result.body);
        }

        public static async Task<(bool success, string body, IDictionary<string, IEnumerable<string>> headers)>
            HttpGetHeadersAsync(string path,
                IEnumerable<(string key, string value)> headers = null, double timeoutSeconds = 60)
        {
            using (var client = new HttpClient())
            {
                client.Timeout = TimeSpan.FromSeconds(timeoutSeconds);

                headers?.ForEach(h => client.DefaultRequestHeaders.Add(h.key, h.value));

                using (var response = await client.GetAsync(path))
                {
                    var responseHeaders = response.Headers.ToDictionary(h => h.Key, h => h.Value);
                    return (success: response.IsSuccessStatusCode, body: await response.Content.ReadAsStringAsync(),
                        headers: responseHeaders);
                }
            }
        }

        public static void SendMail(string smtpRelay, int smtpPort, MailMessage msg, bool useSsl = false)
        {
            using (var smtp = new SmtpClient(smtpRelay, smtpPort))
            {
                smtp.EnableSsl = useSsl;
                smtp.Send(msg);
            }
        }

        public static IEnumerable<(T reference, Exception ex)> SendMail<T>(string smtpRelay, int smtpPort,
            IEnumerable<(T reference, MailMessage msg)> messages, bool useSsl = false)
        {
            using (var smtp = new SmtpClient(smtpRelay, smtpPort))
            {
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
        }

        public static void SendMail(string smtpRelay, int smtpPort, string from, string to, string subject, string body,
            bool bodyIsHtml = true, bool useSsl = false)
        {
            var msg = new MailMessage(from, to, subject, body) {IsBodyHtml = bodyIsHtml};

            SendMail(smtpRelay, smtpPort, msg, useSsl);
        }

        public static void SendMail(string smtpRelay, int smtpPort, string from, IEnumerable<string> to, string subject,
            string body, bool bodyIsHtml = true, bool useSsl = false)
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

        public static Task DownloadFileFromS3Bucket(string accessKeyId, string secretAccessKey,
            string bucketName, string destination, string file)
        {
            return DownloadFilesFromS3Bucket(accessKeyId, secretAccessKey, bucketName, destination, new[] {file}, 1);
        }

        public static async Task DownloadFilesFromS3Bucket(string accessKeyId, string secretAccessKey,
            string bucketName, string destination, IEnumerable<string> files, int parallelism)
        {
            using (var client = new AmazonS3Client(accessKeyId, secretAccessKey, RegionEndpoint.USEast1))
            {
                using (var t = new TransferUtility(client))
                {
                    await files.ForEachAsync(parallelism, s =>
                    {
                        var fName = s.Split("/").Last();
                        return t.DownloadAsync($"{destination}\\{fName}", bucketName, s);
                    });
                }
            }
        }

        public static async Task<List<string>> ListFilesFromS3Bucket(string accessKeyId, string secretAccessKey,
            string bucketName, string path, string pattern)
        {
            var regex = new Regex(pattern);
            using (var client = new AmazonS3Client(accessKeyId, secretAccessKey, RegionEndpoint.USEast1))
            {
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
        }

        public static async Task DownloadNotifyAiJson(FrameworkWrapper fw, string username, string password,
            DateTime startDate, DateTime endDate, string destFile)
        {
            var parameters = new Dictionary<string, string>
            {
                [""] = "{\"username\":\"" + username + "\", \"password\":\"" + password + "\",\"rememberMe\":false}"
            };
            var response = await HttpPostAsync("https://app.notifyai.io/api/authenticate", parameters, 60,
                "application/json", 1);
            var ge = JsonWrapper.ToGenericEntity(JsonWrapper.TryParse(response));
            var token = ge.GetS("id_token");
            var headers = new List<(string key, string value)> {("Authorization", "Bearer " + token)};
            var start = startDate.ToString("yyyy-MM-dd");
            var end = endDate.ToString("yyyy-MM-dd");
            var url = $"https://app.notifyai.io/api/rollup-push-sites/all-stats/" + start + "/" + end + "/";

            var (success, body) = await HttpGetAsync(url, headers);
            if (success)
            {
                await File.WriteAllTextAsync(destFile, body);
            }
            else
            {
                await fw.Error(nameof(DownloadNotifyAiJson),
                    $"Could not download file for startDate: {startDate} endDate: {endDate}");
            }
        }

        public static async Task DownloadHitPathJson(FrameworkWrapper fw, string url, string key, string type,
            DateTime startDate, DateTime endDate, string destFile)
        {
            var rqst = url + "?key=" + key + "&type=" + type + "&start=" +
                       System.Web.HttpUtility.UrlEncode(startDate.ToShortDateString())
                       + "&end=" + System.Web.HttpUtility.UrlEncode(endDate.ToShortDateString()) +
                       "&all_details=true&nozip=1";

            var (success, body) = await HttpGetAsync(rqst);
            if (success)
            {
                await File.WriteAllTextAsync(destFile, body);
            }
            else
            {
                await fw.Error(nameof(DownloadNotifyAiJson),
                    $"Could not download file for startDate: {startDate} endDate: {endDate}");
            }
        }


        public static async Task DownloadCakeJson(FrameworkWrapper fw, string affiliateId, string key, string url,
            string type, DateTime startDate, DateTime endDate, string destFile)
        {
            // url = https://ckadmin.com/affiliates/api/Reports/

            // https://ckadmin.com/affiliates/api/Reports/Clicks?               start_date=10%2F22%2F2019&end_date=10%2F23%2F2019
            // https://ckadmin.com/affiliates/api/Reports/Conversions?          start_date=10%2F22%2F2019&end_date=10%2F23%2F2019&conversion_type=all&exclude_bot_traffic=true&unbilled_only=true&start_at_row=1&row_limit=30&api_key=nuzgj47Oafmy9r6cuVwHkg&affiliate_id=1968
            // https://ckadmin.com/affiliates/api/Reports/SubAffiliateSummary?  start_date=10%2F22%2F2019&end_date=10%2F23%2F2019&conversion_type=all&start_at_row=1&row_limit=30&api_key=nuzgj47Oafmy9r6cuVwHkg&affiliate_id=1968

            var urlTemplate = url + type + "?start_date=" +
                              System.Web.HttpUtility.UrlEncode(startDate.ToShortDateString())
                              + "&end_date=" + System.Web.HttpUtility.UrlEncode(endDate.ToShortDateString())
                              + "&api_key=" + System.Web.HttpUtility.UrlEncode(key)
                              + "&affiliate_id=" + System.Web.HttpUtility.UrlEncode(affiliateId);

            var row = 1;
            const int rowLimit = 10;

            var request = urlTemplate + "&start_at_row=" + row
                          + "&row_limit=" + rowLimit;

            var (success, body) = await HttpGetAsync(request);
            var allRows = new List<object>();
            try
            {
                do
                {
                    var ge = JsonWrapper.JsonToGenericEntity(body);

                    if (!success)
                        throw new InvalidOperationException("bad cake request");

                    var rowCount = int.Parse(ge.GetS("row_count"));
                    if (rowCount == 0)
                        break;

                    row += rowCount;
                    var results = ge.Get<System.Collections.Generic.IEnumerable<object>>("data").ToList();
                    allRows.AddRange(results);

                    if (rowCount < rowLimit)
                        break;

                    request = urlTemplate + "&start_at_row=" + row
                              + "&row_limit=" + rowLimit;
                    (success, body) = await HttpGetAsync(request);

                } while (true);


                var json = JsonWrapper.Serialize(new Dictionary<string, object>
                {
                    ["row_count"] = row,
                    ["data"] = allRows
                });

                await File.WriteAllTextAsync(destFile, json);
            }
            catch (Exception e)
            {
                await fw.Error(nameof(DownloadCakeJson),
                    $"Cake response from {url} was invalid xml.\r\nResponse:\r\n{body}");
            }
        }

        public static async Task SendNotification(FrameworkWrapper fw, string from, string to, string subject,
            string uri)
        {
            var payload = PL.O(new
            {
                from_address = from,
                subject,
                body = uri
            });
            var addresses = JsonConvert.SerializeObject(new object[] {new {email_address = to}});
            payload.Add(PL.O(new {email_addresses = addresses}, new[] {false}));
            await fw.PostingQueueWriter.Write(new PostingQueueEntry("SendEmail", DateTime.Now, payload.ToString()));
        }

        public static async Task RunPushnamiOnDomains(FrameworkWrapper fw, IEnumerable<string> domains)
        {
            const string serviceWorker =
                "if (typeof window === \"undefined\") {\n" +
                "\timportScripts('https://secureanalytic.com/scripts/ext/script/57dkr96ew8?url='+encodeURI(self.location.hostname));\n" +
                "}\n" +
                "importScripts(\"https://api.pushnami.com/scripts/v2/pushnami-sw/5b271c911f0c9927d30443f5\");";

            foreach (var domain in domains)
            {
                // Compare service worker
                var (success, body) = await HttpGetAsync("https://" + domain + "/service-worker.js");
                if (!success || body != serviceWorker)
                    continue;

                var siteMapQuery = new SitemapQuery();
                var siteMaps = await siteMapQuery.GetAllSitemapsForDomain(domain);
                var uris = new List<Uri>();
                foreach (var siteMapFile in siteMaps)
                {
                    if (!siteMapFile.Location.ToString().EndsWith("page-sitemap.xml")) continue;

                    uris.AddRange(siteMapFile.Urls
                        .Where(u => u.Location != null)
                        .Select(u => u.Location)
                        .ToList());
                }

                if (uris.Count == 0)
                    uris.Add(new Uri("https://" + domain + "/"));

                var web = new HtmlWeb();

                foreach (var uri in uris)
                {
                    var doc = web.Load(uri);
                    var found = doc.DocumentNode.SelectNodes("//link[@rel]")
                        .Select(link => new {link, relValue = link.GetAttributeValue("rel", string.Empty)})
                        .Select(@t => new {@t, hrefValue = @t.link.GetAttributeValue("href", string.Empty)})
                        .Where(@t => @t.@t.relValue == "dns-prefetch" && @t.hrefValue == "//api.pushnami.com")
                        .Select(@t => @t.@t.relValue).Any();

                    if (!found)
                    {
                        foreach (var script in doc.DocumentNode.SelectNodes("//script[@src]"))
                        {
                            var srcValue = script.GetAttributeValue("src", string.Empty);
                            if (srcValue != "https://api.pushnami.com/scripts/v1/push/5b27f5fe56cc4120d071a221")
                                continue;
                            found = true;
                            break;
                        }
                    }

                    if (!found)
                        await SendNotification(fw, "llvovsky@onpointglobal.com", "llvovsky@onpointglobal.com",
                            "Pushnami could not be found", uri.ToString());
                }
            }
        }

        public static async Task DownloadPushyJson(FrameworkWrapper fw, string username, string password,
            DateTime startDate, DateTime endDate, string destFile)
        {
            string csrftoken = null;
            // First perform a GET on https://pushy.ai/partner/login/ to get a csrftoken cookie
            var getResponse = await HttpGetHeadersAsync("https://pushy.ai/partner/login/");
            if (getResponse.success && getResponse.headers.TryGetValue("Set-Cookie", out var cookie))
            {
                SetCookieHeaderValue.ParseList(cookie.SelectMany(s => s.Split(';')).ToList()).ForEach(c =>
                {
                    if (c.Name == "csrftoken")
                        csrftoken = c.Value.ToString();
                });
            }

            //Also get the csrfmiddlewaretoken out of the page
            var doc = new HtmlDocument();
            doc.LoadHtml(getResponse.body);
            var csrfmiddlewaretoken = doc.DocumentNode.SelectNodes("//input[@name]")
                .Select(input => new
                {
                    name = input.GetAttributeValue("name", string.Empty),
                    value = input.GetAttributeValue("value", string.Empty)
                })
                .Where(@t => @t.name == "csrfmiddlewaretoken")
                .Select(@t => @t.value)
                .FirstOrDefault();

            // todo: throw if not token

            var parameters = new Dictionary<string, string>
            {
                ["csrfmiddlewaretoken"] = csrfmiddlewaretoken,
                ["username"] = username,
                ["password"] = password
            };
            var headers = new List<(string key, string value)>
            {
                ("Referer", "https://pushy.ai/partner/login/"),
                ("cookie", "csrftoken=" + csrftoken)
            };

            var response =
                await HttpPostGetHeadersAsync("https://pushy.ai/partner/login/", parameters, 60, "", 1, headers);

            string sessionId = null;
            string csrftoken2 = null;
            // Now get login token from response
            if (response.headers.TryGetValue("Set-Cookie", out var cookie2))
            {
                SetCookieHeaderValue.ParseList(cookie2.SelectMany(s => s.Split(';')).ToList()).ForEach(c =>
                {
                    if (c.Name == "csrftoken")
                        csrftoken2 = c.Value.ToString();
                    if (c.Name == "sessionid")
                        sessionId = c.Value.ToString();
                });
            }

            headers = new List<(string key, string value)>
            {
                ("cookie", "csrftoken=" + csrftoken2 + ";sessionid=" + sessionId)
            };
            var url =
                "https://pushy.ai/partner/stats-data/?startdate=" + System.Web.HttpUtility.UrlEncode(
                                                                      startDate.ToShortDateString())
                                                                  + "&enddate=" +
                                                                  System.Web.HttpUtility.UrlEncode(
                                                                      endDate.ToShortDateString())
                                                                  + "&group_by=";
            var result = await HttpPostAsync(url, new Dictionary<string, string>(), 60, "application/json", 1, headers);
            await File.WriteAllTextAsync(destFile, result);
        }

        public static async Task DownloadFromGoogleDrive(string fileId, string destFile)
        {
            var url = "https://docs.google.com/spreadsheets/d/" + fileId + "/export?exportFormat=csv";
            var (success, body) = await HttpGetAsync(url);
            if (success)
                await File.WriteAllTextAsync(destFile, body);
        }
    }
}
