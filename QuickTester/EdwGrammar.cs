using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Utility.GenericEntity;

namespace QuickTester
{
    class EdwGrammar
    {
        public static Stack<(string name, IGenericEntity ge)> scope = new();

        public static IGenericEntity GetScope(string name)
        {
            return scope.Where(x => x.name.Equals(name)).ToArray()[0].ge;
        }

        public static Dictionary<string, string> symbolTable = new();
        /*
        public static Dictionary<string, string> productions = new()
        {
            ["rlp_std_group_by"] = "SELECT <<agg_column_list|2>> FROM (<<qry_derived_elements|1>>) ws GROUP BY <<key_col_list_without_aliases|3>>",
            ["agg_column_list"] = "<<agg_column[,];xyz=agg_column_ord[ ];abc=agg_column_ord3[-]|0|bob=rollup://bobpath>>",
            ["qry_derived_elements"] = "hello",
            ["key_col_list_without_aliases"] = "<<sym://uuid_alias>>",
            ["agg_column"] = "blah::<<bob://data_type>>::blah``<<bob://alias>>",
            ["agg_column_ord"] = "blah2::<<bob://data_type>>::blah2``<<bob://alias>>",
            ["agg_column_ord3"] = "blah3::<<bob://data_type>>::blah3``<<bob://alias>>",
            ["xyz"] = "blah2::<<rollup://col1>>::blah2"
        };
        */
        /*
        public static Dictionary<string, string> productions = new()
        {
            ["rlp_std_group_by"] = "SELECT <<agg_column_list|2>> FROM (<<qry_derived_elements|1>>) ws GROUP BY <<key_col_list_without_aliases|3>>",
            ["agg_column_list"] = "<<agg_column[,];xyz=agg_column_ord[ ];abc=agg_column_ord3[-]|0|bob=rollup://bobpath>>",
            ["qry_derived_elements"] = "<<??bob://aggregate_expression->aggregate_expression|bob://aggregate_signature->aggregate_signature>>",
            ["key_col_list_without_aliases"] = "<<sym://uuid_alias>>",
            ["agg_column"] = "blah::<<bob://data_type>>::blah``<<bob://alias>>",
            ["agg_column_ord"] = "blah2::<<bob://data_type>>::blah2``<<bob://alias>>",
            ["agg_column_ord3"] = "blah3::<<bob://data_type>>::blah3``<<bob://alias>>",
            ["xyz"] = "blah2::<<rollup://col1>>::blah2"
        };
        */
        public static Dictionary<string, string> productions = new()
        {
            ["rlp_std_group_by"] = @"
<<!process_constants[]|0|constant=g://constants>>
  SELECT event_id, event_ts, rs.id rs_id, <<??g://thread_group_id/thread_group_type!=""singleton""->multiton_cols>>
    <<event_elements[,]|1|evt=g://event_elements|,>>
    <<rs_elements[,]|2|rs=g://rs_elements|,>>
    <<derived_elements[,]|3|der=g://derived_elements|,>>
  FROM satisfied_set ws JOIN warehouse_report_sequence.""<<sym://config_name>>"" rs 
    ON (ws.rs_id = rs.id AND ws.rs_ts = rs.ts)",

            ["process_constants"] = "'<<constant://value>>'::<<constant://data_type>>``<<constant://name>>",

            ["multiton_cols"] = ", rs.id rs_id, rs.ts rs_ts ",

            ["event_elements"] = "<<event_element>> \"<<evt://alias>>\"",
            ["event_element"] = "(coalesce(event_payload -> 'body' <<evt://json_path>>, ''))::<<evt://data_type>>``<<evt://alias>>",
            ["derived_elements"] = "<<derived_element>> \"<<der://alias>>\"",
            ["derived_element"] = "<<der://col_value>>::<<der://data_type>>``<<der://alias>>",
            ["rs_elements"] = "<<rs_element>> \"<<rs://alias>>\"",
            ["rs_element"] = "rs.<<rs://alias>>``<<rs://alias>>",

            ["union"] = "<<union_select[ UNION ]|0|tbl=g://names>>",
            ["union_select"] = "SELECT id, ts FROM warehouse_report_sequence.\"<<tbl://>>\" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>' ",
            ["long_term_union"] = "<<long_term_union_select[ UNION ]|0|tbl=g://names>>",
            ["long_term_union_select"] = @"SELECT id, ts FROM warehouse_report_sequence.""<<tbl://>>"" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>'
                                            UNION
                                            SELECT id, ts FROM warehouse_report_sequence.""<<tbl://>>_long_term"" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>"
        };


