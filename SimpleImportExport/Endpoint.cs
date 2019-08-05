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

    public enum EndpointType
    {
        Local, Ftp
    }

    public class SourceFileInfo
    {
        public SourceFileInfo(string sourceDirectory, string fileName, Pattern pattern, DateTime? fileDate)
        {
            SourceDirectory = sourceDirectory;
            FileName = fileName;
            Pattern = pattern;
            FileDate = fileDate;
        }

        public string SourceDirectory { get; }
        public string FileName { get; }
        public Pattern Pattern { get; }
        public DateTime? FileDate { get; }
    }

    public abstract class Endpoint
    {
        protected Endpoint(IGenericEntity ge)
        {
            Patterns = ge.GetL("Patterns")?.Select(p => new Pattern(p)).ToArray() ?? new Pattern[0];
        }

        public abstract EndpointType Type { get; }
        public abstract Task<Stream> GetStream(SourceFileInfo file);
        public abstract Task<(long size, long? records, string destinationDirectoryPath) > SendStream(SourceFileInfo file, Endpoint source);
        public abstract Task<IEnumerable<SourceFileInfo>> GetFiles();
        public abstract Task Delete(string directoryPath, string fileName);
        public Task Move(string directoryPath, string fileName, string relativeBasePath) => Move(directoryPath, fileName, relativeBasePath, false);
        public abstract Task Move(string directoryPath, string fileName, string relativeBasePath, bool overwrite);
        public Task Rename(string directoryPath, string fileName, Regex pattern, string patternReplace) => Rename(directoryPath, fileName, pattern, patternReplace, false);
        public abstract Task Rename(string directoryPath, string fileName, Regex pattern, string patternReplace, bool overwrite);
        protected IEnumerable<Pattern> Patterns { get; }

        protected (bool isMatch, DateTime? fileDate, string filePath) ApplyPattern(Pattern pattern, string filePath)
        {
            var match = pattern.Rx.Match(filePath);
            var isMatch = match.Success;
            DateTime? fileDate = null;

            if (isMatch && !pattern.FileDateFormat.IsNullOrWhitespace())
            {
                var fileDateStr = match.Groups.FirstOrDefault(g => g.Name == "fileDate")?.Value;

                if (!fileDateStr.IsNullOrWhitespace())
                {
                    try
                    {
                        fileDate = DateTime.ParseExact(fileDateStr, pattern.FileDateFormat, null);
                    }
                    catch (Exception e)
                    {
                        Program._fw.Error($"{this.GetType().Name}.{nameof(GetFiles)}.{nameof(ApplyPattern)}", $"Failed to parse date: Endpoint: {this} File: {filePath} Pattern: {JsonWrapper.Serialize(pattern, true)}\r\n{e.UnwrapForLog()}").GetAwaiter().GetResult();
                        isMatch = false;
                    }
                }
            }

            return (isMatch, fileDate, filePath );
        }

        protected string CombineUrl(params string[] list) => list.Select(i => i?.Trim('/')).Where(i => !i.IsNullOrWhitespace()).Join("/");
    }
}