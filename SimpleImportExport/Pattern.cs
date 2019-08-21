using System.Collections.Generic;
using System.Linq;
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
            DestinationRelativePath = ge.GetS("DestinationPath");
            TokenFields = ge.GetE("TokenFields");
            FileDateFormat = ge.GetS("FileDateFormat");
            AdditionalFields = Rx.GetGroupNames().Where(g => !g.IsNullOrWhitespace() && !g.ParseInt().HasValue && g != "fileDate").ToArray();
        }

        public Regex Rx { get; }
        public string DestinationRelativePath { get; }
        public IGenericEntity TokenFields { get; }
        public string FileDateFormat { get; }
        public IEnumerable<string> AdditionalFields { get; }
    }
}