        public enum MacroIndex
        {
            Name = 0,
            Order,
            Scope,
            PrependString

        }

        public class Production
        {
            public string Match;
            public bool SuppressOutput;
            public int MatchOrder;
            public List<(string matchName, string repeatingCharacter, string symbolName)> ProdNames;
            public string Scope;
            public bool DoRepeat;
            public string PrependString;

            public Production(string match, bool suppressOutput, int matchOrder, List<(string matchName, string repeatingCharacter, string symbolName)> prodNames,
                string scope, bool doRepeat, string prependString)
            {
                Match = match;
                SuppressOutput = suppressOutput;
                MatchOrder = matchOrder;
                ProdNames = prodNames;
                Scope = scope;
                DoRepeat = doRepeat;
                PrependString = prependString;
            }
        }

        public static List<Production> GetSubProductions(string productionBody)
        {
            List<Production> matches = new();
            foreach (Match m in Regex.Matches(productionBody, @"<<.*?>>"))
            {
                string[] matchSplit = m.Value[2..^2].Split('|');
                string matchName = matchSplit[(int)MacroIndex.Name];
                bool suppressOutput = false;
                if (matchName.StartsWith("!"))
                {
                    suppressOutput = true;
                    matchName = matchName[1..];
                }

                bool doRepeat = false;
                string[] names = matchName.Split(';');
                List<(string matchName, string repeatingCharacter, string symbolName)> prodNames = new();
                foreach (string name in names)
                {
                    string[] lnr = name.Split('=');
                    string[] nameParts = lnr[lnr.Length - 1].Split('[');
                    string pname = nameParts[0];
                    string pdelm = nameParts.GetElementOrDefault(1, null)?[0..^1];
                    prodNames.Add((pname, pdelm, (lnr.Length == 2) ? lnr[0] : null));
                    if (pdelm != null) doRepeat = true;
                }

                int matchOrder = Int32.Parse(matchSplit.GetElementOrDefault((int)MacroIndex.Order, "0"));
                string matchScope = matchSplit.GetElementOrDefault((int)MacroIndex.Scope, "");
                string prependString = matchSplit.GetElementOrDefault((int)MacroIndex.PrependString, "");
                matches.Add(new Production(m.Value, suppressOutput, matchOrder, prodNames, matchScope, doRepeat, prependString));
            }
            matches.Sort((x,y) => x.MatchOrder.CompareTo(y.MatchOrder));

            return matches;
        }
        
