using Microsoft.SqlServer.Server;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace SqlRegularExpressions
{
    [SqlUserDefinedType(Format.Native)]
    public class SqlRegularExpressions
    {
        [SqlFunction(DataAccess = DataAccessKind.Read)]
        public static bool Like(string text, string pattern)
        {
            Match match = Regex.Match(text, pattern);
            return (match.Value != String.Empty);
        }

        [SqlFunction(DataAccess = DataAccessKind.Read)]
        public static string Matches(string text, string pattern, int index)
        {
            Match match = Regex.Match(text, pattern);
            if (match.Success && match.Groups.Count > index)
            {
                return match.Groups[index].Value;

            }
            else
                return "";
        }
    }
}
