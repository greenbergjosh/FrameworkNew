using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Utility;

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
            Patterns = ge.GetL("Patterns")?.Select(p => new Pattern(p));
        }

        public abstract EndpointType Type { get; }
        public abstract Task<Stream> GetStream(string fileRelativePath);
        public abstract Task<long> SendStream((string srcPath, string destPath, string name) file, Endpoint source);
        public abstract Task<IEnumerable<(string srcPath, string destPath, string name)>> GetFiles();
        public abstract Task Delete(string fileRelativePath);
        public abstract Task Move(string fileRelativePath, string relativeBasePath);
        protected IEnumerable<Pattern> Patterns { get; }

        protected string CombineUrl(params string[] list) => list.Select(i => i.TrimEnd('/')).Where(i=>!i.IsNullOrWhitespace()).Join("/");
    }
}