using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Utility;

namespace SimpleImportExport
{
    public class FtpEndPoint : Endpoint
    {
        public FtpEndPoint(IGenericEntity ge) : base(ge)
        {
            Host = ge.GetS("Host");
            User = ge.GetS("User");
            Password = ge.GetS("Password");
        }

        public string Host { get; }
        public string User { get; }
        public string Password { get; }

        public override EndpointType Type { get; } = EndpointType.Ftp;

        public override async Task<Stream> GetStream(string fileRelativePath)
        {
            return await ProtocolClient.GetFtpFileStream(fileRelativePath, Host, User, Password);
        }

        public override async Task<long> SendStream((string srcPath, string destPath, string name) file, Endpoint source)
        {
            using (var srcStream = await source.GetStream(file.srcPath))
            {
                await ProtocolClient.UploadStream(file.destPath, srcStream, Host, User, Password);

                return srcStream.Length;
            }
        }

        public override async Task<IEnumerable<(string srcPath, string destPath, string name)>> GetFiles()
        {
            if (Patterns == null) return (await ProtocolClient.FtpGetFiles("", Host, User, Password)).Select(f => (srcPath: f, destPath: f, name: f));

            var files = new List<(string srcPath, string destPath, string name)>();

            foreach (var p in Patterns)
            {
                var dirFiles = (await ProtocolClient.FtpGetFiles(p.SourceRelativePath, Host, User, Password)).Where(f => p.Rx.IsMatch(f)).ToArray();

                if (dirFiles.Any()) files.AddRange(dirFiles.Select(f => (srcPath: CombineUrl(p.SourceRelativePath, f), destPath: CombineUrl(p.DestinationRelativePath, f), name: f)));
            }

            return files;
        }

        public override Task Delete(string fileRelativePath)
        {
            throw new System.NotImplementedException();
        }

        public override Task Move(string fileRelativePath, string relativeBasePath)
        {
            throw new System.NotImplementedException();
        }
    }
}