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
using Microsoft.AspNetCore.Http.Internal;
using Fs = Utility.FileSystem;

namespace Utility
{
    public static class ProtocolClient
    {
        public static async Task DownloadFile(string downloadLink, string destinationDirectoryName,
            string destinationFileName)
        {
            try
            {
                string tmpLocation = $@"{destinationDirectoryName}\__dwnld.{destinationFileName}";
                using (var wc = new WebClient())
                {
                    await wc.DownloadFileTaskAsync(new Uri(downloadLink), tmpLocation)
                                    .ConfigureAwait(continueOnCapturedContext: false);
                }
                File.Move(tmpLocation, $@"{destinationDirectoryName}\{destinationFileName}");
                Task _ = Task.Factory.StartNew(() => File.Delete(tmpLocation), TaskCreationOptions.LongRunning);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public static async Task<object> DownloadPage(string QueryString,
            string basicAuthString,
            Func<string, Task<string>> zipEntryTester,
            Dictionary<string, Func<string, Task<object>>> zipEntryProcessors,
            double timeoutSeconds = 180.0, bool decompress = false,
            int maxConnectionsPerServer = 5)

        {
            object resp = null;
            string responseBody = String.Empty;
            HttpClient client = null;

            if (decompress)
            {
                HttpClientHandler handler = new HttpClientHandler()
                {
                    MaxConnectionsPerServer = maxConnectionsPerServer,
                    AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
                };
                client = new HttpClient(handler);
            }
            else
            {
                HttpClientHandler handler = new HttpClientHandler()
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
            HttpResponseMessage response = await client.GetAsync(QueryString);
            if (response.IsSuccessStatusCode)
            {
                if (decompress)
                {
                    Dictionary<string, object> rs = new Dictionary<string, object>();
                    var responseStream = await response.Content.ReadAsStreamAsync();
                    using (var zip = new ZipArchive(responseStream, ZipArchiveMode.Read))
                    {
                        foreach (var entry in zip.Entries)
                        {
                            using (StreamReader sr = new StreamReader(entry.Open()))
                            {
                                responseBody = sr.ReadToEnd();
                                string tr = await zipEntryTester(responseBody);
                                object pr = await zipEntryProcessors[tr](responseBody);
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
                throw new Exception("HttpResponseMessage.IsSuccessStatusCode was false.");
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
            string responseBody = String.Empty;
            HttpClient client = null;

            HttpClientHandler handler = new HttpClientHandler()
            {
                MaxConnectionsPerServer = maxConnectionsPerServer
            };
            client = new HttpClient(handler);

            client.Timeout = TimeSpan.FromSeconds(timeoutSeconds);

            if (basicAuthString != null)
            {
                var byteArray = Encoding.ASCII.GetBytes(basicAuthString);
                client.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
            }

            string ufn = Guid.NewGuid().ToString();
            var fileName = ufn + ".tmp";
            var rs = new Dictionary<string, object>();

            try
            {
                //client.BaseAddress = new Uri(Url);
                using (var response = await client.GetStreamAsync(QueryString))
                {
                    using (var fs = new FileStream(workingDirectory + "\\" + fileName, FileMode.Create, FileAccess.Write, FileShare.None))
                    {
                        await response.CopyToAsync(fs);
                    }
                }

                rs = await UnzipUnbuffered(fileName, zipEntryTester, zipEntryProcessors, workingDirectory, workingDirectory);
            }
            catch (Exception exGetStream)
            {
                int i = 0;
            }
            finally
            {
                Fs.TryDeleteFile(workingDirectory + "\\" + ufn + ".tmp");
                DirectoryInfo dir = new DirectoryInfo(workingDirectory + "\\" + ufn);
                if (dir.Exists) dir.Delete(true);
            }

            return rs;
        }

        public static async Task<Dictionary<string, object>> UnzipUnbuffered(string fileName,
            Func<FileInfo, Task<string>> zipEntryTester,
            Dictionary<string, Func<FileInfo, Task<object>>> zipEntryProcessors,
            string fileSourceDirectory,
            string fileDestinationDirectory)

        {
            string ufn = Guid.NewGuid().ToString();
            Dictionary<string, object> rs = new Dictionary<string, object>();
            try
            {
                await UnixWrapper.UnzipZip(fileSourceDirectory, fileName, fileDestinationDirectory + "\\" + ufn);

                DirectoryInfo dir = new DirectoryInfo(fileDestinationDirectory + "\\" + ufn);
                foreach (FileInfo f in dir.GetFiles())
                {
                    string tr = await zipEntryTester(f);
                    object pr = await zipEntryProcessors[tr](f);
                    rs[tr] = pr;
                }
            }
            catch (Exception exGetStream)
            {
                int i = 0;
            }
            finally
            {
                Fs.TryDeleteFile(fileSourceDirectory + "\\" + fileName);
                DirectoryInfo dir = new DirectoryInfo(fileDestinationDirectory + "\\" + ufn);
                if (dir.Exists) dir.Delete(true);
            }

            return rs;
        }

        public static async Task UploadStream(string fileName, Stream stream, string host,
            string userName, string password)
        {
            var ftpReq = (FtpWebRequest)WebRequest.Create("ftp://" + host + "/" + fileName);
            ftpReq.UseBinary = true;
            ftpReq.Method = WebRequestMethods.Ftp.UploadFile;
            ftpReq.Credentials = new NetworkCredential(userName, password);

            using (var s = ftpReq.GetRequestStream())
            {
                ftpReq.ContentLength = stream.Length;
                while (true)
                {
                    byte[] buf = new byte[1000000];
                    int numRead = await stream.ReadAsync(buf);

                    if (numRead > 0) await s.WriteAsync(buf, 0, numRead);
                    else break;
                }
            }

            await ftpReq.GetResponseAsync();
        }

        public static async Task UploadFile(string sourceFile, string targetFile, string host, string userName, string password)
        {
            using (var f = File.OpenRead(sourceFile))
            {
                await UploadStream(targetFile, f, host, userName, password);
            }
        }

        public static async Task DeleteFileFromFtpServer(string remoteFile, string host, int port, string userName, string password)
        {
            FtpWebResponse response = null;

            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(new Uri(@"ftp://" + host + @"//" + remoteFile));
                request.Method = WebRequestMethods.Ftp.DeleteFile;
                request.Credentials = new NetworkCredential(userName, password);
                response = (FtpWebResponse)(await request.GetResponseAsync());
                response.Close();
            }
            finally
            {
                if (response != null) response.Close();
            }
        }

        public static async Task<List<string>> DownloadFilesSFtp(
            string localPath, string pattern, Func<string, string, Task<bool>> ShouldDownload,
            string host, int port, string userName, string password)
        {
            SftpClient client;
            List<string> fileNames = new List<string>();

            using (client = new SftpClient(host, port, userName, password))
            {
                client.Connect();
                var files = client.ListDirectory("");

                var tasks = new List<Task>();

                foreach (var file in files)
                {
                    bool shouldDownload = await ShouldDownload(file.Name, pattern);
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

        static async Task DownloadFileSFtp(SftpClient client, string source, string destination)
        {
            using (var saveFile = File.OpenWrite(destination))
            {
                var task = Task.Factory.FromAsync(client.BeginDownloadFile(source, saveFile), client.EndDownloadFile);
                await task;
            }
        }

        public static async Task<long> FtpGetFileSize(string fileName, string host, string userName, string password)
        {
            long fileSize = 0;

            FtpWebRequest request = (FtpWebRequest)WebRequest.Create(new Uri(@"ftp://" + host + @"/" + fileName));
            request.Method = WebRequestMethods.Ftp.ListDirectoryDetails;
            request.Credentials = new NetworkCredential(userName, password);
            var response = (FtpWebResponse)(await request.GetResponseAsync());
            Stream responseStream = response.GetResponseStream();
            var reader = new StreamReader(responseStream);

            string line = await reader.ReadLineAsync();
            if (!string.IsNullOrEmpty(line))
            {
                string regex =
                        @"^" +                          //# Start of line
                        @"(?<dir>[\-ld])" +             //# File size          
                        @"(?<permission>[\-rwx]{9})" +  //# Whitespace          \n
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<filecode>\d+)" +
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<owner>\w+)" +
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<group>\w+)" +
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<size>\d+)" +
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<month>\w{3})" +            //# Month (3 letters)   \n
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<day>\d{1,2})" +            //# Day (1 or 2 digits) \n
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<timeyear>[\d:]{4,5})" +    //# Time or year        \n
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<filename>(.*))" +          //# Filename            \n
                        @"$";                           //# End of line

                var split = new Regex(regex).Match(line);
                fileSize = Int64.Parse(split.Groups["size"].ToString());
            }
            return fileSize;
        }

        public static async Task<List<string>> DownloadFilesFtp(
            string localPath, string pattern, Func<string, string, Task<bool>> ShouldDownload,
            string host, int port, string userName, string password)
        {
            FtpWebResponse response = null;
            StreamReader reader = null;
            List<string> fileNames = new List<string>();

            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(new Uri(@"ftp://" + host + @"/"));
                request.Method = WebRequestMethods.Ftp.ListDirectoryDetails;  // WebRequestMethods.Ftp.ListDirectory would be more efficient here
                request.Credentials = new NetworkCredential(userName, password);
                response = (FtpWebResponse)(await request.GetResponseAsync());
                Stream responseStream = response.GetResponseStream();
                reader = new StreamReader(responseStream);

                List<string> files = new List<string>();

                string line = await reader.ReadLineAsync();
                while (!string.IsNullOrEmpty(line))
                {
                    string regex =
                        @"^" +                          //# Start of line
                        @"(?<dir>[\-ld])" +             //# File size          
                        @"(?<permission>[\-rwx]{9})" +  //# Whitespace          \n
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<filecode>\d+)" +
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<owner>\w+)" +
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<group>\w+)" +
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<size>\d+)" +
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<month>\w{3})" +            //# Month (3 letters)   \n
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<day>\d{1,2})" +            //# Day (1 or 2 digits) \n
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<timeyear>[\d:]{4,5})" +    //# Time or year        \n
                        @"\s+" +                        //# Whitespace          \n
                        @"(?<filename>(.*))" +          //# Filename            \n
                        @"$";                           //# End of line

                    var split = new Regex(regex).Match(line);
                    string dir = split.Groups["dir"].ToString();
                    string filename = split.Groups["filename"].ToString();
                    bool isDirectory = !string.IsNullOrWhiteSpace(dir) && dir.Equals("d", StringComparison.OrdinalIgnoreCase);
                    files.Add(filename);
                    line = await reader.ReadLineAsync();
                }

                var tasks = new List<Task>();

                foreach (var file in files)
                {
                    bool shouldDownload = await ShouldDownload(file, pattern);
                    if (shouldDownload)
                    {
                        tasks.Add(DownloadFileFtp(localPath, file, file, host, userName, password));
                        fileNames.Add(localPath + "\\" + file);
                    }
                }

                await Task.WhenAll(tasks);
            }
            catch (Exception ex)
            {
            }
            finally
            {
                if (reader != null) reader.Close();
                if (response != null) response.Close();
            }

            return fileNames;
        }

        public static async Task DownloadFileFtp(string baseDir, string sourceFile, string destinationFile, string host, string userName, string password)
        {
            using (FileStream f = File.OpenWrite(baseDir + @"\" + destinationFile))
            {
                await DownloadFileFtp(f, sourceFile, host, userName, password);
            }
        }

        public static async Task DownloadFilesFtp(string destRoot, string sourceRoot, string userName, string password, IEnumerable<string> fileNames)
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

        public static async Task<Stream> GetFtpFileStream(string sourceFile, string host, string userName, string password)
        {
            var request = (FtpWebRequest)WebRequest.Create(new Uri(@"ftp://" + host + @"//" + sourceFile));

            request.ServicePoint.ConnectionLimit = 10;
            request.Method = WebRequestMethods.Ftp.DownloadFile;
            request.Credentials = new NetworkCredential(userName, password);
            request.UseBinary = true;

            var response = (FtpWebResponse)(await request.GetResponseAsync());

            return response.GetResponseStream();
        }

        public static async Task DownloadFileFtp(Stream writeStream, string sourceFile, string host, string userName, string password)
        {
            using (var stream = await GetFtpFileStream(sourceFile, host, userName, password))
            {
                await stream.CopyToAsync(writeStream);
            }
        }

        public static async Task DeleteDirectoriesFromFtpServer(string connectionString, string host, int port, string userName,
            string password, List<string> dirs)
        {
            FtpWebResponse response = null;
            foreach (string dir in dirs)
            {
                try
                {
                    FtpWebRequest request = (FtpWebRequest)WebRequest.Create(new Uri($@"ftp://{host}/{dir}"));
                    request.Method = WebRequestMethods.Ftp.RemoveDirectory;
                    request.Credentials = new NetworkCredential(userName, password);
                    response = (FtpWebResponse)(await request.GetResponseAsync());
                    response.Close();
                }
                catch (Exception ex)
                {
                }
                finally
                {
                    if (response != null) response.Close();
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

        public static async Task<Dictionary<string, List<string>>> GetListFiles(
            string host, string userName, string password)
        {
            //Dictionary<DirName, List<FileName>>
            Dictionary<string, List<string>> listFiles = new Dictionary<string, List<string>>();
            List<string> dirs = new List<string>();

            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(new Uri($@"ftp://{host}/"));
                request.Method = WebRequestMethods.Ftp.ListDirectory;
                request.Credentials = new NetworkCredential(userName, password);
                using (FtpWebResponse response = (FtpWebResponse)(await request.GetResponseAsync().ConfigureAwait(continueOnCapturedContext: false)))
                {
                    using (Stream responseStream = response.GetResponseStream())
                    {
                        using (StreamReader reader = new StreamReader(responseStream))
                        {
                            string line = await reader.ReadLineAsync().ConfigureAwait(continueOnCapturedContext: false);
                            while (!string.IsNullOrEmpty(line))
                            {
                                if (line != "." && line != "..") dirs.Add(line);
                                line = await reader.ReadLineAsync().ConfigureAwait(continueOnCapturedContext: false);
                            }

                            foreach (string dir in dirs)
                            {
                                listFiles[dir] = new List<string>();
                                FtpWebRequest fileRequest = (FtpWebRequest)WebRequest.Create(new Uri($@"ftp://{host}/{dir}/"));
                                fileRequest.Method = WebRequestMethods.Ftp.ListDirectory;
                                fileRequest.Credentials = new NetworkCredential(userName, password);
                                using (FtpWebResponse fileResponse = (FtpWebResponse)(await fileRequest.GetResponseAsync().ConfigureAwait(continueOnCapturedContext: false)))
                                {
                                    using (Stream fileResponseStream = fileResponse.GetResponseStream())
                                    {
                                        using (StreamReader fileReader = new StreamReader(fileResponseStream))
                                        {
                                            string fileLine = await fileReader.ReadLineAsync().ConfigureAwait(continueOnCapturedContext: false);
                                            while (!string.IsNullOrEmpty(fileLine))
                                            {
                                                if (fileLine != "." && fileLine != "..") listFiles[dir].Add(fileLine);
                                                fileLine = await fileReader.ReadLineAsync().ConfigureAwait(continueOnCapturedContext: false);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
            }

            return listFiles;
        }

        public static async Task<List<string>> FtpGetFiles(
            string dirName, string host, string userName, string password)
        {
            List<string> files = new List<string>();

            FtpWebRequest fileRequest;
            if (dirName != null && dirName.Length > 0)
                fileRequest = (FtpWebRequest)WebRequest.Create(new Uri($@"ftp://{host}/{dirName}/"));
            else
                fileRequest = (FtpWebRequest)WebRequest.Create(new Uri($@"ftp://{host}/"));
            fileRequest.Method = WebRequestMethods.Ftp.ListDirectory;
            fileRequest.Credentials = new NetworkCredential(userName, password);
            using (FtpWebResponse fileResponse = (FtpWebResponse)(await fileRequest.GetResponseAsync().ConfigureAwait(continueOnCapturedContext: false)))
            {
                using (Stream fileResponseStream = fileResponse.GetResponseStream())
                {
                    using (StreamReader fileReader = new StreamReader(fileResponseStream))
                    {
                        string fileLine = await fileReader.ReadLineAsync().ConfigureAwait(continueOnCapturedContext: false);
                        while (!string.IsNullOrEmpty(fileLine))
                        {
                            if (fileLine != "." && fileLine != "..") files.Add(fileLine);
                            fileLine = await fileReader.ReadLineAsync().ConfigureAwait(continueOnCapturedContext: false);
                        }
                    }
                }
            }

            return files;
        }

        public static async Task<IGenericEntity> HttpPostAsyncGe(FrameworkWrapper fw, IGenericEntity ge)
        {
            Dictionary<string, string> parms = new Dictionary<string, string>();
            foreach (var di in ge.GetD("parms")) parms.Add(di.Item1, di.Item2);
            string resp = await HttpPostAsync(ge.GetS("uri"), parms,
                !String.IsNullOrEmpty(ge.GetS("timeout")) ? double.Parse(ge.GetS("timeout")) : 60,
                ge.GetS("mediaType") ?? "");
            return JsonWrapper.JsonToGenericEntity(JsonWrapper.Json(new { result = resp }));
        }

        public static async Task<string> HttpPostAsync(string uri, IDictionary<string, string> parms,
            double timeoutSeconds = 60, string mediaType = "", int maxConnections = 5)
        {
            string responseBody = null;

            HttpContent httpContent;
            if (parms.Count == 1 && parms[""] != null)
            {
                httpContent = new StringContent(parms[""].ToString(), Encoding.UTF8, mediaType);
            }
            else
            {
                httpContent = new FormUrlEncodedContent(parms);
            }

            var handler = new HttpClientHandler() { MaxConnectionsPerServer = maxConnections };
            using (HttpClient client = new HttpClient(handler))
            {
                client.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
                HttpResponseMessage response = await client.PostAsync(uri, httpContent);
                if (response.IsSuccessStatusCode)
                {
                    responseBody = await response.Content.ReadAsStringAsync();
                }
            }

            return responseBody;
        }

        // "application/json"
        public static async Task<string> HttpPostAsync(string uri, string content, string mediaType, int timeoutSeconds = 60)
        {
            var http = (HttpWebRequest)WebRequest.Create(new Uri(uri));
            http.Accept = mediaType;
            http.ContentType = mediaType;
            http.Method = "POST";
            http.Timeout = timeoutSeconds * 1000;

            ASCIIEncoding encoding = new ASCIIEncoding();
            Byte[] bytes = encoding.GetBytes(content);

            Stream newStream = await http.GetRequestStreamAsync();
            await newStream.WriteAsync(bytes, 0, bytes.Length);
            newStream.Close();

            var response = await http.GetResponseAsync();
            var stream = response.GetResponseStream();
            var sr = new StreamReader(stream);
            return await sr.ReadToEndAsync();
        }

        public static async Task<IGenericEntity> HttpGetAsync(FrameworkWrapper fw, IGenericEntity ge)
        {
            var resp = await HttpGetAsync(ge.GetS("uri"), null, !String.IsNullOrEmpty(ge.GetS("timeout")) ? double.Parse(ge.GetS("timeout")) : 60);
            return JsonWrapper.JsonToGenericEntity(JsonWrapper.Json(new { success = resp.Item1, result = resp.Item2 }));
        }

        public static async Task<(bool success, string body)> HttpGetAsync(string path, IEnumerable<(string key, string value)> headers = null, double timeoutSeconds = 60)
        {
            using (HttpClient client = new HttpClient())
            {
                client.Timeout = TimeSpan.FromSeconds(timeoutSeconds);

                headers?.ForEach(h => client.DefaultRequestHeaders.Add(h.key, h.value));

                using (var response = await client.GetAsync(path))
                {
                    return (success: response.IsSuccessStatusCode, body: await response.Content.ReadAsStringAsync());
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

        public static IEnumerable<(T reference, Exception ex)> SendMail<T>(string smtpRelay, int smtpPort, IEnumerable<(T reference, MailMessage msg)> messages, bool useSsl = false)
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

    }
}
