using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Utility;
using Utility.GenericEntity;

namespace SimpleImportExport
{
    public class LocalEndPoint : Endpoint
    {
        private FrameworkWrapper _fw;

        public LocalEndPoint(IGenericEntity ge, FrameworkWrapper fw) : base(ge)
        {
            _fw = fw;
            var baseDir = ge.GetS("Path");

            //#if DEBUG
            //            if (Debugger.IsAttached)
            //            {
            //                baseDir = baseDir.Replace(
            //                    "\\\\ftpback-bhs6-85.ip-66-70-176.net\\ns557038.ip-66-70-182.net",
            //                    "\\\\localhost\\c$\\Users\\OnPoint Global\\Documents\\dev\\Workspace\\NetworkMocks\\OVH-NAS");
            //            }
            //#endif
            BaseDir = new DirectoryInfo(baseDir);
        }

        public override EndpointType Type { get; } = EndpointType.Local;

        public DirectoryInfo BaseDir { get; }

        public override async Task<Stream> GetStream(string fileRelativePath)
        {
            return await Task.FromResult(File.OpenRead(Path.Combine(BaseDir.FullName, fileRelativePath)));
        }

        public override async Task<long> SendStream((string srcPath, string destPath, string name, Pattern pattern, DateTime? fileDate) file, Endpoint source)
        {
            var destFile = new FileInfo(Path.Combine(BaseDir.FullName, file.destPath.Replace("/", "\\")));

            if (!destFile.Directory.Exists) destFile.Directory.Create();

            using (var f = File.OpenWrite(destFile.FullName))
            using (var srcStream = await source.GetStream(file.srcPath))
            {
                await srcStream.CopyToAsync(f);

                return f.Length;
            }
        }

        public override async Task<IEnumerable<(string srcPath, string destPath, string name, Pattern pattern, DateTime? fileDate)>> GetFiles()
        {
            if (Patterns?.Any() != true) return await Task.FromResult(BaseDir.GetFiles().Select(f => (srcPath: f.Name, destPath: f.Name, name: f.Name, (Pattern)null, (DateTime?)null)));

            var files = new List<(string srcPath, string destPath, string name, Pattern pattern, DateTime? fileDate)>();

            foreach (var p in Patterns)
            {
                var dir = BaseDir;

                if (!p.SourceRelativePath.IsNullOrWhitespace()) dir = new DirectoryInfo(Path.Combine(BaseDir.FullName, p.SourceRelativePath));

                var dirFiles = dir.GetFiles().Select(f => ApplyPattern(p, f.Name)).Where(f => f.isMatch).ToArray();

                if (dirFiles.Any()) files.AddRange(dirFiles.Select(f => (srcPath: CombineUrl(p.SourceRelativePath, f.fileName), destPath: CombineUrl(p.SourceRelativePath, f.fileName), name: f.fileName, pattern: p, f.fileDate)));
            }

            return files;
        }

        public override async Task Delete(string fileRelativePath)
        {
            await Task.Run(() => File.Delete(Path.Combine(BaseDir.FullName, fileRelativePath)));
        }

        public override async Task Move(string fileRelativePath, string relativeBasePath, bool overwrite)
        {
            var src = new FileInfo(Path.Combine(BaseDir.FullName, fileRelativePath));
            var dest = new FileInfo(Path.Combine(BaseDir.FullName, relativeBasePath, fileRelativePath));

            if (!dest.Directory.Exists) dest.Directory.Create();
            else if (dest.Exists && overwrite) dest.Delete();
            else if (dest.Exists)
            {
                await _fw.Error($"{nameof(LocalEndPoint)}.{nameof(Move)}", $"Could not perform move because destination file already exists: {nameof(fileRelativePath)}: {fileRelativePath}, {nameof(relativeBasePath)}: {relativeBasePath}");
                return;
            }

            try
            {
                src.MoveTo(dest.FullName);
            }
            catch (Exception e)
            {
                await _fw.Error($"{nameof(LocalEndPoint)}.{nameof(Rename)}", $"Move failed: {nameof(fileRelativePath)}: {fileRelativePath}, {nameof(relativeBasePath)}: {relativeBasePath} {e.UnwrapForLog()}");
            }
        }

        public override async Task Rename(string fileRelativePath, Regex pattern, string patternReplace, bool overwrite)
        {
            var logContext = $"{nameof(LocalEndPoint)}.{nameof(Rename)}";
            var src = new FileInfo(Path.Combine(BaseDir.FullName, fileRelativePath));
            var newFileName = pattern.Replace(src.Name, patternReplace);

            if (newFileName.IsNullOrWhitespace() || newFileName == src.Name)
            {
                await _fw.Error(logContext, $"Could not perform rename because of a problem with the pattern: {nameof(fileRelativePath)}: {fileRelativePath}, {nameof(pattern)}: {pattern}, {nameof(patternReplace)}: {patternReplace}, {nameof(newFileName)}: {newFileName}");
                return;
            }

            var dest = new FileInfo(Path.Combine(src.DirectoryName, newFileName));

            await _fw.Trace(logContext, $"Renaming {src.Name} to {dest.Name} {src.FullName} -> {dest.FullName}");

            if (dest.Exists && overwrite) dest.Delete();
            else if (dest.Exists)
            {
                await _fw.Error(logContext, $"Could not perform rename because destination file already exists: {nameof(fileRelativePath)}: {fileRelativePath}, {nameof(pattern)}: {pattern}, {nameof(patternReplace)}: {patternReplace}");
                return;
            }

            try
            {
                src.MoveTo(dest.FullName);
            }
            catch (Exception e)
            {
                await _fw.Error(logContext, $"Rename failed: {nameof(fileRelativePath)}: {fileRelativePath}, {nameof(pattern)}: {pattern}, {nameof(patternReplace)}: {patternReplace} {e.UnwrapForLog()}");
            }
        }

        public override string ToString()
        {
            return BaseDir.FullName;
        }
    }
}