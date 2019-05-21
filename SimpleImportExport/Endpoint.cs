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

    public abstract class Endpoint
    {
        protected Endpoint(IGenericEntity ge)
        {
            Patterns = ge.GetL("Patterns")?.Select(p => new Pattern(p)).ToArray() ?? new Pattern[0];
        }

        public abstract EndpointType Type { get; }
        public abstract Task<Stream> GetStream(string fileRelativePath);
        public abstract Task<long> SendStream((string srcPath, string destPath, string name, Pattern pattern, DateTime? fileDate) file, Endpoint source);
        public abstract Task<IEnumerable<(string srcPath, string destPath, string name, Pattern pattern, DateTime? fileDate)>> GetFiles();
        public abstract Task Delete(string fileRelativePath);
        public Task Move(string fileRelativePath, string relativeBasePath) => Move(fileRelativePath, relativeBasePath, false);
        public abstract Task Move(string fileRelativePath, string relativeBasePath, bool overwrite);
        public Task Rename(string fileRelativePath, Regex pattern, string patternReplace) => Rename(fileRelativePath, pattern, patternReplace, false);
        public abstract Task Rename(string fileRelativePath, Regex pattern, string patternReplace, bool overwrite);
        protected IEnumerable<Pattern> Patterns { get; }

        protected (bool isMatch, DateTime? fileDate, string fileName) ApplyPattern(Pattern pattern, string fileName)
        {
            var match = pattern.Rx.Match(fileName);
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
                        Program._fw.Error($"{this.GetType().Name}.{nameof(GetFiles)}.{nameof(ApplyPattern)}", $"Failed to parse date: Endpoint: {this} File: {fileName} Pattern: {JsonWrapper.Serialize(pattern, true)}\r\n{e.UnwrapForLog()}").GetAwaiter().GetResult();
                        isMatch = false;
                    }
                }
            }

            return (isMatch, fileDate, fileName );
        }

        protected string CombineUrl(params string[] list) => list.Select(i => i?.Trim('/')).Where(i => !i.IsNullOrWhitespace()).Join("/");
    }
}