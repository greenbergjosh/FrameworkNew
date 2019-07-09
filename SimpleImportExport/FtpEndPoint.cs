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
        public FtpEndPoint(IGenericEntity ge) : base(ge)
        {
            Host = ge.GetS("Host");
            BasePath = ge.GetS("BasePath");
            User = ge.GetS("User");
            Password = ge.GetS("Password");
        }

        public string Host { get; }
        public string BasePath { get; }
        public string User { get; }
        public string Password { get; }

        public override EndpointType Type { get; } = EndpointType.Ftp;

        public override async Task<Stream> GetStream(string fileRelativePath)
        {
            // Confused does fileRelativePath sometimes come without BasePath already combined
            // return await ProtocolClient.GetFtpFileStream(CombineUrl(BasePath, fileRelativePath), Host, User, Password);
            return await ProtocolClient.GetFtpFileStream(fileRelativePath, Host, User, Password);
        }

        public override async Task<long> SendStream((string srcPath, string destPath, string name, Pattern pattern, DateTime? fileDate) file, Endpoint source)
        {
            using (var srcStream = await source.GetStream(file.srcPath))
            using (var ms = new MemoryStream())
            {
                await srcStream.CopyToAsync(ms);

                ms.Position = 0;

                await ProtocolClient.UploadStream(CombineUrl(BasePath, file.destPath), ms, Host, User, Password);

                return ms.Length;
            }
        }

        public override async Task<IEnumerable<(string srcPath, string destPath, string name, Pattern pattern, DateTime? fileDate)>> GetFiles()
        {
            if (Patterns?.Any() != true) return (await ProtocolClient.FtpGetFiles(BasePath, Host, User, Password)).Select(f => (srcPath: f, destPath: f, name: f, (Pattern)null, (DateTime?)null));

            var files = new List<(string srcPath, string destPath, string name, Pattern pattern, DateTime? fileDate)>();

            foreach (var p in Patterns)
            {
                var dirFiles = (await ProtocolClient.FtpGetFiles(CombineUrl(BasePath, p.SourceRelativePath), Host, User, Password)).Select(fileName => ApplyPattern(p, fileName)).Where(f => f.isMatch).ToArray();

                if (dirFiles.Any()) files.AddRange(dirFiles.Select(f => (srcPath: CombineUrl(BasePath, p.SourceRelativePath, f.fileName), destPath: CombineUrl(p.DestinationRelativePath, f.fileName), name: f.fileName, pattern: p, f.fileDate)));
            }

            return files;
        }

        public override Task Delete(string fileRelativePath)
        {
            throw new System.NotImplementedException();
        }

        public override Task Rename(string fileRelativePath, Regex pattern, string patternReplace, bool overwrite)
        {
            throw new System.NotImplementedException();
        }

        public override Task Move(string fileRelativePath, string relativeBasePath, bool overwrite)
        {
            throw new System.NotImplementedException();
        }

        public override string ToString()
        {
            return $"ftp://{Host}/{BasePath}";
        }
    }
}