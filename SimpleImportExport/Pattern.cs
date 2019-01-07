using System.Text.RegularExpressions;
using Utility;

namespace SimpleImportExport
{
    public class Pattern
    {
        public Pattern(IGenericEntity ge)
        {
            Rx = new Regex(ge.GetS("Pattern"), RegexOptions.Compiled | RegexOptions.IgnoreCase);
            SourceRelativePath = ge.GetS("SrcPath");
            DestinationRelativePath = ge.GetS("DestPath");
        }

        public Regex Rx { get; }
        public string SourceRelativePath { get; }
        public string DestinationRelativePath { get; }
    }
}