//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text.RegularExpressions;
//using System.Threading.Tasks;
//using Utility;
//using Utility.DataLayer;
//using Utility.Entity;
//using Utility.Entity.Implementations;
//using Utility.Evaluatable;

////namespace Utility.Entity
////{
////    public static class EntityExtensions
////    {
////        public static async Task<string> GetS(this Entity e, string query, string defaultValue)
////        {
////            var entity = await e.EvalE(query);
////            if (entity == null)
////            {
////                return defaultValue;
////            }

////            return entity.Value<string>();
////        }
////    }
////}

//namespace QuickTester
//{
//    internal class EdwGrammar2
//    {
//        public static Dictionary<string, Entity> context = new();
//        public static Entity ContextEntity = null;
//        public static Entity E = null;

//        public static Entity GetScope(string name) => context[name];

//        // Ed change to <string, Entity>
//        public static Dictionary<string, object> symbolTable = new();

//        public static Dictionary<string, Func<Production, Task<Entity>>> instructions = new()
//        {
//            ["__production"] = (p) => ProductionInstruction(p),
//            ["g"] = (p) => GetterInstruction(p),
//            ["[]"] = (p) => RepetitionInstruction(p),
//            ["??"] = (p) => ConditionInstruction(p)
//        };

//        // Maybe loop through pushing rs and tg into scope, instead of using g

//        public static Dictionary<string, Entity> productions;

//        public class ProductionDescription : IEvaluatable
//        {
//            public string Body { get; }
//            public string Symbol { get; }

//            public ProductionDescription(string body, string symbol)
//            {
//                Body = body;
//                Symbol = symbol;
//            }

//            public async IAsyncEnumerable<Entity> Evaluate(Entity entity)
//            {
//                yield return await CallProduction(Body, Symbol);
//            }
//        }

//        public static void CreateProductions()
//        {
//            productions = new()
//            {
//                ["rlp_std_group_by"] = E.Create(new ProductionDescription(@"
//<<!0[]|process_constants|constant=context://g?constants.*>>
//  SELECT event_id, event_ts <<??|context://g?thread_group_id[?(@.thread_group_type!=""singleton"")]->multiton_cols>>
//    <<{,}[]|event_elements|evt=context://g?event_elements.*|,>>
//    <<{,}[]|rs_elements|rs=context://g?rs_elements.*|,>>
//    <<{,}[]|derived_elements|der=context://g?derived_elements.*|,>>
//  FROM satisfied_set ws JOIN warehouse_report_sequence.""<<g|context://sym?config_name>>"" rs 
//    ON (ws.rs_id = rs.id AND ws.rs_ts = rs.ts)", null)),

//                // add_thread_group
//                //  .replace('-', '') for the id
//                ["delete_thread_group_records"] = E.Create(new ProductionDescription(@"DELETE FROM edw.thread_group_periods WHERE thread_group_id = <<tg_id>>", null)),

//                ["insert_thread_group_records"] = E.Create(new ProductionDescription(@"
//INSERT INTO edw.thread_group_periods(thread_group_id, thread_group_name, period, table_name, next_table_name)
//VALUES <<[]|insert_thread_group_record|(period);(nextperiod)|,>>
//       <<insert_thread_group_catch_all>>", null)),

//                ["create_tg_table_and_indexes"] = E.Create(new ProductionDescription(@"
//CREATE TABLE IF NOT EXISTS <<tg_schema_name>>.<<g|context://tg_tables>> 
//  (event_id UUID, event_ts timestamptz<<??|(tg_multiton_expr)->tg_multiton_cols>>, rs_config_id UUID, record_create_ts timestamptz DEFAULT now(), expires timestamptz, has_whep boolean, PRIMARY KEY(event_id<<??|(tg_multiton_expr)->tg_multiton_cols2>>));
//CREATE INDEX IF NOT EXISTS ix_<<g|context://tg_tables>>_config ON <<tg_schema_name>>.<<g|context://tg_tables>> (rs_config_id, event_id);
//CREATE INDEX IF NOT EXISTS ix_<<g|context://tg_tables>>_event ON <<tg_schema_name>>.<<g|context://tg_tables>> (event_id, event_ts);
//<<??|(tg_multiton_expr)->tg_multiton_index>>
//CREATE INDEX IF NOT EXISTS ix_<<g|context://tg_tables>>_rct ON <<tg_schema_name>>.<<g|context://tg_tables>> (record_create_ts);
//", null)),