        public static string CallProduction(string productionName)
        {
            //return (string)Type.GetType("QuickTester.EdwGrammar").GetMethod(productionName)
            //    .Invoke(null, new object[] { productions[productionName] });

            if (productionName.Contains('/') && !productionName.Contains('<'))
            {
                string nsn = productionName.Split("://")[0];
                string nsp = productionName.Split("://")[1];
                if (nsn.Equals("sym")) return symbolTable[nsp];
                else return CallProduction(GetScope(nsn).GetS(nsp));
            }

            if (productions.ContainsKey(productionName) && productions[productionName].StartsWith("<<??"))
            {
                string[] matchSplit = productions[productionName][4..^2].Split('|');
                foreach (var m in matchSplit)
                {
                    string[] branch = m.Split("->");
                    string nsn = branch[0].Split("://")[0];
                    string nsp = branch[0].Split("://")[1];
                    if (GetScope(nsn).GetE(nsp) != null)
                    {
                        return CallProduction(branch[1]);
                    }
                }
            }

            string pb;
            string pbName;

            if (!productions.ContainsKey(productionName))
            {
                pb = productionName;
                pbName = "";
            }
            else
            {
                string[] pbSplit = productions[productionName].Split("``");
                pb = pbSplit[0];
                pbName = pbSplit.GetElementOrDefault(1, "");
            }            

            var subProductions = GetSubProductions(pb);

            foreach (var sp in subProductions)
            {
                if (sp.Scope == "")
                {
                    string cp = CallProduction(sp.ProdNames[0].matchName);
                    cp = !string.IsNullOrEmpty(cp) ? sp.PrependString + cp : "";
                    pb = pb.Replace(sp.Match, sp.SuppressOutput ? "" : cp);
                }
                else
                {
                    string newScopeName = sp.Scope.Split('=')[0];
                    string scopeInjection = sp.Scope.Split('=')[1];
                    string curScopeName = scopeInjection.Split("://")[0];
                    string scopePath = scopeInjection.Split("://")[1];

                    if (sp.DoRepeat)
                    {
                        Dictionary<(string matchName, string repeatingCharacter, string symbolName), List<string>> rets = new();
                        foreach (var scp in GetScope(curScopeName).GetL(scopePath))
                        {
                            scope.Push((newScopeName, scp));
                            foreach (var pn in sp.ProdNames)
                            {
                                if (!rets.ContainsKey(pn)) rets.Add(pn, new List<string>());
                                rets[pn].Add(CallProduction(pn.matchName));
                            }
                            scope.Pop();
                        }

                        string cp = string.Join(sp.ProdNames[0].repeatingCharacter,
                            rets[(sp.ProdNames[0].matchName, sp.ProdNames[0].repeatingCharacter, sp.ProdNames[0].symbolName)]);
                        cp = !string.IsNullOrEmpty(cp) ? sp.PrependString + cp : "";
                        pb = pb.Replace(sp.Match, sp.SuppressOutput ? "" : cp);

                        foreach (var (n,v) in rets)
                        {
                            if (n.symbolName != null)
                            {
                                string scp = string.Join(n.repeatingCharacter,
                                        rets[(n.matchName, n.repeatingCharacter, n.symbolName)]);
                                scp = !string.IsNullOrEmpty(scp) ? sp.PrependString + scp : "";  // may be n.PrependString
                                symbolTable.Add((productions.ContainsKey(n.symbolName) ? CallProduction(n.symbolName) : n.symbolName),
                                    scp);
                            }
                        }
                    }
                    else
                    {
                        scope.Push((newScopeName, GetScope(curScopeName).GetE(scopePath)));
                        string cp = CallProduction(sp.ProdNames[0].matchName);
                        cp = !string.IsNullOrEmpty(cp) ? sp.PrependString + cp : "";
                        pb = pb.Replace(sp.Match, sp.SuppressOutput ? "" : cp);
                        scope.Pop();
                    }
                }
            }

            if (pbName != "") symbolTable.TryAdd(CallProduction(pbName), pb);

            return pb;
        }
        
        public static Dictionary<string, string> GenerateSql(IGenericEntity ge)
        {
            Dictionary<string, string> d = new();

            scope.Push(("g", ge));

            //string initial_production = "long_term_union"; //rlp.GetS("initial_production");
            //string sql = CallProduction(initial_production);

            symbolTable.Add("config_name", "Path Session");

            /*
            foreach (IGenericEntity rlp in ge.GetL("rollups"))
            {
                scope.Push(("rollup", rlp));
                string name = rlp.GetS("name");
                //string grammar = rlp.GetS("grammar");
                string initial_production = "rlp_std_group_by"; //rlp.GetS("initial_production");
                string sql = CallProduction(initial_production);
                scope.Pop();
                d[name] = sql;
            }
            */
            return d;
        }
        
        /*
        public static string rlp_std_group_by()
        {
            return $"SELECT {agg_column_list(all, ctx)} FROM ({qry_derived_elements(all, ctx)}) ws GROUP BY {key_col_list_without_aliases(all, ctx)};";
        }

        public static string agg_column_list()
        {
            return $"agg_col_list";
        }

        public static string qry_derived_elements()
        {
            return $"qry_derived_elements";
        }

        public static string key_col_list_without_aliases()
        {
            List<string> res = new();

            foreach (IGenericEntity col in ctx.GetL("columns").Where(ge => ge.GetB("is_key")))
            {
                res.Add(key_col_without_aliases(all, col));
                
            }

            return string.Join(',', res);
        }

        public static string key_col_without_aliases()
        {   
            return $"{expression(all, ctx)}::{ctx.GetS("data_type")}";
        }

        public static string expression()
        {
            return "";
        }
        */
    }
}
