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
    public class LocalEndPoint : Endpoint
    {
        private FrameworkWrapper _fw;

        public LocalEndPoint(IGenericEntity ge, FrameworkWrapper fw) : base(ge)
        {
            _fw = fw;
            var baseDir = ge.GetS("Path");

            BaseDir = new DirectoryInfo(baseDir);
        }

        public override EndpointType Type { get; } = EndpointType.Local;

        public DirectoryInfo BaseDir { get; }

        public override async Task<Stream> GetStream(SourceFileInfo file)
        {
            return File.OpenRead(Path.Combine(BaseDir.FullName, file.SourceDirectory, file.FileName));
        }

        public override async Task<(long size, long? records, string destinationDirectoryPath)> SendStream(SourceFileInfo file, Endpoint source)
        {
            var destFile = new FileInfo(Path.Combine(BaseDir.FullName, (file.Pattern?.DestinationRelativePath).IfNullOrWhitespace(""), file.FileName));

            if (!destFile.Directory.Exists) destFile.Directory.Create();
            var destinationDirectoryPath = destFile.Directory.FullName;

            using (var srcStream = await source.GetStream(file))
            using (var f = File.OpenWrite(destFile.FullName))
            {
                await srcStream.CopyToAsync(f);

                return (size: f.Length, records: null, destinationDirectoryPath);
            }
        }

        public override async Task<IEnumerable<SourceFileInfo>> GetFiles() => Filter(BaseDir.GetFiles().Select(f => (new SourceFileInfo(f.Directory?.FullName, f.Name), f.FullName)).ToArray());

        public override async Task Delete(string directoryPath, string fileName)
        {
            File.Delete(Path.Combine(directoryPath, fileName));
        }

        public override async Task Move(string directoryPath, string fileName, string relativeBasePath, bool overwrite)
        {
            var src = new FileInfo(Path.Combine(directoryPath, fileName));
            var dest = new FileInfo(Path.Combine(BaseDir.FullName, relativeBasePath, fileName));

            if (!dest.Directory.Exists) dest.Directory.Create();
            else if (dest.Exists && overwrite) dest.Delete();
            else if (dest.Exists)
            {
                await _fw.Error($"{nameof(LocalEndPoint)}.{nameof(Move)}", $"Could not perform move because destination file already exists. Source: {dest.FullName}, Destination: {dest.FullName}");
                return;
            }

            try
            {
                src.MoveTo(dest.FullName);
            }
            catch (Exception e)
            {
                await _fw.Error($"{nameof(LocalEndPoint)}.{nameof(Move)}", $"Move failed: Source. {dest.FullName}, Destination: {dest.FullName} {e.UnwrapForLog()}");
            }
        }

        public override async Task Rename(string directoryPath, string fileName, Regex pattern, string patternReplace, bool overwrite)
        {
            var logContext = $"{nameof(LocalEndPoint)}.{nameof(Rename)}";
            var src = new FileInfo(Path.Combine(directoryPath, fileName));
            var newFileName = pattern.Replace(src.Name, patternReplace);

            if (newFileName.IsNullOrWhitespace() || newFileName == src.Name)
            {
                await _fw.Error(logContext, $"Could not perform rename because of a problem with the pattern: {nameof(directoryPath)}: {directoryPath}, {nameof(fileName)}: {fileName}, {nameof(pattern)}: {pattern}, {nameof(patternReplace)}: {patternReplace}, {nameof(newFileName)}: {newFileName}");
                return;
            }

            var dest = new FileInfo(Path.Combine(src.DirectoryName, newFileName));

            await _fw.Trace(logContext, $"Renaming {src.Name} to {dest.Name} {src.FullName} -> {dest.FullName}");

            if (dest.Exists && overwrite) dest.Delete();
            else if (dest.Exists)
            {
                await _fw.Error(logContext, $"Could not perform rename because destination file already exists: {nameof(directoryPath)}: {directoryPath}, {nameof(fileName)}: {fileName}, {nameof(pattern)}: {pattern}, {nameof(patternReplace)}: {patternReplace}");
                return;
            }

            try
            {
                src.MoveTo(dest.FullName);
            }
            catch (Exception e)
            {
                await _fw.Error(logContext, $"Rename failed: {nameof(directoryPath)}: {directoryPath}, {nameof(fileName)}: {fileName}, {nameof(pattern)}: {pattern}, {nameof(patternReplace)}: {patternReplace} {e.UnwrapForLog()}");
            }
        }

        public override string ToString()
        {
            return BaseDir.FullName;
        }
    }
}