//                ["insert_thread_group_record"] = E.Create(new ProductionDescription(@"('<<tg_id>>', '<<tg_name>>', '<<tg_period>>', '<<tg_schema_name>>.<<tg_table_name>>', '<<tg_schema_name>>.<<tg_next_table_name>>')", null)),
//                ["insert_thread_group_catch_all"] = E.Create(new ProductionDescription(@",( '<<tg_id>>', '<<tg_name>>', '0d', '<<tg_schema_name>>.<<tg_table_name_catch_all>>', null)", null)),

//                ["tg_id"] = E.Create(new ProductionDescription("<<g|context://g?id>>", null)),
//                ["tg_replaced_id"] = E.Create(new ProductionDescription("<<g|context://g?id.replace('-', '')>>", null)),
//                ["tg_name"] = E.Create(new ProductionDescription("<<g|context://g?name>>", null)),
//                ["tg_period"] = E.Create(new ProductionDescription("<<g|context://period?period>>", null)),
//                ["tg_next_period"] = E.Create(new ProductionDescription("<<g|context://nextperiod?period>>", null)),
//                ["tg_prefix"] = E.Create(new ProductionDescription(@"<<??|context://g?thread_group_id.thread_group_type[?(@==""singleton"")]->'singleton_'>>", null)),
//                ["tg_schema_name"] = E.Create(new ProductionDescription("<<tg_prefix>>rollup_groups", null)),
//                ["tg_table_name_base"] = E.Create(new ProductionDescription("<<tg_name>>_<<tg_replaced_id>>", null)),
//                ["tg_table_name"] = E.Create(new ProductionDescription("<<tg_table_name_base>>_<<tg_period>>", "<<tg_id>>_tables|tg_<<tg_period>>")),
//                ["tg_table_name_catch_all"] = E.Create(new ProductionDescription("<<tg_table_name_base>>_catch_all", "<<tg_id>>_tables|tg_catch_all")),
//                ["tg_next_table_name"] = E.Create(new ProductionDescription("<<tg_table_name_base>>_<<tg_next_period>>", null)),

//                ["period"] = E.Create(new ProductionDescription("context://g?rollup_group_periods[0:]", null)),
//                ["nextperiod"] = E.Create(new ProductionDescription(@"{ ""period"": ""catch_all"" }|context://g?rollup_group_periods[1:]", null)),
//                ["tg_tables"] = E.Create(new ProductionDescription("context://sym?<<tg_id>>_tables.*", "")),

//                ["create_tg_tables_and_indexes"] = E.Create(new ProductionDescription("<<[]|create_tg_table_and_indexes|(tg_tables)>>", null)),
//                ["tg_multiton_expr"] = E.Create(new ProductionDescription(@"context://g?thread_group_type[?(@!=""singleton"")]", null)),
//                ["tg_multiton_cols"] = E.Create(new ProductionDescription(", rs_id UUID, rs_ts timestamptz ", null)),
//                ["tg_multiton_cols2"] = E.Create(new ProductionDescription(", rs_id ", null)),
//                ["tg_multiton_index"] = E.Create(new ProductionDescription("CREATE INDEX IF NOT EXISTS ix_<<g|context://tg_tables>>_rs ON <<tg_schema_name>>.<<g|context://tg_tables>>(rs_id, rs_ts);", null)),

//                // end: add_thread_group

//                ["process_constants"] = E.Create(new ProductionDescription("'<<g|context://constant?value>>'::<<g|context://constant?data_type>>", "<<g|context://constant?name>>")),

//                ["multiton_cols"] = E.Create(new ProductionDescription(", rs.id rs_id, rs.ts rs_ts ", null)),

//                ["event_elements2"] = E.Create(new ProductionDescription("<<g|context://evt?alias>>:::<<g|context://nvt?alias>>", null)),

//                ["event_elements"] = E.Create(new ProductionDescription("<<event_element>> \"<<g|context://evt?alias>>\"", null)),

//                // add support for {pb} shorthand, likely as <<pb>>
//                ["event_element"] = E.Create(new ProductionDescription("(coalesce(event_payload -> 'body' <<g|context://evt?json_path>>, ''))::<<g|context://evt?data_type>>", "<<g|context://evt?alias>>")),
//                ["derived_elements"] = E.Create(new ProductionDescription("<<derived_element>> \"<<g|context://der?alias>>\"", null)),
//                ["derived_element"] = E.Create(new ProductionDescription("<<g|context://der?col_value>>::<<g|context://der?data_type>>", "<<g|context://der?alias>>")),
//                ["rs_elements"] = E.Create(new ProductionDescription("<<rs_element>> \"<<g|context://rs?alias>>\"", null)),
//                ["rs_element"] = E.Create(new ProductionDescription("rs.<<g|context://rs?alias>>", "<<g|context://rs?alias>>")),

