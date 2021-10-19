
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.Entity;
using Utility.Entity.Implementations;
using Utility.GenericEntity;

namespace QuickTester
{
    class EdwGrammar
    {
        public static Dictionary<string, Entity> context = new();
        public static Entity ContextEntity = null;
        public static Entity E = null;

        public static Entity GetScope(string name)
        {
            return context[name];
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

        /*
        public static Dictionary<string, string> productions = new()
        {
            ["rlp_std_group_by"] = @"
<<!process_constants[]|0|constant=context://g?constants.*>>
  SELECT event_id, event_ts, rs.id rs_id <<??context://g?thread_group_id[?(@.thread_group_type!=""singleton"")]->multiton_cols>>
    <<event_elements[,]|1|evt=context://g?event_elements.*|,>>
    <<rs_elements[,]|2|rs=context://g?rs_elements.*|,>>
    <<derived_elements[,]|3|der=context://g?derived_elements.*|,>>
  FROM satisfied_set ws JOIN warehouse_report_sequence.""<<context://sym?config_name>>"" rs 
    ON (ws.rs_id = rs.id AND ws.rs_ts = rs.ts)",

            ["process_constants"] = "'<<context://constant?value>>'::<<context://constant?data_type>>``<<context://constant?name>>",

            ["multiton_cols"] = ", rs.id rs_id, rs.ts rs_ts ",

            ["event_elements"] = "<<event_element>> \"<<context://evt?alias>>\"",
            ["event_element"] = "(coalesce(event_payload -> 'body' <<context://evt?json_path>>, ''))::<<context://evt?data_type>>``<<context://evt?alias>>",
            ["derived_elements"] = "<<derived_element>> \"<<context://der?alias>>\"",
            ["derived_element"] = "<<context://der?col_value>>::<<context://der?data_type>>``<<context://der?alias>>",
            ["rs_elements"] = "<<rs_element>> \"<<context://rs?alias>>\"",
            ["rs_element"] = "rs.<<context://rs?alias>>``<<context://rs?alias>>",

            ["union"] = "<<union_select[ UNION ]|0|tbl=context://g?names>>",
            ["union_select"] = "SELECT id, ts FROM warehouse_report_sequence.\"<<tbl://>>\" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>' ",
            ["long_term_union"] = "<<long_term_union_select[ UNION ]|0|tbl=context://g?names>>",
            ["long_term_union_select"] = @"SELECT id, ts FROM warehouse_report_sequence.""<<context://tbl?$>>"" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>'
                                            UNION
                                            SELECT id, ts FROM warehouse_report_sequence.""<<context://tbl?$>>_long_term"" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>"
        };*/

        /*
<<[]|1:!:,:event_elements:,:{new-scope}={expression};{new-scope}={expression}>>
<<??|1::,:{expression}->{production};{expression}->{production};{else-production}>>
<<cc|1::,:{expression}>>
         */

        public static Dictionary<string, Func<Production, Task<string>>> instructions = new() {
            ["__production"] = (p) => ProductionInstruction(p),
            ["__getter"] = (p) => GetterInstruction(p),
            ["[]"] = (p) => RepetitionInstruction(p),
            ["??"] = (p) => ConditionInstruction(p)
        };

        public static Dictionary<string, (string body, string symbol)> productions = new()
        {
            ["rlp_std_group_by"] = (@"
<<!0[]|process_constants|constant=context://g?constants.*>>
  SELECT event_id, event_ts <<{,}??|context://g?thread_group_id[?(@.thread_group_type!=""singleton"")]->multiton_cols>>
    <<{,}[]|event_elements|evt=context://g?event_elements.*|,>>
    <<{,}[]|rs_elements|rs=context://g?rs_elements.*|,>>
    <<{,}[]|derived_elements|der=context://g?derived_elements.*|,>>
  FROM satisfied_set ws JOIN warehouse_report_sequence.""<<context://sym?config_name>>"" rs 
    ON (ws.rs_id = rs.id AND ws.rs_ts = rs.ts)", null),

            ["process_constants"] = ("'<<context://constant?value>>'::<<context://constant?data_type>>", "<<context://constant?name>>"),

            ["multiton_cols"] = (", rs.id rs_id, rs.ts rs_ts ", null),

            ["event_elements"] = ("<<event_element>> \"<<context://evt?alias>>\"", null),
            ["event_element"] = ("(coalesce(event_payload -> 'body' <<context://evt?json_path>>, ''))::<<context://evt?data_type>>", "<<context://evt?alias>>"),
            ["derived_elements"] = ("<<derived_element>> \"<<context://der?alias>>\"", null),
            ["derived_element"] = ("<<context://der?col_value>>::<<context://der?data_type>>", "<<context://der?alias>>"),
            ["rs_elements"] = ("<<rs_element>> \"<<context://rs?alias>>\"", null),
            ["rs_element"] = ("rs.<<context://rs?alias>>", "<<context://rs?alias>>"),

            ["union"] = ("<<[]|union_select|tbl=context://g?names| UNION >>", null),
            ["union_select"] = ("SELECT id, ts FROM warehouse_report_sequence.\"<<tbl://>>\" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>' ", null),
            ["long_term_union"] = ("<<[]|long_term_union_select|tbl=context://g?names| UNION >>", null),
            ["long_term_union_select"] = (@"SELECT id, ts FROM warehouse_report_sequence.""<<context://tbl?$>>"" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>'
                                            UNION
                                            SELECT id, ts FROM warehouse_report_sequence.""<<context://tbl?$>>_long_term"" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>",
                                            null)
        };


        /*

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

        */

        public class Production
        {
            public string Match;
            public bool SuppressOutput;
            public int MatchOrder;
            public string PrependString;
            public string InstructionType;
            public string InstructionBody;
        }

        /*
        public static async Task<List<Production>> GetSubProductions(string productionBody)
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
            matches.Sort((x, y) => x.MatchOrder.CompareTo(y.MatchOrder));

            return matches;
        }
        */

        public static IEnumerable<Production> GetSubProductions(string productionBody)
        {
            List<Production> parsedMatches = new();
            int matchOrder = -1;
            foreach (Match m in Regex.Matches(productionBody, @"<<.*?>>"))
            {
                var p = new Production();
                p.Match = m.Value;
                string match = m.Value[2..^2];

                p.SuppressOutput = (match[0] == '!');
                if (p.SuppressOutput) match = match[1..];

                string ord = new string(match.TakeWhile(char.IsDigit).ToArray());
                if (!String.IsNullOrEmpty(ord)) p.MatchOrder = Int32.Parse(ord);
                else p.MatchOrder = matchOrder--;
                match = match[ord.Length..];

                p.PrependString = (match[0] == '{') ? new string(match[1..].TakeWhile(x => x != '}').ToArray()) : "";
                match = (p.PrependString.Length > 0) ? match[(p.PrependString.Length+2)..] : match;

                if (!match.Contains("|"))
                {
                    if (productions.ContainsKey(match.Trim()))
                    {
                        p.InstructionType = "__production";
                        p.InstructionBody = match.Trim();
                    }
                    else
                    {
                        p.InstructionType = "__getter";
                        p.InstructionBody = match.Trim();
                    }
                }
                else
                {
                    p.InstructionType = new string(match.TakeWhile(x => x != '|').ToArray());
                    p.InstructionBody = match[(p.InstructionType.Length + 1)..];
                }                
                parsedMatches.Add(p);
            }

            if (parsedMatches.Any())
            {
                int maxOrder = parsedMatches.Max(p => p.MatchOrder);
                return parsedMatches.OrderBy(p => (p.MatchOrder < 0) ? -p.MatchOrder + maxOrder : p.MatchOrder);
            }
            else
            {
                return parsedMatches;
            }
        }

        //public static async Task<string> CallProduction(string productionName)
        //{
        //    //return (string)Type.GetType("QuickTester.EdwGrammar").GetMethod(productionName)
        //    //    .Invoke(null, new object[] { productions[productionName] });

        //    if (productionName.Contains('/') && !productionName.Contains('<'))
        //    {
        //        string nsn = productionName.Split("://")[0];
        //        string nsp = productionName.Split("://")[1];
        //        if (nsn.Equals("context"))
        //        {
        //            return await CallProduction(await E.GetS(productionName)); // symbolTable[nsp];
        //        }
        //        else
        //        {
        //            return await CallProduction(await GetScope(nsn).GetS(nsp));
        //        }
        //    }

        //    string pb;
        //    string pbName;

        //    if (!productions.ContainsKey(productionName))
        //    {
        //        pb = productionName;
        //        pbName = "";
        //    }
        //    else
        //    {
        //        string[] pbSplit = productions[productionName].Split("``");
        //        pb = pbSplit[0];
        //        pbName = pbSplit.GetElementOrDefault(1, "");
        //    }

        //    var subProductions = await GetSubProductions(pb);

        //    foreach (var sp in subProductions)
        //    {
        //        if (sp.Match.StartsWith("<<??"))
        //        {
        //            string[] matchSplit = sp.Match[4..^2].Split('|');
        //            bool found = false;
        //            foreach (var m in matchSplit)
        //            {
        //                string[] branch = m.Split("->");
        //                var query = branch[0];
        //                if ((await E.Get(query)).Any())
        //                {
        //                    string cp = await CallProduction(branch[1]);
        //                    cp = !string.IsNullOrEmpty(cp) ? sp.PrependString + cp : "";
        //                    pb = pb.Replace(sp.Match, sp.SuppressOutput ? "" : cp);
        //                    found = true;
        //                    break;
        //                }
        //            }
        //            if (!found)
        //            {
        //                pb = pb.Replace(sp.Match, "");
        //            }
        //        }
        //        else if (sp.Scope == "")
        //        {
        //            string cp = await CallProduction(sp.ProdNames[0].matchName);
        //            cp = !string.IsNullOrEmpty(cp) ? sp.PrependString + cp : "";
        //            pb = pb.Replace(sp.Match, sp.SuppressOutput ? "" : cp);
        //        }
        //        else
        //        {
        //            string newScopeName = sp.Scope.Split('=')[0];
        //            string scopeInjection = sp.Scope.Split('=')[1];
        //            //string curScopeName = scopeInjection.Split("://")[0];
        //            //string scopePath = scopeInjection.Split("://")[1];

        //            if (sp.DoRepeat)
        //            {
        //                Dictionary<(string matchName, string repeatingCharacter, string symbolName), List<string>> rets = new();
        //                foreach (var scp in await E.Get(scopeInjection))
        //                {
        //                    context[newScopeName] = scp;
        //                    foreach (var pn in sp.ProdNames)
        //                    {
        //                        if (!rets.ContainsKey(pn)) rets.Add(pn, new List<string>());
        //                        rets[pn].Add(await CallProduction(pn.matchName));
        //                    }
        //                    context.Remove(newScopeName);
        //                }

        //                string cp = string.Join(sp.ProdNames[0].repeatingCharacter,
        //                    rets[(sp.ProdNames[0].matchName, sp.ProdNames[0].repeatingCharacter, sp.ProdNames[0].symbolName)]);
        //                cp = !string.IsNullOrEmpty(cp) ? sp.PrependString + cp : "";
        //                pb = pb.Replace(sp.Match, sp.SuppressOutput ? "" : cp);

        //                foreach (var (n, v) in rets)
        //                {
        //                    if (n.symbolName != null)
        //                    {
        //                        string scp = string.Join(n.repeatingCharacter,
        //                                rets[(n.matchName, n.repeatingCharacter, n.symbolName)]);
        //                        scp = !string.IsNullOrEmpty(scp) ? sp.PrependString + scp : "";  // may be n.PrependString
        //                        symbolTable.Add((productions.ContainsKey(n.symbolName) ? await CallProduction(n.symbolName) : n.symbolName),
        //                            scp);
        //                    }
        //                }
        //            }
        //            else
        //            {
        //                context[newScopeName] = await E.GetE(scopeInjection);
        //                string cp = await CallProduction(sp.ProdNames[0].matchName);
        //                cp = !string.IsNullOrEmpty(cp) ? sp.PrependString + cp : "";
        //                pb = pb.Replace(sp.Match, sp.SuppressOutput ? "" : cp);
        //                context.Remove(newScopeName);
        //            }
        //        }
        //    }

        //    if (pbName != "") symbolTable.TryAdd(await CallProduction(pbName), pb);

        //    return pb;
        //}

        public static async Task<string> CallProduction(string productionName)
        {
            return await CallProduction(productions[productionName].body, productions[productionName].symbol);
        }

        public static async Task<string> CallProduction(string instruction, string symbol)
        {
            foreach (var sp in GetSubProductions(instruction))
            {
                string res = await instructions[sp.InstructionType](sp);
                res = (!string.IsNullOrWhiteSpace(res)) ? sp.PrependString + res : "";
                instruction = instruction.Replace(sp.Match, sp.SuppressOutput ? "" : res);
            }

            if (!string.IsNullOrWhiteSpace(symbol))
            {
                foreach (var sp in GetSubProductions(symbol))
                {
                    string res = await instructions[sp.InstructionType](sp);
                    res = (!string.IsNullOrWhiteSpace(res)) ? sp.PrependString + res : "";
                    symbol = symbol.Replace(sp.Match, sp.SuppressOutput ? "" : res);
                }

                symbolTable[symbol] = instruction;
            }

            return instruction;
        }

        public static async Task<string> RepetitionInstruction(Production p)
        {
            // {production_name}|{scope_name}={scope_injection_expression}|{join_character}|{prepend_character}
            string[] parts = p.InstructionBody.Split('|');
            string productionName = parts[0];

            var scopeCollection = new Dictionary<string, IEnumerable<Entity>>();
            string[] scopes = parts[1].Split(';');
            foreach (var scope in scopes)
            {
                string scopeName = new(scope.TakeWhile(x => x != '=').ToArray());
                string scopeInjection = scope[(scopeName.Length + 1)..];
                var scopeEnumerable = await E.Get(scopeInjection);
                scopeCollection[scopeName] = scopeEnumerable;
            }

            string joinString = parts.Length > 2 ? parts[2] : "";

            List<string> rets = new();
            foreach (var scp in EnumerateParallel(scopeCollection))
            {
                foreach (var kvp in scp) context[kvp.Key] = kvp.Value;
                var ret = await CallProduction(productionName);
                rets.Add(ret);
                foreach (var kvp in scp) context.Remove(kvp.Key);
            }

            return string.Join(joinString, rets);
        }

        public static async Task<string> ConditionInstruction(Production p)
        {
            //{expression}->{production};{expression}->{production};{else-production}|{prepend-string}>>
            //context://g?thread_group_id[?(@.thread_group_type!=""singleton"")]->multiton_cols>>
            string[] conds = p.InstructionBody.Split(';');

            string s = "";
            foreach (var cond in conds)
            {
                string pr = null;
                string[] cp = cond.Split("->");
                if (cp.Length == 1) pr = cp[0];
                else if ((await E.Get(cp[0])).Any()) pr = cp[1];
                if (!String.IsNullOrEmpty(pr))
                {
                    s = await CallProduction(pr);
                    break;
                }
            }

            return s;
        }

        public static async Task<string> GetterInstruction(Production p)
        {
            string nsn = p.InstructionBody.Split("://")[0];
            string nsp = p.InstructionBody.Split("://")[1];
            if (nsn.Equals("context"))
            {
                return await CallProduction(await E.GetS(p.InstructionBody), null);
            }
            else
            {
                return await CallProduction(await GetScope(nsn).GetS(nsp), null);
            }
        }

        public static async Task<string> ProductionInstruction(Production p)
        {
            return await CallProduction(p.InstructionBody);
        }

        private static async Task<Entity> GetEntity(FrameworkWrapper fw, Entity root, string entityId)
        {
            var id = Guid.Parse(entityId);
            var entity = await fw.Entities.GetEntity(id);
            return await root.Parse("application/json", entity.GetS("/Config"));
        }

        private static async Task<Entity> GetEntityType(Entity root, string entityType)
        {
            var entities = await Data.CallFn("config", "SelectConfigsByType", new { type = entityType });
            return await root.Parse("application/json", entities.GetE("result").GetS(""));
        }


        public static async Task<Dictionary<string, string>> GenerateSql()  // Guid g
        {
            IEnumerable<object> three = Enumerable.Range(1, 3).Select(x => (object)x);
            IEnumerable<object> two = Enumerable.Range(1, 2).Select(x => (object)x);
            IEnumerable<object> one = Enumerable.Range(1, 1).Select(x => (object)x);
            foreach (var x in EnumerateParallel(new Dictionary<string, IEnumerable<object>> { ["three"] = (IEnumerable<object>)three,
                ["two"] = (IEnumerable<object>)two,
                ["one"] = (IEnumerable<object>)one,
            })) {

            }


            Dictionary<string, string> d = new();

            var fw = new FrameworkWrapper();

            E = Entity.Initialize(new Dictionary<string, EntityParser>
            {
                ["application/json"] = (entity, json) => EntityDocumentJson.Parse(json)
            }, new Dictionary<string, EntityRetriever>
            {
                ["entity"] = (entity, uri) => GetEntity(fw, entity, uri.Host),
                ["entityType"] = (entity, uri) => GetEntityType(entity, uri.Host),
                ["context"] = (entity, uri) => ContextEntity.GetE(uri.Host),
            });

            context = new Dictionary<string, Entity>
            {
                ["sym"] = Entity.Create(E, new EntityDocumentObject(symbolTable))
            };

            ContextEntity = Entity.Create(E, new EntityDocumentObject(context));

            string s = await E.GetS("entity://5f78294e-44b8-4ab9-a893-4041060ae0ea?RsConfigId");

            Entity e = await E.GetE("entity://3aeeb2b6-c556-4854-a679-46ea73a6f1c7"); // 8d0a6ac0-d351-4ab7-b9db-020a37ca14ee");


            context["g"] = e;  // "g", Entity(g)
            // context://g?path    g.Get(path).Value<bool>()

            //string initial_production = "long_term_union"; //rlp.GetS("initial_production");
            //string sql = await CallProduction(initial_production);

            symbolTable.Add("config_name", "Path Session");


            foreach (Entity rlp in await e.Get("rollups.*"))
            {
                context["rollup"] = rlp;
                string name = await rlp.GetS("name");
                //string grammar = rlp.GetS("grammar");
                string initial_production = "rlp_std_group_by"; //rlp.GetS("initial_production");
                string sql = await CallProduction(initial_production);
                context.Remove("rollup");
                d[name] = sql;
            }

            Console.WriteLine(string.Join(Environment.NewLine, d.Select(kvp => $"Rollup: {kvp.Key}{Environment.NewLine}Sql: {kvp.Value}{Environment.NewLine}")));
            return d;
        }

        //public static IEnumerable<(T, T)> Pairwise<T>(this IEnumerable<T> source)
        //{
        //    var previous = default(T);
        //    using (var it = source.GetEnumerator())
        //    {
        //        if (it.MoveNext())
        //            previous = it.Current;

        //        while (it.MoveNext())
        //            yield return (previous, previous = it.Current);
        //    }
        //}

        public static IEnumerable<Dictionary<string, object>> EnumerateParallel(Dictionary<string, IEnumerable<object>> es)
        {
            var ies = new Dictionary<string, IEnumerator<object>>();
            try
            {  
                foreach (var (k, v) in es)
                {
                    ies[k] = es[k].GetEnumerator();
                }

                bool done;
                do
                {
                    done = true;
                    var result = new Dictionary<string, object>();
                    foreach (var (k, v) in es)
                    {
                        if (ies[k].MoveNext())
                        {
                            result[k] = ies[k].Current;
                            done = false;
                        }
                        else
                        {
                            result[k] = null;
                        }
                    }
                    if (!done) yield return result;
                } while (!done);
            }
            finally
            {
                foreach (var (k, v) in es)
                {
                    ies[k].Dispose();
                }
            }
        }


        public static IEnumerable<Dictionary<string, Entity>> EnumerateParallel(Dictionary<string, IEnumerable<Entity>> es)
        {
            var ies = new Dictionary<string, IEnumerator<Entity>>();
            try
            {
                foreach (var (k, v) in es)
                {
                    ies[k] = v.GetEnumerator();
                }

                bool done;
                do
                {
                    done = true;
                    var result = new Dictionary<string, Entity>();
                    foreach (var (k, v) in ies)
                    {
                        if (v.MoveNext())
                        {
                            result[k] = v.Current;
                            done = false;
                        }
                        else
                        {
                            result[k] = null;
                        }
                    }
                    if (!done) yield return result;
                } while (!done);
            }
            finally
            {
                foreach (var (k, v) in ies)
                {
                    v.Dispose();
                }
            }
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
