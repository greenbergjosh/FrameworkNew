using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Utility;
using Utility.GenericEntity;

namespace SimpleImportExport
{
    public class FtpEndPoint : Endpoint
    {
        private readonly bool _isSFtp = false;

        public FtpEndPoint(IGenericEntity ge) : base(ge)
        {
            Host = ge.GetS("Host");
            BasePath = ge.GetS("BasePath");
            User = ge.GetS("User");
            Password = ge.GetS("Password");
            KeyPath = ge.GetS("KeyPath");
            MaxDepth = ge.GetS("MaxDepth").ParseInt() ?? 0;
            _isSFtp = ge.GetB("isSftp");

            if (Password.IsNullOrWhitespace() || ! _isSFtp ) // in case we haven't explicitly set it up top, check implicitly
            {
                if (KeyPath.IsNullOrWhitespace() || !File.Exists(KeyPath)) throw new Exception($"Invalid FTP config, if Password not set SFTP KeyPath must point to existing file");

                _isSFtp = true;
            }

            Port = ge.GetS("Port").ParseInt();
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
                    await ProtocolClient.GetSFtpFileStreamWithKeyFile(CombineUrl(file.SourceDirectory, file.FileName), Host, Port, User, KeyPath) :
                    await ProtocolClient.GetSFtpFileStreamWithPassword(CombineUrl(file.SourceDirectory, file.FileName), Host, Port, User, Password);
            }

            return await ProtocolClient.GetFtpFileStream(CombineUrl(file.SourceDirectory, file.FileName), Host, User, Password);
        }

        public override async Task<(long size, long? records, string destinationDirectoryPath)> SendStream(SourceFileInfo file, Endpoint source)
        {
            var destPath = CombineUrl(BasePath, file.Pattern?.DestinationRelativePath.IfNullOrWhitespace(""), file.FileName);
            var destinationDirectoryPath = CombineUrl(BasePath, file.Pattern?.DestinationRelativePath.IfNullOrWhitespace(""));

            using (var srcStream = await source.GetStream(file))
            using (var ms = new MemoryStream())
            {
                await srcStream.CopyToAsync(ms);

                ms.Position = 0;

                if (_isSFtp) await ProtocolClient.UploadSFtpStream(destPath, ms, Host, Port, User, KeyPath);
                else await ProtocolClient.UploadStream(destPath, ms, Host, User, Password);

                return (size: ms.Length, records: null, destinationDirectoryPath);
            }
        }

        public override async Task<IEnumerable<SourceFileInfo>> GetFiles()
        {
            var files = new List<SourceFileInfo>();
            List<(string directory, string file)> dirFiles;

            if (_isSFtp)
            {
                dirFiles = (await ProtocolClient.SFtpGetFiles(BasePath, Host, Port, User, KeyPath, (depth, parent, name) => depth < MaxDepth));
            }
            else
            {
                dirFiles = (await ProtocolClient.FtpGetFiles(BasePath, Host, User, Password)).Select(r =>
                {
                    var basePath = new List<string> { BasePath };
                    var spl = r.Split("/", StringSplitOptions.RemoveEmptyEntries);

                    basePath.AddRange(spl.Take(spl.Length - 1));
                    return (directory: CombineUrl(basePath.ToArray()), spl.Last());
                }).ToList();
            }

            return Filter(dirFiles.Select(f => (new SourceFileInfo(f.directory, f.file), CombineUrl(f.directory, f.file))).ToArray());
        }

        public override Task Delete(string directoryPath, string fileName)
        {
            throw new System.NotImplementedException();
        }

        public override Task Rename(string directoryPath, string fileName, Regex pattern, string patternReplace, bool overwrite)
        {
            throw new System.NotImplementedException();
        }

        public override Task Move(string directoryPath, string fileName, string relativeBasePath, bool overwrite)
        {
            throw new System.NotImplementedException();
        }

        public override string ToString()
        {
            return $"ftp://{Host}/{BasePath}";
        }
    }
}