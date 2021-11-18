using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Utility;
using Utility.Entity;

namespace SimpleImportExport
{
    public class FtpEndPoint : Endpoint
    {
        private readonly bool _isSFtp = false;
        private readonly bool _isFtps = false;

        private FtpEndPoint(string host, string basePath, string user, string password, string keyPath, int? port, int maxDepth, bool isSftp, bool isFtps)
        {
            Host = host;
            BasePath = basePath;
            User = user;
            Password = password;
            KeyPath = keyPath;
            Port = port;
            MaxDepth = maxDepth;

            _isSFtp = isSftp;
            _isFtps = isFtps;
        }

        public static async Task<FtpEndPoint> Create(Entity ge)
        {
            var host = await ge.GetS("Host");
            var basePath = await ge.GetS("BasePath");
            var user = await ge.GetS("User");
            var password = await ge.GetS("Password", null);
            var keyPath = await ge.GetS("KeyPath", null);
            var maxDepth = await ge.GetI("MaxDepth", 0);
            var isSFtp = await ge.GetB("isSftp", false);
            var isFtps = await ge.GetB("IsFtps", false);

            if (password.IsNullOrWhitespace())
            {
                if (keyPath.IsNullOrWhitespace() || !File.Exists(keyPath))
                {
                    throw new Exception($"Invalid FTP config, if Password not set SFTP KeyPath must point to existing file");
                }

                isSFtp = true;
            }

            var port = (await ge.GetS("Port", null)).ParseInt();

            var endpoint = new FtpEndPoint(host, basePath, user, password, keyPath, port, maxDepth, isSFtp, isFtps);
            await endpoint.LoadPatterns(ge);
            return endpoint;
        }

        public string Host { get; }
        public string BasePath { get; }
        public string User { get; }
        public string Password { get; }
        public string KeyPath { get; }
        public int? Port { get; }
        public int MaxDepth { get; }

        public override EndpointType Type { get; } = EndpointType.Ftp;

        public override async Task<Stream> GetStream(SourceFileInfo file)
        {
            if (_isSFtp)
            {
                return Password.IsNullOrWhitespace() ?
                    await ProtocolClient.GetSFtpFileStream(CombineUrl(file.SourceDirectory, file.FileName), Host, Port, User, keyFilePath: KeyPath) :
                    await ProtocolClient.GetSFtpFileStream(CombineUrl(file.SourceDirectory, file.FileName), Host, Port, User, password: Password);
            }

            return await ProtocolClient.GetFtpFileStream(CombineUrl(file.SourceDirectory, file.FileName), Host, User, Password, _isFtps);
        }

        public override async Task<(long size, long? records, string destinationDirectoryPath)> SendStream(SourceFileInfo file, Endpoint source)
        {
            var destPath = CombineUrl(BasePath, file.Pattern?.DestinationRelativePath.IfNullOrWhitespace(""), file.FileName);
            var destinationDirectoryPath = CombineUrl(BasePath, file.Pattern?.DestinationRelativePath.IfNullOrWhitespace(""));

            using var srcStream = await source.GetStream(file);
            using var ms = new MemoryStream();
            await srcStream.CopyToAsync(ms);

            ms.Position = 0;

            if (_isSFtp && Password.IsNullOrWhitespace())
            {
                await ProtocolClient.UploadSFtpStream(destPath, ms, Host, Port, User, keyFilePath: KeyPath);
            }
            else if (_isSFtp && !Password.IsNullOrWhitespace())
            {
                await ProtocolClient.UploadSFtpStream(destPath, ms, Host, Port, User, password: Password);
            }
            else
            {
                await ProtocolClient.UploadStream(destPath, ms, Host, User, Password, _isFtps);
            }

            return (size: ms.Length, records: null, destinationDirectoryPath);
        }

        public override async Task<IEnumerable<SourceFileInfo>> GetFiles()
        {
            var files = new List<SourceFileInfo>();
            List<(string directory, string file)> dirFiles;

            if (_isSFtp)
            {
                dirFiles = Password.IsNullOrWhitespace() ?
                    (await ProtocolClient.SFtpGetFiles(BasePath, Host, Port, User, keyFilePath: KeyPath, enumerateDirectory: (depth, parent, name) => depth < MaxDepth)) :
                    (await ProtocolClient.SFtpGetFiles(BasePath, Host, Port, User, password: Password, enumerateDirectory: (depth, parent, name) => depth < MaxDepth));
            }
            else
            {
                dirFiles = (await ProtocolClient.FtpGetFiles(BasePath, Host, User, Password, _isFtps)).Select(r =>
                {
                    var basePath = new List<string> { BasePath };
                    var spl = r.Split("/", StringSplitOptions.RemoveEmptyEntries);

                    basePath.AddRange(spl.Take(spl.Length - 1));
                    return (directory: CombineUrl(basePath.ToArray()), spl.Last());
                }).ToList();
            }

            return Filter(dirFiles.Select(f => (new SourceFileInfo(f.directory, f.file), CombineUrl(f.directory, f.file))).ToArray());
        }

        public override Task Delete(string directoryPath, string fileName) => throw new System.NotImplementedException();

        public override Task Rename(string directoryPath, string fileName, Regex pattern, string patternReplace, bool overwrite) => throw new System.NotImplementedException();

        public override Task Move(string directoryPath, string fileName, string relativeBasePath, bool overwrite) => throw new System.NotImplementedException();

        public override string ToString() => $"ftp://{Host}/{BasePath}";
    }
}
