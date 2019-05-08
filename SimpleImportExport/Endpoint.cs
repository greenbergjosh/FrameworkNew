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
            Patterns = ge.GetL("Patterns")?.Select(p => new Pattern(p)) ?? new Pattern[0];
        }

        public abstract EndpointType Type { get; }
        public abstract Task<Stream> GetStream(string fileRelativePath);
        public abstract Task<long> SendStream((string srcPath, string destPath, string name) file, Endpoint source);
        public abstract Task<IEnumerable<(string srcPath, string destPath, string name)>> GetFiles();
        public abstract Task Delete(string fileRelativePath);
        public Task Move(string fileRelativePath, string relativeBasePath) => Move(fileRelativePath, relativeBasePath, false);
        public abstract Task Move(string fileRelativePath, string relativeBasePath, bool overwrite);
        public Task Rename(string fileRelativePath, Regex pattern, string patternReplace) => Rename(fileRelativePath, pattern, patternReplace, false);
        public abstract Task Rename(string fileRelativePath, Regex pattern, string patternReplace, bool overwrite);
        protected IEnumerable<Pattern> Patterns { get; }

        protected string CombineUrl(params string[] list) => list.Select(i => i?.Trim('/')).Where(i => !i.IsNullOrWhitespace()).Join("/");
    }
}