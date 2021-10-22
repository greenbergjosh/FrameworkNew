
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

namespace Utility.Entity
{
    public static class EntityExtensions
    {
        public static async Task<string> GetS(this Entity e, string query, string defaultValue)
        {
            var entity = await e.GetE(query);
            if (entity == null)
            {
                return defaultValue;
            }

            return entity.Value<string>();
        }
    }
}

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

        public static Dictionary<string, Func<Dictionary<string, (string body, string symbol)>, Production, Task<string>>> instructions = new() {
            ["__production"] = (c, p) => ProductionInstruction(c, p),
            ["__getter"] = (c, p) => GetterInstruction(c, p),
            ["[]"] = (c, p) => RepetitionInstruction(c, p),
            ["??"] = (c, p) => ConditionInstruction(c, p)
        };

        public static Dictionary<string, (string body, string symbol)> productions = new()
        {
            ["rlp_std_group_by"] = (@"
<<!0[]|process_constants|constant=context://g?constants.*>>
  SELECT event_id, event_ts <<??|context://g?thread_group_id[?(@.thread_group_type!=""singleton"")]->multiton_cols>>
    <<{,}[]|event_elements|evt=context://g?event_elements.*|,>>
    <<{,}[]|event_elements2|evt=context://g?event_elements.*;nvt=context://g?event_elements[1:]|,>>
    <<{,}[]|rs_elements|rs=context://g?rs_elements.*|,>>
    <<{,}[]|derived_elements|der=context://g?derived_elements.*|,>>
  FROM satisfied_set ws JOIN warehouse_report_sequence.""<<context://sym?config_name>>"" rs 
    ON (ws.rs_id = rs.id AND ws.rs_ts = rs.ts)", null),

            //  .replace('-', '') for the id
            ["tg_id"] = ("<<context://g?id>>", null),
            ["tg_name"] = ("<<context://g?name>>", null),
            ["tg_period"] = ("<<context://period?period>>", null),
            ["tg_next_period"] = ("<<context://nextperiod?period>>", null),
            ["tg_prefix"] = (@"<<??|context://g?thread_group_id.thread_group_type[?(@==""singleton"")]->'singleton_'>>", null),
            ["tg_table_name_base"] = ("<<tg_prefix>>rollup_groups.<<tg_name>>_<<tg_id>>", null),
            ["tg_table_name"] = ("<<tg_table_name_base>>_<<tg_period>>", null),
            ["tg_next_table_name"] = ("<<tg_table_name_base>>_<<tg_next_period>>", null),

            ["period"] = ("context://g?rollup_group_periods[0:]", null),
            ["nextperiod"] = (@"{ ""period"": ""catch_all"" }|context://g?rollup_group_periods[1:]", null),

            ["insert_thread_group_records"] = (@"
INSERT INTO edw.thread_group_periods(thread_group_id, thread_group_name, period, table_name, next_table_name)
VALUES <<[]|insert_thread_group_record|(period);(nextperiod)|,>>
<<insert_thread_group_catch_all>>
", null),

           
            ["insert_thread_group_record"] = (@"('<<tg_id>>', '<<tg_name>>', '<<tg_period>>', '<<tg_table_name>>', '<<tg_next_table_name>>')", null),
            ["insert_thread_group_catch_all"] = (@",( '<<tg_id>>', '<<tg_name>>', '0d', '<tg_table_name_base>>_catch_all', null)", null),

            

            ["process_constants"] = ("'<<context://constant?value>>'::<<context://constant?data_type>>", "<<context://constant?name>>"),

            ["multiton_cols"] = (", rs.id rs_id, rs.ts rs_ts ", null),

            ["event_elements2"] = ("<<context://evt?alias>>:::<<context://nvt?alias>>", null),

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
                                            null),




            ["insert_thread_group_records2"] = (@"
INSERT INTO edw.thread_group_periods(thread_group_id, thread_group_name, period, table_name, next_table_name)
VALUES <<[]|insert_thread_group_record|period=context://g?rollup_group_periods[0:];nextperiod/{""period"": ""catch_all""}=context://g?rollup_group_periods[1:]|,>>
<<insert_thread_group_catch_all>>
", null),
        };

        public class Production
        {
            public string Match;
            public bool SuppressOutput;
            public int MatchOrder;
            public string PrependString;
            public string InstructionType;
            public string InstructionBody;
        }

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

        public static async Task<string> CallProduction(string productionName)
        {
            return await CallProduction(productions[productionName].body, productions[productionName].symbol);
        }

        public static async Task<string> CallProduction(string instruction, string symbol)
        {
            foreach (var sp in GetSubProductions(instruction))
            {
                string res = await instructions[sp.InstructionType](productions, sp);
                res = (!string.IsNullOrWhiteSpace(res)) ? sp.PrependString + res : "";
                instruction = instruction.Replace(sp.Match, sp.SuppressOutput ? "" : res);
            }

            if (!string.IsNullOrWhiteSpace(symbol))
            {
                foreach (var sp in GetSubProductions(symbol))
                {
                    string res = await instructions[sp.InstructionType](productions, sp);
                    res = (!string.IsNullOrWhiteSpace(res)) ? sp.PrependString + res : "";
                    symbol = symbol.Replace(sp.Match, sp.SuppressOutput ? "" : res);
                }

                symbolTable[symbol] = instruction;
            }

            return instruction;
        }

        public static async Task<string> RepetitionInstruction(Dictionary<string, (string body, string symbol)> c, Production p)
        {
            // {production_name}|{scope_name}/{default}={scope_injection_expression}|{join_character}
            const int NDEF = 0;
            const int PROD = 1;
            const int JSON = 2;
            const int STRG = 3;

            string[] parts = p.InstructionBody.Split('|');
            string productionName = parts[0];

            var scopeCollection = new Dictionary<string, IEnumerable<Entity>>();
            var defCollection = new Dictionary<string, (string, int)>();
            string[] scopes = parts[1].Split(';');
            foreach (var scope in scopes)
            {
                string curScope;
                if (scope[0] == '(')
                {
                    string rslvd = await CallProduction(scope[1..^1]);
                    var scopeParts = rslvd.Split("|");
                    curScope = (scopeParts.Length == 1) ? scope[1..^1] + "=" + scopeParts[0] :
                        scope[1..^1] + "/" + scopeParts[0] + "=" + scopeParts[1];
                }
                else
                {
                    curScope = scope;
                }

                string scopeName = new(curScope.TakeWhile(x => x != '=').ToArray());
                string scopeDef = "";
                string[] scopePlusDefault = scopeName.Split('/');
                if (scopePlusDefault.Length == 2)
                {
                    scopeName = scopePlusDefault[0];
                    scopeDef = scopePlusDefault[1];
                    if (scopeDef[0] == '\'')
                    {
                        defCollection[scopeName] = (scopeDef[1..^1], STRG);
                    }
                    else if ((scopeDef[0] == '{') || (scopeDef[0] == '['))
                    {
                        defCollection[scopeName] = (scopeDef, JSON);
                    }
                    else
                    {
                        defCollection[scopeName] = (scopeDef, PROD);
                    }
                }
                else
                {
                    defCollection[scopeName] = ("", NDEF);
                }
                string scopeInjection = curScope[(scopeName.Length + (scopeDef.Length == 0 ? 0 : scopeDef.Length + 1) + 1)..];
                var scopeEnumerable = await E.Get(scopeInjection);
                scopeCollection[scopeName] = scopeEnumerable;
            }

            string joinString = parts.Length > 2 ? parts[2] : "";

            List<string> rets = new();
            foreach (var scp in EnumerateParallel(scopeCollection))
            {
                foreach (var kvp in scp)
                {
                    if (kvp.Value == null)
                    {
                        if (defCollection[kvp.Key].Item2 == STRG)
                        {
                            context[kvp.Key] = Entity.Create(E, new EntityDocumentConstant(defCollection[kvp.Key].Item1, EntityValueType.String, ""));
                        }
                        else if (defCollection[kvp.Key].Item2 == JSON)
                        {
                            
                            context[kvp.Key] = await E.Parse("application/json", defCollection[kvp.Key].Item1);
                        }
                        else if (defCollection[kvp.Key].Item2 == PROD)
                        {
                            context[kvp.Key] = Entity.Create(E, new EntityDocumentConstant(await CallProduction(defCollection[kvp.Key].Item1), EntityValueType.String, ""));
                        }
                        else
                        {
                            context[kvp.Key] = null;
                        }
                    }
                    else
                    {
                        context[kvp.Key] = kvp.Value;
                    } 
                }
                var ret = await CallProduction(productionName);
                rets.Add(ret);
                foreach (var kvp in scp) context.Remove(kvp.Key);
            }

            return string.Join(joinString, rets);
        }

        public static async Task<string> ConditionInstruction(Dictionary<string, (string body, string symbol)> c, Production p)
        {
            //{expression}->{production|'string'};{expression}->{production};{else-production}>>
            //context://g?thread_group_id[?(@.thread_group_type!=""singleton"")]->multiton_cols>>
            string curStr = p.InstructionBody;
            while (curStr.Length != 0)
            {
                string nextCond = new(curStr.TakeWhile(x => x != ';').ToArray());
                int arrowIdx = nextCond.IndexOf("->");
                bool isString = (nextCond[^1] == '\'');
                string expr = (arrowIdx == -1) ? "" : curStr[0..arrowIdx];
                string rtrn = nextCond[(arrowIdx == -1 ? 0 : expr.Length + 2)..];
                rtrn = (isString) ? rtrn[1..^1] : rtrn;
                rtrn = rtrn.Replace("''", "'");
                bool done = ((arrowIdx == -1) || (await E.Get(expr)).Any());
                if (done && isString) return rtrn;
                if (done) return await CallProduction(rtrn);

                if (nextCond.Length < curStr.Length) curStr = curStr[(nextCond.Length + 1)..];
                else break;
            }

            return "";
        }

        public static async Task<string> GetterInstruction(Dictionary<string, (string body, string symbol)> c, Production p)
        {
            string nsn = p.InstructionBody.Split("://")[0];
            string nsp = p.InstructionBody.Split("://")[1];
            if (nsn.Equals("context"))
            {
                return await CallProduction(await E.GetS(p.InstructionBody, ""), null);
            }
            else
            {
                return await CallProduction(await GetScope(nsn).GetS(nsp, ""), null);
            }
        }

        public static async Task<string> ProductionInstruction(Dictionary<string, (string body, string symbol)> c, Production p)
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
            Dictionary<string, string> d = new();

            var fw = new FrameworkWrapper();

            static string UnescapeQueryString(Uri uri) => Uri.UnescapeDataString(uri.Query.TrimStart('?'));

            E = Entity.Initialize(new Dictionary<string, EntityParser>
            {
                ["application/json"] = (entity, json) => EntityDocumentJson.Parse(json)
            }, new Dictionary<string, EntityRetriever>
            {
                ["entity"] = (entity, uri) => (GetEntity(fw, entity, uri.Host), UnescapeQueryString(uri)),
                ["entityType"] = (entity, uri) => (GetEntityType(entity, uri.Host), UnescapeQueryString(uri)),
                ["context"] = (entity, uri) => (ContextEntity.GetE(uri.Host), UnescapeQueryString(uri)),
            });


            context = new Dictionary<string, Entity>
            {
                ["sym"] = Entity.Create(E, new EntityDocumentObject(symbolTable))
            };

            ContextEntity = Entity.Create(E, new EntityDocumentObject(context));


            // add_thread_group
            Entity e1 = await E.GetE("entity://e97f0bac-2640-448c-b6f2-2a9a5510cc76");
            context["g"] = e1;
            string sql1 = await CallProduction("insert_thread_group_records");
            // end add_thread_group



            string s = await E.GetS("entity://5f78294e-44b8-4ab9-a893-4041060ae0ea?RsConfigId");

            Entity e = await E.GetE("entity://3aeeb2b6-c556-4854-a679-46ea73a6f1c7"); // 8d0a6ac0-d351-4ab7-b9db-020a37ca14ee");

            

            context["g"] = e;  // "g", Entity(g)
            // context://g?path    g.Get(path).Value<bool>()

            //string initial_production = "long_term_union"; //rlp.GetS("initial_production");
            //string sql = await CallProduction(initial_production);

            symbolTable.Add("config_name", "Path Session");

            //Production p = new Production();
            //p.InstructionBody = @"context://g?thread_group_id.thread_group_type[?(@!=""multiton"")]->'multiton_cols';context://g?thread_group_id.thread_group_type[?(@!=""multiton"")]->multiton_cols;bob";
            //await ConditionInstruction(p);


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

    }
}
