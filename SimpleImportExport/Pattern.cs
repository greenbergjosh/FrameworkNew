using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Utility;
using Utility.Entity;

namespace SimpleImportExport
{
    public class Pattern
    {
        private Pattern(Regex rx, string destinationRelativePath, Entity tokenFields, string fileDateFormat, IEnumerable<string> additionalFields)
        {
            Rx = rx;
            DestinationRelativePath = destinationRelativePath;
            TokenFields = tokenFields;
            FileDateFormat = fileDateFormat;
            AdditionalFields = additionalFields;
        }

        public static async Task<Pattern> Create(Entity ge)
        {
            var rx = new Regex(await ge.EvalS("Pattern"), RegexOptions.Compiled | RegexOptions.IgnoreCase);
            var destinationRelativePath = await ge.EvalS("DestinationPath");
            var tokenFields = await ge.EvalE("TokenFields");
            var fileDateFormat = await ge.EvalS("FileDateFormat");
            var additionalFields = rx.GetGroupNames().Where(g => !g.IsNullOrWhitespace() && !g.ParseInt().HasValue && g != "fileDate").ToArray();

            return new Pattern(rx, destinationRelativePath, tokenFields, fileDateFormat, additionalFields);
        }

        public Regex Rx { get; }
        public string DestinationRelativePath { get; }
        public Entity TokenFields { get; }
        public string FileDateFormat { get; }
        public IEnumerable<string> AdditionalFields { get; }
    }
}