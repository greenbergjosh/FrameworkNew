using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.Entity;
using Utility.Entity.Implementations;

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

        public static Dictionary<string, Func<Production, Task<string>>> instructions = new()
        {
            ["__production"] = (p) => ProductionInstruction(p),
            ["__getter"] = (p) => GetterInstruction(p),
            ["[]"] = (p) => RepetitionInstruction(p),
            ["??"] = (p) => ConditionInstruction(p)
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

            ["insert_thread_group_records"] = (@"INSERT edw.thread_group_periods
                (<<??|context://g?thread_group_id[?(@.thread_group_type==""singleton"")]->'singleton_'>>rollup_groups.{_thread_group_name}_{replace(_thread_group_id::TEXT, '-', '')}_period)", null),

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
                                            null)
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
                match = (p.PrependString.Length > 0) ? match[(p.PrependString.Length + 2)..] : match;

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
            // {production_name}|{scope_name}={scope_injection_expression}|{join_character}
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
            //{expression}->{production|'string'};{expression}->{production};{else-production}>>
            //context://g?thread_group_id[?(@.thread_group_type!=""singleton"")]->multiton_cols>>
            string curStr = p.InstructionBody;
            while (curStr.Length != 0)
            {
                int arrowIdx = curStr.IndexOf("->");
                bool isString = (curStr[arrowIdx + 1] == '\'');
                string stringVal = new(curStr.TakeWhile(x => x != (isString ? '\'' : ';')).ToArray());
                var b = await E.Get(curStr[0..arrowIdx]);
                var c = (await E.Get("context://g?thread_group_id.thread_group_type[?(@==\"multiton\")]")).Any();
                var d = (await E.Get("context://g?thread_group_id.thread_group_type[?(@!=\"multiton\")]")).Any();
                bool done = ((arrowIdx == -1) || (await E.Get(curStr[0..arrowIdx])).Any());
                if (done && isString) return stringVal[(arrowIdx + 3)..-1];
                if (done) return await CallProduction(stringVal[(arrowIdx + 2)..]);

                if (isString) curStr = curStr[(stringVal.Length + 3)..];
                else curStr = curStr[(stringVal.Length + 2)..];
            }

            return "";

            //string[] conds = p.InstructionBody.Split(';');

            //string s = "";
            //foreach (var cond in conds)
            //{
            //    string pr = null;
            //    string[] cp = cond.Split("->");
            //    if (cp.Length == 1) pr = cp[0];
            //    else if ((await E.Get(cp[0])).Any()) pr = cp[1];
            //    if (!String.IsNullOrEmpty(pr))
            //    {
            //        s = await CallProduction(pr);
            //        break;
            //    }
            //}

            //return s;
        }

        public static async Task<string> GetterInstruction(Production p)
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

        public static async Task<string> ProductionInstruction(Production p)
        {
            return await CallProduction(p.InstructionBody);
        }

        private static async Task<Entity> GetEntity(FrameworkWrapper fw, Entity root, string entityId)
        {
            var id = Guid.Parse(entityId);
            var entity = await fw.Entities.GetEntity(id);
            entity.Set("/Config/$id", id);
            entity.Set("/Config/$name", entity.GetS("/Name"));
            return await root.Parse("application/json", entity.GetS("/Config"));
        }

        private static async Task<Entity> GetEntityType(Entity root, string entityType)
        {
            var entities = await Data.CallFn("config", "SelectConfigsByType", new { type = entityType });

            var convertedEntities = new List<Entity>();
            foreach (var entity in entities.GetL("result"))
            {
                entity.Set("/Config/$id", entity.GetS("/Id"));
                entity.Set("/Config/$name", entity.GetS("/Name"));
                var convertedEntity = await root.Parse("application/json", entity.GetS(""));
                convertedEntities.Add(convertedEntity);
            }
            return Entity.Create(root, EntityDocumentArray.Create(convertedEntities));
        }


        public static async Task<Dictionary<string, string>> GenerateSql()  // Guid g
        {
            Dictionary<string, string> d = new();

            var fw = new FrameworkWrapper();

            static string UnescapeQueryString(Uri uri) => Uri.UnescapeDataString(uri.Query.TrimStart('?'));

            E = Entity.Initialize(new EntityConfig(
                Parser: (entity, contentType, content) => contentType switch
                {
                    "application/json" => EntityDocumentJson.Parse(content),
                    _ => throw new InvalidOperationException($"Unknown contentType: {contentType}")
                },
                Retriever: (entity, uri) => uri.Scheme switch
                {
                    "entity" => (GetEntity(fw, entity, uri.Host), UnescapeQueryString(uri)),
                    "entityType" => (GetEntityType(entity, uri.Host), UnescapeQueryString(uri)),
                    "context" => (ContextEntity.GetE(uri.Host), UnescapeQueryString(uri)),
                    _ => throw new InvalidOperationException($"Unknown scheme: {uri.Scheme}")
                },
                MissingPropertyHandler: null)
            );

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

            Production p = new Production();
            p.InstructionBody = @"context://g?thread_group_id[?(@.thread_group_type!=""multiton"")]->multiton_cols;context://g?thread_group_id[?(@.thread_group_type!=""singleton"")]->multiton_cols;'bob'";
            await ConditionInstruction(p);


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