//                ["union"] = E.Create(new ProductionDescription("<<[]|union_select|tbl=context://g?names| UNION >>", null)),
//                ["union_select"] = E.Create(new ProductionDescription("SELECT id, ts FROM warehouse_report_sequence.\"<<tbl://>>\" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>' ", null)),
//                ["long_term_union"] = E.Create(new ProductionDescription("<<[]|long_term_union_select|tbl=context://g?names| UNION >>", null)),
//                ["long_term_union_select"] = E.Create(new ProductionDescription(@"SELECT id, ts FROM warehouse_report_sequence.""<<g|context://tbl?$>>"" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>'
//                                            UNION
//                                            SELECT id, ts FROM warehouse_report_sequence.""<<g|context://tbl?$>>_long_term"" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>",
//                                              null)),

//                //period=(period)
//                // period('period', entity)

//                ["insert_thread_group_records2"] = E.Create(new ProductionDescription(@"
//INSERT INTO edw.thread_group_periods(thread_group_id, thread_group_name, period, table_name, next_table_name)
//VALUES <<[]|insert_thread_group_record|period=context://g?rollup_group_periods[0:];nextperiod/{""period"": ""catch_all""}=context://g?rollup_group_periods[1:]|,>>
//<<insert_thread_group_catch_all>>
//", null)),
//            };
//        }

//        public class Production
//        {
//            public string Match;
//            public bool SuppressOutput;
//            public int MatchOrder;
//            public string PrependString;
//            public string InstructionType;
//            public string InstructionBody;
//        }

//        public class Token
//        {
//            public TokenType TokenType;
//            public string Match;
//            public string Body;
//            public string SharedName;
//            public string ProdName;
//            public string ArgName;
//            public List<Token> Args;
//        }

//        public enum TokenType
//        {
//            NDEF = 0,
//            PROD,
//            JSON,
//            STRG,
//            XML
//        }

//        // This method should be a parser based on a grammar or at least made more efficient
//        public static Token GetToken(string s)
//        {
//            // Currently does not support {, }, [ or ] inside of a json string, or < or > inside of an xml document
//            // token := 'string' | {json} | [json] | `<xml>` | (sharedname=production) | (sharedname=production(n1=token,n2=token)) 

//            while (s[0] == ' ') s = s[1..];

//            var t = new Token();
//            t.SharedName = "";
//            t.ArgName = "";
//            t.Args = new List<Token>();
//            t.Body = "";
//            char m = s[0];
//            char mc;
//            if (m == '(') { t.TokenType = TokenType.PROD; mc = ')'; }
//            else if (m == '{') { t.TokenType = TokenType.JSON; mc = '}'; }
//            else if (m == '[') { t.TokenType = TokenType.JSON; mc = ']'; }
//            else if (m == '`') { t.TokenType = TokenType.XML; mc = '`'; }
//            else if (m == '\'') { t.TokenType = TokenType.STRG; mc = '\''; }
//            else { t.TokenType = TokenType.NDEF; return t; }

//            if (m == '\'')
//            {
//                int i = 1;
//                while (true)
//                {
//                    if (s[i] == m)
//                    {
//                        if ((s.Length > i + 1) && (s[i + 1] == m))
//                        {
//                            t.Body += '\'';
//                            i += 2;
//                        }
//                        else break;
//                    }
//                    else
//                    {
//                        t.Body += s[i++];
//                    }
//                }
//                t.Match = s[0..(i + 1)];
//            }
//            else
//            {
//                int i = 1;
//                int p = 0;
//                while (s[i] != mc || p > 0)
//                {
//                    if (s[i] == m) p++;
//                    else if (s[i] == mc) p--;
//                    t.Body += s[i++];
//                }
//                t.Match = m + t.Body + mc;
//                if (m != '(') t.Body = m + t.Body + mc;
//            }

