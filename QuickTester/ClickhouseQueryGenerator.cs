using System.Linq;
using System.Threading.Tasks;
using Utility;
using Utility.Entity;

// email_events_merged

namespace QuickTester
{
    internal class ClickhouseQueryGenerator
    {
        public static async Task<string> GenerateClickhouseQuery(Entity ge)
        {
            var q = "SELECT email FROM datasets.email_events_merged WHERE "
                + await GenerateClickhouseWhere(ge);
            return q;
        }

        public static async Task<string> GenerateClickhouseWhere(Entity ge)
        {
            string r;
            var op = (await ge.GetD("")).Single().Key;
            if (op is "and" or "or")
            {
                r = await GenerateClickhouseNary(op, await ge.GetE(op));
            }
            else if (op is "filter" or "!")
            {
                r = await GenerateClickhouseUnary(op, await ge.GetE(op));
            }
            else if (op == "all")
            {
                r = GenerateClickhouseIn(await ge.GetS($"{op}[0].var"), $"[{(await ge.GetL<string>($"{op}[1].in[1]")).Select(s => $"\"{s}\"").Join(",")}]");
            }
            else
            {
                r = GenerateClickhouseBinary(op, await ge.GetS($"{op}[0].var"), $"'{await ge.GetS($"{op}[1]")}'");   // used to pass true to second getS
            }

            return "(" + r + ")";
        }

        public static async Task<string> GenerateClickhouseNary(string op, Entity ge) => (await (await ge.GetL("")).Select(async x => await GenerateClickhouseWhere(x))).Join(" " + op + " ");

        public static async Task<string> GenerateClickhouseUnary(string op, Entity ge)
        {
            var r = "";
            if (op == "!")
            {
                r = "NOT " + await GenerateClickhouseWhere(ge);
            }
            else if (op == "filter")
            {
                // We materialize the list with ToArray just in case the GenericEntity doesn't preserve order (we iterate vars twice)
                var vars = (await (await ge.Get("[0]..var")).Select(var => var.GetAsS(""))).Distinct().ToArray();
                var whereClause = await GenerateClickhouseWhere(await ge.GetE("[0]"));
                for (var i = 0; i < vars.Length; i++)
                {
                    whereClause = whereClause.Replace(vars[i], $"x.{i + 1}");
                }

                r = "arrayFilter(x -> " + whereClause + ", arrayZip(" + string.Join(',', vars) + ")) <> []";
            }

            return r;
        }

        public static string GenerateClickhouseIn(string var, string set) => "hasAny(" + var + "," + set + ")";

        public static string GenerateClickhouseBinary(string op, string var, string val) => var + op + val;
    }
}
