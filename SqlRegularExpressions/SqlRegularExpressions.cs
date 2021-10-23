using System.Text.RegularExpressions;
using Microsoft.SqlServer.Server;

namespace SqlRegularExpressions
{
    [SqlUserDefinedType(Format.Native)]
    public class SqlRegularExpressions
    {
        [SqlFunction(DataAccess = DataAccessKind.Read)]
        public static bool Like(string text, string pattern)
        {
            Match match = Regex.Match(text, pattern);
            return (match.Value != string.Empty);
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