//            if (t.TokenType == TokenType.PROD)
//            {
//                var prod = t.Body;
//                string np = new(prod.TakeWhile(x => x != '=' && x != '(').ToArray());
//                if (np.Length != prod.Length)  // otherwise its just (prodname)
//                {
//                    int npLength = np.Length;
//                    np = np.Trim();
//                    string args = "";
//                    bool done = false;
//                    if (prod[npLength] == '=')
//                    {
//                        t.SharedName = np;
//                        t.ProdName = new(prod[(npLength + 1)..].TakeWhile(x => x != '(').ToArray());
//                        int prodNameLength = t.ProdName.Length;
//                        t.ProdName = t.ProdName.Trim();
//                        if ((prodNameLength + 1 + npLength) == prod.Length) done = true;
//                        else args = prod[(prodNameLength + 1 + npLength + 1)..];
//                    }
//                    else
//                    {
//                        t.ProdName = np;
//                        args = prod[(npLength + 1)..];
//                    }

//                    if (!done)
//                    {
//                        List<Token> argsTokens = new();
//                        while (args[0] != ')')
//                        {
//                            while (args[0] == ',' || args[0] == ' ') args = args[1..];
//                            string argName = new(args.TakeWhile(x => x != '=').ToArray());
//                            int argNameLength = argName.Length;
//                            argName = argName.Trim();
//                            Token innerToken = GetToken(args[(argNameLength + 1)..]);
//                            innerToken.ArgName = argName;
//                            argsTokens.Add(innerToken);
//                            args = args[(argNameLength + innerToken.Match.Length + 1)..];
//                        }
//                        t.Args = argsTokens;
//                    }
//                }
//            }

//            t.Body = t.Body.Trim();
//            return t;
//        }

//        public static IEnumerable<Production> GetInstructions(string productionBody)
//        {
//            List<Production> parsedMatches = new();
//            int matchOrder = -1;
//            foreach (Match m in Regex.Matches(productionBody, @"<<.*?>>"))
//            {
//                var p = new Production
//                {
//                    Match = m.Value
//                };
//                string match = m.Value[2..^2];

//                p.SuppressOutput = (match[0] == '!');
//                if (p.SuppressOutput) match = match[1..];

//                string ord = new(match.TakeWhile(char.IsDigit).ToArray());
//                if (!string.IsNullOrEmpty(ord)) p.MatchOrder = int.Parse(ord);
//                else p.MatchOrder = matchOrder--;
//                match = match[ord.Length..];

//                p.PrependString = (match[0] == '{') ? new string(match[1..].TakeWhile(x => x != '}').ToArray()) : "";
//                match = (p.PrependString.Length > 0) ? match[(p.PrependString.Length + 2)..] : match;

//                if (!match.Contains("|"))
//                {
//                    if (productions.ContainsKey(match.Trim()))
//                    {
//                        p.InstructionType = "__production";
//                        p.InstructionBody = match.Trim();
//                    }
//                }
//                else
//                {
//                    p.InstructionType = new string(match.TakeWhile(x => x != '|').ToArray());
//                    p.InstructionBody = match[(p.InstructionType.Length + 1)..];
//                }
//                parsedMatches.Add(p);
//            }

//            if (parsedMatches.Any())
//            {
//                int maxOrder = parsedMatches.Max(p => p.MatchOrder);
//                return parsedMatches.OrderBy(p => (p.MatchOrder < 0) ? -p.MatchOrder + maxOrder : p.MatchOrder);
//            }
//            else
//            {
//                return parsedMatches;
//            }
//        }

//        public static async Task<Entity> CallProduction(string productionName) => await CallProduction(await productions[productionName].EvalS("Body"), await productions[productionName].EvalS("Symbol"));

//        public static async Task<Entity> CallProduction(string body, string symbol)
//        {
//            foreach (var sp in GetInstructions(body))
//            {
//                string res = (await instructions[sp.InstructionType](sp)).Value<string>();
//                res = (!string.IsNullOrWhiteSpace(res)) ? sp.PrependString + res : "";
//                body = body.Replace(sp.Match, sp.SuppressOutput ? "" : res);
//            }

//            if (!string.IsNullOrWhiteSpace(symbol))
//            {
//                string coll = "";
//                string sym;
//                var collAndSym = symbol.Split("|");

//                if (collAndSym.Length == 2)
//                {
//                    coll = collAndSym[0];
//                    sym = collAndSym[1];

