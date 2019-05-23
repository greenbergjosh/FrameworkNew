using System.Text.RegularExpressions;
using Utility;
using Utility.GenericEntity;

namespace SimpleImportExport
{
    public class Pattern
    {
        public Pattern(IGenericEntity ge)
        {
            Rx = new Regex(ge.GetS("Pattern"), RegexOptions.Compiled | RegexOptions.IgnoreCase);
            SourceRelativePath = ge.GetS("SourcePath");
            DestinationRelativePath = ge.GetS("DestinationPath");
            TokenFields = ge.GetE("TokenFields");
            FileDateFormat = ge.GetS("FileDateFormat");
        }

        public Regex Rx { get; }
        public string SourceRelativePath { get; }
        public string DestinationRelativePath { get; }
        public IGenericEntity TokenFields { get; }
        public string FileDateFormat { get; }
    }
}