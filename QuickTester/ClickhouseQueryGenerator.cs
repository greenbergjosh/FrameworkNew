using System.Linq;
using Utility;
using Utility.GenericEntity;

namespace QuickTester
{
    class ClickhouseQueryGenerator
    {
        public static string generateClickhouseQuery(IGenericEntity ge)
        {
            string q = "SELECT <top_level_field_list> FROM datasets.email WHERE "
                + generateClickhouseWhere(ge);
            return q;
        }

        public static string generateClickhouseWhere(IGenericEntity ge)
        {
            string r;
            var op = ge.GetD("").Single().Item1;
            if (op == "and" || op == "or") r = generateClickhouseNary(op, ge.GetE(op));
            else if (op == "filter" || op == "!") r = generateClickhouseUnary(op, ge.GetE(op));
            else if (op == "all")
                r = generateClickhouseIn(ge.GetS($"{op}[0]/var"), $"[{ge.GetLS($"{op}[1]/in[1]", true).Join(",")}]");
            else r = generateClickhouseBinary(op, ge.GetS($"{op}[0]/var"), ge.GetS($"{op}[1]", true));
            return "(" + r + ")";
        }

        public static string generateClickhouseNary(string op, IGenericEntity ge)
        {
            return ge.GetL("").Select(x => generateClickhouseWhere(x)).Join(" " + op +" ");
        }

        public static string generateClickhouseUnary(string op, IGenericEntity ge)
        {
            string r = "";
            if (op == "!") r = "NOT " + generateClickhouseWhere(ge);
            else if (op == "filter")
            { 
                // Test here to see if child.Children.Count == 1 AND child.Children[1].condition=IN
                r = "arrayFilter(x -> " +
                generateClickhouseWhere(ge).Replace("$", "x.") +
                ", arrayZip(" +
                //join(child.Children, ",") +
                ")) <> []";
            }
            return r;
        }

        public static string generateClickhouseIn(string var, string set)
        {
            return "hasAny(" + var + "," + set + ")";
        }

        public static string generateClickhouseBinary(string op, string var, string val)
        {
            return var + op + val;
        }
    }
}