//                    foreach (var sp in GetInstructions(coll))
//                    {
//                        string res = (await instructions[sp.InstructionType](sp)).Value<string>();
//                        res = (!string.IsNullOrWhiteSpace(res)) ? sp.PrependString + res : "";
//                        coll = coll.Replace(sp.Match, sp.SuppressOutput ? "" : res);
//                    }
//                }
//                else
//                {
//                    sym = collAndSym[0];
//                }

//                foreach (var sp in GetInstructions(sym))
//                {
//                    string res = (await instructions[sp.InstructionType](sp)).Value<string>();
//                    res = (!string.IsNullOrWhiteSpace(res)) ? sp.PrependString + res : "";
//                    sym = sym.Replace(sp.Match, sp.SuppressOutput ? "" : res);
//                }

//                if (!string.IsNullOrWhiteSpace(coll))
//                {
//                    if (!symbolTable.ContainsKey(coll)) symbolTable[coll] = new Dictionary<string, string>();
//                    ((Dictionary<string, string>)symbolTable[coll])[sym] = body;
//                }
//                else
//                {
//                    symbolTable[sym] = body;
//                }
//            }

//            return E.Create(body);
//        }

//        // Instructions should always return a string, but instructions themselves should always be enumerable (maintain state across calls)
//        // The problem with GetterInstruction is that it returns something to be enumerated instead of allowing itself to be enumerated.

//        public static async Task<Entity> RepetitionInstruction(Production p)
//        {
//            // <<{instruction_header}|{token-to-be-repeated}|*var-name={token-var-val};...;*5var-name={token-var-val};@var-name={token-var-val}|{token-separator-string}>>
//            // * makes the enumerable child dominant - it will be run to completion
//            // n makes the enumerable child run only that number of times
//            // *n makes the enumerable run only that number of times but also be dominant
//            // if there are multiple dominant children, the enumeration will run until the longest child is completed
//            // a literal token will only produce a value one time
//            // a production that evaluates to a literal token will produce a value each time it is called
//            // whether an enumerable child restarts, produces a default, or produces empty values on iterations past it's end is up to the child
//            // EnumerateProductionDictionary(prodnames, dominance, repetition-count)

//            string[] parts = p.InstructionBody.Split('|');
//            var productionName = GetToken(parts[0]).Body;

//            var scopeCollection = new Dictionary<string, (string scopeName, Entity scope, Entity def, bool dominant, int repeatCount, bool restart)>();
//            string[] scopes = parts[1].Split(';');
//            foreach (var scope in scopes)
//            {
//                string scopeName = new(scope.TakeWhile(x => x != '=' && x != ';').ToArray());
//                int scopeNameLength = scopeName.Length;
//                bool dominant = false;
//                if (scopeName[0] == '*')
//                {
//                    dominant = true;
//                    scopeName = scopeName[1..];
//                }
//                bool restart = false;
//                if (scopeName[0] == '*')
//                {
//                    restart = true;
//                    scopeName = scopeName[1..];
//                }
//                string sRepeatCount = "";
//                while (scopeName[0] >= '1' && scopeName[0] <= '9')
//                {
//                    sRepeatCount += scopeName[0];
//                    scopeName = scopeName[1..];
//                }
//                int repeatCount = 0;
//                if (sRepeatCount.Length > 0) repeatCount = Int32.Parse(sRepeatCount);

//                if (scope.Length == scopeNameLength || scope[scopeNameLength] == ';')
//                {
//                    // reuse already named evaluatable
//                    scopeCollection[scopeName] = (scopeName, null, null, dominant, repeatCount, restart);
//                }
//                else
//                {
//                    var scopeDefinition = GetToken(scope[(scopeNameLength..)]);
//                    var scopeInjection = await EvaluateToken(scopeDefinition);
//                    var scopeEnumerable = await scopeInjection.EvalE("value");
//                    var scopeDefault = await scopeInjection.EvalE("def");
//                    scopeCollection[scopeName] = (scopeName, scopeEnumerable, scopeDefault, dominant, repeatCount, restart);
//                }
//            }

//            Token joinToken = parts.Length > 2 ? GetToken(parts[2]) : new Token();
//            string joinString = (joinToken.TokenType == TokenType.PROD)
//                ? (await CallProduction(joinToken.Body)).Value<string>()
//                : joinToken.Body;

