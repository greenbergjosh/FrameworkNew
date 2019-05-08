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
            return await ProtocolClient.GetFtpFileStream(CombineUrl(BasePath, fileRelativePath), Host, User, Password);
        }

        public override async Task<long> SendStream((string srcPath, string destPath, string name) file, Endpoint source)
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

        public override async Task<IEnumerable<(string srcPath, string destPath, string name)>> GetFiles()
        {
            if (!Patterns.Any()) return (await ProtocolClient.FtpGetFiles(BasePath, Host, User, Password)).Select(f => (srcPath: f, destPath: f, name: f));

            var files = new List<(string srcPath, string destPath, string name)>();

            foreach (var p in Patterns)
            {
                var dirFiles = (await ProtocolClient.FtpGetFiles(CombineUrl(BasePath, p.SourceRelativePath), Host, User, Password)).Where(f => p.Rx.IsMatch(f)).ToArray();

                if (dirFiles.Any()) files.AddRange(dirFiles.Select(f => (srcPath: CombineUrl(BasePath, p.SourceRelativePath, f), destPath: CombineUrl(p.DestinationRelativePath, f), name: f)));
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