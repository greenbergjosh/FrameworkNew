using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Utility;

namespace SimpleImportExport
{
    public class LocalEndPoint : Endpoint
    {

        public LocalEndPoint(IGenericEntity ge) : base(ge)
        {
            var baseDir = ge.GetS("Path");

#if DEBUG
            if (Debugger.IsAttached)
            {
                baseDir = baseDir.Replace(
                    "\\\\ftpback-bhs6-85.ip-66-70-176.net\\ns557038.ip-66-70-182.net",
                    "\\\\localhost\\c$\\Users\\OnPoint Global\\Documents\\dev\\Workspace\\NetworkMocks\\OVH-NAS");
            }
#endif
            BaseDir = new DirectoryInfo(baseDir);
        }

        public override EndpointType Type { get; } = EndpointType.Local;

        public DirectoryInfo BaseDir { get; }

        public override async Task<Stream> GetStream(string fileRelativePath)
        {
            return await Task.FromResult(File.OpenRead(Path.Combine(BaseDir.FullName, fileRelativePath)));
        }

        public override async Task<long> SendStream((string srcPath, string destPath, string name) file, Endpoint source)
        {
            using (var f = File.OpenWrite(Path.Combine(BaseDir.FullName, file.destPath.Replace("/", "\\"))))
            using (var srcStream = await source.GetStream(file.srcPath))
            {
                await srcStream.CopyToAsync(f);

                return srcStream.Length;
            }
        }

        public override async Task<IEnumerable<(string srcPath, string destPath, string name)>> GetFiles()
        {
            if (Patterns == null) return await Task.FromResult(BaseDir.GetFiles().Select(f => (srcPath: f.Name, destPath: f.Name, name: f.Name)));

            var files = new List<(string srcPath, string destPath, string name)>();

            foreach (var p in Patterns)
            {
                var dir = BaseDir;

                if (!p.SourceRelativePath.IsNullOrWhitespace()) dir = new DirectoryInfo(Path.Combine(BaseDir.FullName, p.SourceRelativePath));

                var dirFiles = dir.GetFiles().Where(f => p.Rx.IsMatch(f.Name)).ToArray();

                if (dirFiles.Any()) files.AddRange(dirFiles.Select(f => (srcPath: CombineUrl(p.SourceRelativePath, f.Name), destPath: CombineUrl(p.SourceRelativePath, f.Name), name: f.Name)));
            }

            return files;

        }

        public override async Task Delete(string fileRelativePath)
        {
            await Task.Run(() => File.Delete(Path.Combine(BaseDir.FullName, fileRelativePath)));
        }

        public override async Task Move(string fileRelativePath, string relativeBasePath)
        {
            var src = Path.Combine(BaseDir.FullName, fileRelativePath);
            var dest = Path.Combine(BaseDir.FullName, relativeBasePath, fileRelativePath);

            await Task.Run(()=> File.Move(src,dest));
        }
    }
}