//            List<Entity> rets = new();
//            // EnumerateParallel(Dictionary<string, Instruction>) --> Dictionary<string, string>
//            //await foreach (var scp in EnumerateParallel(scopeCollection))
//            //{
//            //    foreach (var kvp in scp)
//            //    {
//            //        if (kvp.Value.TryGetValue<Token>(out var t))
//            //        {
//            //            context[kvp.Key] = await EvaluateToken(t);
//            //        }
//            //        else
//            //        {
//            //            context[kvp.Key] = kvp.Value;
//            //        }
//            //    }
//            //    var ret = await CallProduction(productionName);
//            //    rets.Add(ret);
//            //    foreach (var kvp in scp) context.Remove(kvp.Key);
//            //}

//            return E.Create(string.Join(joinString, rets.Select(x => x.Value<string>())));
//        }

//        public static async Task<Entity> EvaluateToken(Token t)
//        {
//            if (t.TokenType == TokenType.STRG)
//            {
//                return E.Create(t.Body);
//            }
//            else if (t.TokenType == TokenType.JSON)
//            {

//                return await E.Parse("application/json", t.Body);
//            }
//            else if (t.TokenType == TokenType.PROD)
//            {
//                return E.Create(await CallProduction(t.Body));
//            }
//            else
//            {
//                return Entity.Undefined;
//            }
//        }

//        public static async Task<Entity> ConditionInstruction(Production p)
//        {
//            //<<{instruction_header}|{token-conditional-production}->{token-return};...;{token-else}>>
//            string curStr = p.InstructionBody;
//            while (curStr.Length != 0)
//            {
//                bool inElse;
//                Token t = GetToken(curStr);
//                curStr = curStr[t.Match.Length..];
//                if (curStr[0] == '-')
//                {
//                    inElse = false;
//                    curStr = curStr[2..];
//                }
//                else
//                {
//                    inElse = true;
//                }

//                if (inElse)
//                {
//                    return await EvaluateToken(t);
//                }
//                else
//                {
//                    //Token t2 = GetToken(curStr);
//                    //if ((await EvaluateToken(t)).Any())
//                    //{
//                    //    return await EvaluateToken(t2));
//                    //}
//                    //curStr = curStr[t2.Match.Length..];
//                }

//                if (curStr[0] == ';')
//                {
//                    curStr = curStr[1..];
//                }
//            }

//            return "";
//        }

//        public static async Task<Entity> GetterInstruction(Production p)
//        {
//            // <<{instruction_header}|{path}|{token-default}>>
//            string[] parts = p.InstructionBody.Split("|");

//            Entity value;
//            string nsn = parts[0].Split("://")[0];
//            string nsp = parts[0].Split("://")[1];
//            if (nsn.Equals("context"))
//            {
//                string s = await E.EvalS(parts[0], "");
//                if (string.IsNullOrEmpty(s)) value = Entity.Undefined;
//                else value = await CallProduction(s, null);
//            }
//            else
//            {
//                string s = await GetScope(nsn).EvalS(nsp, "");
//                if (string.IsNullOrEmpty(s)) value = Entity.Undefined;
//                else value = await CallProduction(s, null);
//            }

//            Token defaultValue = null;
//            if (parts.Length > 1)
//            {
//                defaultValue = GetToken(parts[1]);
//            }

//            if (value.ValueType == EntityValueType.Undefined || value.ValueType == EntityValueType.Null)
//            {
//                return E.Create(defaultValue);
//            }
//            else
//            {
//                return value;
//            }
//        }

//        //public static async Task<Entity> VariableInstruction(Production p)
//        //{

//        //}

//        public static async Task<Entity> ProductionInstruction(Production p) => await CallProduction(p.InstructionBody);

//        private static async Task<IEnumerable<Entity>> GetEntity(FrameworkWrapper fw, Entity root, string entityId)
//        {
//            var id = Guid.Parse(entityId);
//            var entity = await fw.Entities.GetEntity(id);
//            entity.Set("/Config/$id", id);
//            entity.Set("/Config/$name", entity.EvalS("/Name"));
//            return new[] { await root.Parse("application/json", entity.EvalS("/Config")) };
//        }

//        private static async Task<IEnumerable<Entity>> GetEntityType(Entity root, string entityType)
//        {
//            var entities = await Data.CallFn("config", "SelectConfigsByType", new { type = entityType });

//            var convertedEntities = new List<Entity>();
//            foreach (var entity in entities.EvalL("result"))
//            {
//                entity.Set("/Config/$id", entity.EvalS("/Id"));
//                entity.Set("/Config/$name", entity.EvalS("/Name"));
//                var convertedEntity = await root.Parse("application/json", entity.EvalS("@"));
//                convertedEntities.Add(convertedEntity);
//            }
//            return convertedEntities;
//        }

