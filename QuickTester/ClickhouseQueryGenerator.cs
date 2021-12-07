using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility;
using Utility.Entity;

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
            var op = (await ge.EvalD("@")).Single().Key;
            if (op is "and" or "or")
            {
                r = await GenerateClickhouseNary(op, await ge.EvalE(op));
            }
            else if (op is "filter" or "!")
            {
                r = await GenerateClickhouseUnary(op, await ge.EvalE(op));
            }
            else if (op == "all")
            {
                r = GenerateClickhouseIn(await ge.EvalS($"{op}[0].var"), $"[{await ge.EvalL<string>($"{op}[1].in[1]").Select(s => $"\"{s}\"").Join(",")}]");
            }
            else
            {
                r = GenerateClickhouseBinary(op, await ge.EvalS($"{op}[0].var"), $"'{await ge.EvalS($"{op}[1]")}'");   // used to pass true to second getS
            }

            return "(" + r + ")";
        }

        public static async Task<string> GenerateClickhouseNary(string op, Entity ge) => await ge.EvalL("@").Select(async x => await GenerateClickhouseWhere(x)).Join(" " + op + " ");

        public static async Task<string> GenerateClickhouseUnary(string op, Entity ge)
        {
            var r = "";
            if (op == "!")
            {
                r = "NOT " + await GenerateClickhouseWhere(ge);
            }
            else if (op == "filter")
            {
                var vars = await ge.Eval("[0]..var").Select(async var => await var.EvalAsS("@")).Distinct().ToArray();
                var whereClause = await GenerateClickhouseWhere(await ge.EvalE("[0]"));
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