//        public static async Task<Dictionary<string, string>> GenerateSql()  // Guid g
//        {

//            Dictionary<string, string> d = new();

//            var fw = new FrameworkWrapper();

//            static string UnescapeQueryString(Uri uri) => Uri.UnescapeDataString(uri.Query.TrimStart('?'));

//            static async IAsyncEnumerable<Entity> functionHandler(IEnumerable<Entity> entities, string functionName, IReadOnlyList<Entity> functionArguments, string query)
//            {
//                foreach (var entity in entities)
//                {
//                    switch (functionName)
//                    {
//                        case "replace":
//                            if (entity.ValueType == EntityValueType.Array)
//                            {
//                                var index = 0;
//                                foreach (var child in await entity.Get("@.*"))
//                                {
//                                    yield return entity.Create(child.Value<string>().Replace(functionArguments[0].Value<string>(), functionArguments[1].Value<string>()), $"{entity.Query}[{index}].{query}");
//                                    index++;
//                                }
//                            }
//                            else
//                            {
//                                yield return entity.Create(entity.Value<string>().Replace(functionArguments[0].Value<string>(), functionArguments[1].Value<string>()), $"{entity.Query}.{query}");
//                            }
//                            break;
//                        case "repeat":
//                            for (var i = 0; i < functionArguments[0].Value<int>(); i++)
//                            {
//                                yield return entity.Clone($"{entity.Query}.{query}[{i}]");
//                            }
//                            break;
//                        case "suppress":
//                            if (!functionArguments[0].Value<bool>())
//                            {
//                                yield return entity;
//                            }
//                            break;
//                        default:
//                            throw new InvalidOperationException($"Unknown function {functionName}");
//                    }
//                }
//            }

//            E = Entity.Initialize(new EntityConfig(
//                Parser: (entity, contentType, content) => contentType switch
//                {
//                    "application/json" => EntityDocumentJson.Parse(content),
//                    _ => throw new InvalidOperationException($"Unknown contentType: {contentType}")
//                },
//                Retriever: async (entity, uri) => uri.Scheme switch
//                {
//                    "entity" => (await GetEntity(fw, entity, uri.Host), UnescapeQueryString(uri)),
//                    "entityType" => (await GetEntityType(entity, uri.Host), UnescapeQueryString(uri)),
//                    "context" => (new[] { await ContextEntity.EvalE(uri.Host) }, UnescapeQueryString(uri)),
//                    _ => throw new InvalidOperationException($"Unknown scheme: {uri.Scheme}")
//                },
//                MissingPropertyHandler: null,
//                FunctionHandler: functionHandler)
//            );

//            CreateProductions();

//            context = new Dictionary<string, Entity>
//            {
//                ["sym"] = E.Create(symbolTable),
//                ["productions"] = E.Create(productions),
//            };

//            ContextEntity = E.Create(context);

//            List<string> t = new List<string>();
//            //t.Add("'abc'def");
//            //t.Add("'abc'");
//            //t.Add("'ab''c'");
//            //t.Add("'a''b''c'");
//            //t.Add("'a''''b''c'");
//            //t.Add("'a''''b''c'def");
//            //t.Add("{}def");
//            //t.Add("{{}}def");
//            //t.Add("{{{}}}def");
//            //t.Add("{bob:tom}def");
//            //t.Add("{bob:tom, {tim:bill}}def");
//            //t.Add("[]def");
//            //t.Add("[[]]def");
//            //t.Add("[[[]]]def");
//            //t.Add("[bob:tom]def");
//            //t.Add("[bob:tom, [tim:bill]]def");
//            //t.Add("(prod)def");
//            //t.Add("(prod(a,b))def");
//            t.Add("(prod(a='bob',b={bob:tom}))def");
//            t.Add("(sname=prod(a='bob',b={bob:tom}))def");
//            t.Add("(sname=prod(a=(sname2=prod2),b={bob:tom}))def");
//            t.Add("(sname=prod(a=(sname2=prod2()),b={bob:tom}))def");
//            t.Add("(sname=prod(a=(sname2=prod2()),b=(prod3(a='blah',b='ma'))))def");
//            foreach (var ti in t)
//            {
//                var tk = GetToken(ti);
//            }

//            // add_thread_group
//            Entity e1 = await E.EvalE("config://e97f0bac-2640-448c-b6f2-2a9a5510cc76");
//            context["g"] = e1;
//            string sql1 = (await CallProduction("insert_thread_group_records")).Value<string>();
//            string sql2 = (await CallProduction("create_tg_tables_and_indexes")).Value<string>();

//            // end add_thread_group

//            string s = await E.EvalS("config://5f78294e-44b8-4ab9-a893-4041060ae0ea?RsConfigId");

//            Entity e = await E.EvalE("config://3aeeb2b6-c556-4854-a679-46ea73a6f1c7"); // 8d0a6ac0-d351-4ab7-b9db-020a37ca14ee");

//            context["g"] = e;  // "g", Entity(g)
//            // context://g?path    g.Get(path).Value<bool>()

//            //string initial_production = "long_term_union"; //rlp.EvalS("initial_production");
//            //string sql = await CallProduction(initial_production);

//            symbolTable.Add("config_name", "Path Session");

//            //Production p = new Production();
//            //p.InstructionBody = @"context://g?thread_group_id.thread_group_type[?(@!=""multiton"")]->'multiton_cols';context://g?thread_group_id.thread_group_type[?(@!=""multiton"")]->multiton_cols;bob";
//            //await ConditionInstruction(p);

//            foreach (Entity rlp in await e.Get("rollups.*"))
//            {
//                context["rollup"] = rlp;
//                string name = await rlp.EvalS("name");
//                //string grammar = rlp.EvalS("grammar");
//                string initial_production = "rlp_std_group_by"; //rlp.EvalS("initial_production");
//                string sql = (await CallProduction(initial_production)).Value<string>();
//                context.Remove("rollup");
//                d[name] = sql;
//            }

//            Console.WriteLine(string.Join(Environment.NewLine, d.Select(kvp => $"Rollup: {kvp.Key}{Environment.NewLine}Sql: {kvp.Value}{Environment.NewLine}")));
//            return d;
//        }

//        //public static IEnumerable<(T, T)> Pairwise<T>(this IEnumerable<T> source)
//        //{
//        //    var previous = default(T);
//        //    using (var it = source.GetEnumerator())
//        //    {
//        //        if (it.MoveNext())
//        //            previous = it.Current;

//        //        while (it.MoveNext())
//        //            yield return (previous, previous = it.Current);
//        //    }
//        //}

//        public static IEnumerable<Dictionary<string, Entity>> EnumerateParallel(Dictionary<string, IEnumerable<Entity>> es)
//        {
//            var ies = new Dictionary<string, IEnumerator<Entity>>();
//            try
//            {
//                foreach (var (k, v) in es)
//                {
//                    ies[k] = v.GetEnumerator();
//                }

//                bool done;
//                do
//                {
//                    done = true;
//                    var result = new Dictionary<string, Entity>();
//                    foreach (var (k, v) in ies)
//                    {
//                        if (v.MoveNext())
//                        {
//                            result[k] = v.Current;
//                            done = false;
//                        }
//                        else
//                        {
//                            result[k] = null;
//                        }
//                    }
//                    if (!done) yield return result;
//                } while (!done);
//            }
//            finally
//            {
//                foreach (var (_, v) in ies)
//                {
//                    v.Dispose();
//                }
//            }
//        }

//        public static async IAsyncEnumerable<Dictionary<string, Entity>> EnumerateParallel(Dictionary<string, Entity> values, Dictionary<string, Entity> defs)
//        {
//            var ies = new Dictionary<string, (IEnumerator<Entity> values, Entity def)>();
//            try
//            {
//                foreach (var (k, v) in values)
//                {
//                    if (v.ValueType == EntityValueType.Array)
//                        ies[k] = ((await v.Get()).GetEnumerator(), defs[k]);
//                    else
//                        ies[k] = (v == Entity.Undefined) ? (null, defs[k]) : (null, v);
//                }

//                bool done;
//                do
//                {
//                    done = true;
//                    var result = new Dictionary<string, Entity>();
//                    foreach (var (k, v) in ies)
//                    {
//                        if (v.values != null && v.values.MoveNext())
//                        {
//                            result[k] = v.values.Current;
//                            done = false;
//                        }
//                        else
//                        {
//                            result[k] = v.def;
//                        }
//                    }
//                    if (!done) yield return result;
//                } while (!done);
//            }
//            finally
//            {
//                foreach (var (_, v) in ies)
//                {
//                    v.values.Dispose();
//                }
//            }
//        }

//    }
//}
