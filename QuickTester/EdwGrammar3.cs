﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Utility;
using Utility.Entity;
using Utility.Evaluatable;
using Utility.Evaluatable.MemoryProviders;

namespace QuickTester
{
    public static class EdwGrammar3
    {
        public class Production : IEvaluatable
        {
            public IEnumerable<Entity> Body { get; } // each Entity is expected to evaluate to a string
            public IEnumerable<Entity> Symbol { get; }

            private readonly Action<string, string> _symbolSetter;

            public Production(IEnumerable<Entity> entities, Action<string, string> symbolSetter = null, IEnumerable<Entity> symbol = null)
            {
                Body = entities;
                Symbol = symbol;
                _symbolSetter = symbolSetter;
            }

            public async Task<EvaluateResponse> Evaluate(EvaluateRequest request)
            {
                // TODO: Seperate evaluation order from concat order
                var sb = new StringBuilder();
                foreach (var child in Body)
                {
                    var suppress = false;
                    string prepend = null;

                    var childBody = await child.EvalAsS("Instruction", null);
                    if (childBody == null)
                    {
                        childBody = await child.EvalAsS("@");
                    }
                    else
                    {
                        suppress = await child.EvalB("Suppress", false);
                        prepend = await child.EvalS("Prepend", defaultValue: null);
                    }

                    if (!suppress)
                    {
                        if (!string.IsNullOrEmpty(prepend) && !string.IsNullOrEmpty(childBody))
                        {
                            _ = sb.Append(prepend);
                        }

                        _ = sb.Append(childBody);
                    }
                }

                var body = sb.ToString();

                if (Symbol != null && Symbol.Any())
                {
                    sb = new StringBuilder();
                    foreach (var child in Symbol)
                    {
                        _ = sb.Append(await child.EvalAsS("@"));
                    }

                    var symbol = sb.ToString();

                    if (_symbolSetter != null && Symbol != null)
                    {
                        _symbolSetter(symbol, body);
                    }
                }

                return new EvaluateResponse(
                    Entity: body,
                    Complete: true
                );
            }

            public override string ToString() => string.Join("", Body);
        }

        public class GetterInstruction : IEvaluatable
        {
            public string Query { get; }
            public Entity DefaultValue { get; }
            public bool TreatAsPredicate { get; }
            public string Prefix { get; }
            public string Suffix { get; }

            public GetterInstruction(string query, Entity defaultValue = null, bool treatAsPredicate = false, string prefix = null, string suffix = null)
            {
                Query = query;
                DefaultValue = defaultValue;
                TreatAsPredicate = treatAsPredicate;
                Prefix = prefix;
                Suffix = suffix;
            }

            private IList<Entity> _result;
            private int _index = 0;

            public async Task<EvaluateResponse> Evaluate(EvaluateRequest request)
            {
                if (_index == 0)
                {
                    _result = await request.Entity.Eval(Query).ToList();
                }

                if (TreatAsPredicate)
                {
                    var res = _result.Any();
                    return new EvaluateResponse(
                        Entity: res,
                        Complete: true
                    );
                }
                else
                {
                    if (_index == 0 && _result.Count == 0)
                    {
                        return new EvaluateResponse(
                            Entity: DefaultValue,
                            Complete: true
                        );
                    }
                    else
                    {
                        var current = _result[_index++];
                        var complete = _index == _result.Count;
                        if (complete)
                        {
                            _index = 0; // Reset for now until we add post-completion behavior
                        }

                        if (current.ValueType == EntityValueType.String)
                        {
                            return new EvaluateResponse(
                                Entity: Prefix + (await current.EvalAsS("@")) + Suffix,
                                Complete: complete
                        );
                        }
                        else
                        {
                            return new EvaluateResponse(
                                Entity: current,
                                Complete: complete
                            );
                        }
                    }
                }
            }

            public override string ToString() => $"<<g|{Query}>>";
        }

        public class ConditionInstruction : IEvaluatable
        {
            public List<(Entity Antecedent, Entity Consequent)> Cases = new();

            public ConditionInstruction(List<(Entity Antecedent, Entity Consequent)> cases) => Cases = cases;

            public async Task<EvaluateResponse> Evaluate(EvaluateRequest request)
            {
                foreach (var c in Cases)
                {
                    if ((c.Antecedent != null) && (await c.Antecedent.EvalB("@")))
                    {
                        return new EvaluateResponse(
                            Entity: c.Consequent,
                            Complete: true
                        );
                    }
                    else if (c.Antecedent == null)
                    {
                        if (c.Consequent != null)
                        {
                            return new EvaluateResponse(
                                Entity: c.Consequent,
                                Complete: true
                            );
                        }
                    }
                }

                return new EvaluateResponse(
                    Complete: true,
                    Entity: Entity.Undefined
                );
            }

            public override string ToString() => $"<<iif|{string.Join('|', Cases.Select(c => $"{c.Antecedent}=>{c.Consequent}"))}>>";
        }

        // <<s|abc|config://5>>
        // <<{instruction_header}|{token-to-be-repeated}|*var-name={token-var-val};...;*5var-name={token-var-val};@var-name={token-var-val};@var-name=(g|context://sym?sharedSymbolName|myDefault)|{token-separator-string}>>
        public enum ExhaustionBehavior
        {
            Restart,
            DefaultValue
        }

        public record ParallelGetInstructionScope(Entity Scope, bool Dominant, int RepeatCount, ExhaustionBehavior ExhaustionBehavior, Entity DefaultValue = null);

        public class ParallelGetInstruction : IEvaluatable
        {
            public Dictionary<string, ParallelGetInstructionScope> Scopes { get; }

            public ParallelGetInstruction(Dictionary<string, ParallelGetInstructionScope> scopes) => Scopes = scopes;

            private readonly Dictionary<string, IEnumerator<Entity>> _ies = new();
            private List<string> _dominants;
            private bool _initialized = false;
            private int _repeatCount = 0;
            private readonly HashSet<string> _finished = new();

            public async Task<EvaluateResponse> Evaluate(EvaluateRequest request)
            {
                if (!_initialized)
                {
                    _dominants = Scopes.Where(scope => scope.Value.Dominant).Select(scope => scope.Key).ToList();
                    if (!_dominants.Any())
                    {
                        _dominants = Scopes.Keys.ToList();
                    }

                    foreach (var (k, v) in Scopes)
                    {
                        _ies[k] = await v.Scope.Eval("@").GetEnumerator();
                    }

                    _initialized = true;
                }

                var result = new Dictionary<string, Entity>();

                var anyProduced = false;
                foreach (var (k, v) in _ies)
                {
                    var scopeConfig = Scopes[k];

                    var repeatCountMet = scopeConfig.RepeatCount > 0 && _repeatCount >= scopeConfig.RepeatCount;

                    if (!repeatCountMet && v.MoveNext())
                    {
                        if (_dominants.Contains(k) && !_finished.Contains(k))
                        {
                            anyProduced = true;
                        }

                        result[k] = v.Current;
                        if (scopeConfig.RepeatCount > 0 && _repeatCount == scopeConfig.RepeatCount)
                        {
                            _ = _finished.Add(k);
                        }
                    }
                    else
                    {
                        _ = _finished.Add(k);

                        if (!repeatCountMet)
                        {
                            if (scopeConfig.ExhaustionBehavior == ExhaustionBehavior.Restart)
                            {
                                v.Reset();
                                if (v.MoveNext())
                                {
                                    result[k] = v.Current;
                                }
                            }
                            else
                            {
                                result[k] = scopeConfig.ExhaustionBehavior == ExhaustionBehavior.DefaultValue ? scopeConfig.DefaultValue : null;
                            }
                        }
                        else
                        {
                            result[k] = null;
                        }
                    }
                }

                var complete = _finished.Intersect(_dominants).Count() == _dominants.Count;
                _repeatCount++;

                if (anyProduced)
                {
                    return new EvaluateResponse(
                        Entity: request.Entity.Create(result),
                        Complete: complete
                    );
                }
                else
                {
                    return new EvaluateResponse(
                        Complete: true,
                        Entity: Entity.Undefined
                    );
                }
            }

            public override string ToString() => string.Join("|", Scopes.Select(s => s.Value.Scope));
        }

        public class RepetitionInstruction : IEvaluatable
        {
            public Entity Template { get; }
            public Entity Separator { get; }
            public Entity Repeater { get; }

            public Action<string, Entity> _contextSetter;
            public Action<string> _contextRemover;

            public RepetitionInstruction(Entity template, Entity separator, Entity repeater, Action<string, Entity> contextSetter, Action<string> contextRemover)
            {
                Template = template;
                Separator = separator;
                Repeater = repeater;
                _contextSetter = contextSetter;
                _contextRemover = contextRemover;
            }

            public async Task<EvaluateResponse> Evaluate(EvaluateRequest request)
            {
                var parts = new List<string>();

                await foreach (var step in Repeater.Eval("@"))
                {
                    var scope = await step.EvalD("@");

                    foreach (var kvp in scope)
                    {
                        _contextSetter(kvp.Key, kvp.Value);
                    }

                    var stepContent = await Template.EvalAsS("@");

                    foreach (var kvp in scope)
                    {
                        _contextRemover(kvp.Key);
                    }

                    parts.Add(stepContent);
                }

                return new EvaluateResponse(
                    Entity: string.Join(await Separator.EvalAsS("@"), parts),
                    Complete: true
                );
            }

            public override string ToString() => $"<<r|{Template}|{Separator}|{Repeater}";
        }

        public static async Task Run()
        {
            Entity contextEntity = null;

            static async IAsyncEnumerable<Entity> ReplaceTemplates(Entity entity, Entity parameters)
            {
                if (entity.ValueType == EntityValueType.String)
                {
                    var value = entity.Value<string>();

                    var (hadTokens, tokenReplacedValue) = await ReplaceTokens(entity, value);

                    if (hadTokens)
                    {
                        yield return entity.Create(tokenReplacedValue, entity.Query);
                    }
                }
            }

            var fw = await FrameworkWrapper.Create(
                entityConfig: new EntityConfig(
                    Retriever: async (entity, uri) => uri.Scheme switch
                    {
                        "context" => (new[] { await contextEntity.EvalE(uri.Host) }, UnescapeQueryString(uri)),
                        _ => throw new InvalidOperationException($"Unknown scheme: {uri.Scheme}")
                    },
                    FunctionHandler: FunctionHandler
                ),
                evaluatorConfig: new EvaluatorConfig(
                    memoryProvider: new InMemoryJsonSerializedMemoryProvider(),
                    entityMutator: ReplaceTemplates
                )
            );

            var E = fw.Entity;

            var test = @"
{
   ""joins"":[
      {
                ""alias"":""bob"",
         ""table_name"":""blob"",
         ""join_type"":""LEFT"",
         ""on"":""$on_cols1 = $bob.col AND $on_cols2=$tgt.col2"",
         ""where"":""$tgt.col IS NOT NULL""
      },
      {
                ""alias"":""tom"",
         ""table_name"":""thom"",
         ""join_type"":""LEFT"",
         ""on"":""$on_cols1 = $bob.col AND $on_cols2=$tgt.col2"",
         ""where"":""$tgt.col IS NOT NULL"",
         ""joins"":[
            {
                    ""alias"":""rich"",
               ""table_name"":""richard"",
               ""join_type"":""LEFT"",
               ""on"":""$on_cols1 = $bob.col AND $on_cols2=$tgt.col2"",
               ""where"":""$tgt.col IS NOT NULL""
            }
         ]
      }
   ]
}
";

            var symbolTable = new Dictionary<string, Entity>()
            {
                ["firstName"] = "John",
                ["condition1"] = true,
                ["condition2"] = false,
                ["1to5"] = E.Create(new[] { 1, 2, 3, 4, 5 }),
                ["1to3"] = E.Create(new[] { 1, 2, 3 }),
                ["rsid"] = "123456789",
                ["tg_table_names"] = E.Create(new[] { "bob", "tom", "rich" }),
                ["target_table_insert_sql_meta_rs_name"] = "PathDmSn",
                ["report_sequence_checked_transform_meta_rs_name"] = "PathDmSn",
                ["test_joins"] = await E.Parse("application/json", test),
                ["test_joins_start_table"] = "ws"
            };

            var productions = new Dictionary<string, Entity>();

            var context = new Dictionary<string, Entity>
            {
                ["sym"] = E.Create(symbolTable),
                ["productions"] = E.Create(productions),
            };

            contextEntity = fw.Entity.Create(context);

            var subProduction = new Production(new[]
            {
                E.Create(new { Instruction = "I am repeating: a: ", Suppress = false, Prepend = "" }),
                E.Create(new GetterInstruction("context://a", "***NOT FOUND A***")),
                " b: ",
                E.Create(new GetterInstruction("context://b", "***NOT FOUND B***")),
                " c: ",
                E.Create(new GetterInstruction("context://c", "***NOT FOUND C***")),
            });

            var production = new Production(new[]
            {
                "Hello there ",
                E.Create(new GetterInstruction("context://sym?firstName", "***NO NAME***")),
                "! How are you?\r\n",
                E.Create(new ConditionInstruction(new List<(Entity Antecedent, Entity Consequent)> {
                    (E.Create(new GetterInstruction("context://sym?condition1[?(@==true)]", null, true)), "Condition1 is true!!!"),
                    (null, "Condition1 is *NOT* true!!!")
                })),
                //<<??|context://g?thread_group_id[?(@.thread_group_type!=""singleton"")]->multiton_cols>>
                //context://sym?condition2[?(@==true)]
                "\r\n",
                E.Create(new ConditionInstruction(new List<(Entity Antecedent, Entity Consequent)> {
                    (E.Create(new GetterInstruction("context://sym?condition2[?(@==true)]", null, true)), "Condition2 is true!!!"),
                    (null, "Condition2 is *NOT* true!!!")
                })),
                "\r\n",
                E.Create(new RepetitionInstruction(E.Create(subProduction), "\r\n", E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                    ["a"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("context://sym?1to5.*")), true, 0, ExhaustionBehavior.DefaultValue),
                    ["b"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("context://sym?1to3.*")), false, 0, ExhaustionBehavior.Restart),//ExhaustionBehavior.DefaultValue, "Default Value for b!")
                    ["c"] = new ParallelGetInstructionScope("Hello", false, 3, ExhaustionBehavior.DefaultValue, "Goodbye"),
                })), (key, value) => context[key] = value, (key) => context.Remove(key))),
            }, (key, value) => symbolTable[key] = value, new Entity[] { "production1" });

            /*
             DELETE
        FROM edw.report_sequence_config
        WHERE id = <report_sequence_id>;
             */

            var delete_report_sequence_config = new Production(new[]
            {
                "DELETE FROM edw.report_sequence_config WHERE (id = '",
                E.Create(new GetterInstruction("context://sym?rsid")),
                "'::UUID)"
            }, (key, value) => symbolTable[key] = value, null);

            //                ["union"] = E.Create(new ProductionDescription("<<[]|union_select|tbl=context://g?names| UNION >>", null)),
            //                ["union_select"] = E.Create(new ProductionDescription("SELECT id, ts FROM warehouse_report_sequence.\"<<tbl://>>\" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>' ", null)),
            //                ["long_term_union"] = E.Create(new ProductionDescription("<<[]|long_term_union_select|tbl=context://g?names| UNION >>", null)),
            //                ["long_term_union_select"] = E.Create(new ProductionDescription(@"SELECT id, ts FROM warehouse_report_sequence.""<<g|context://tbl?$>>"" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>'
            //                                            UNION
            //                                            SELECT id, ts FROM warehouse_report_sequence.""<<g|context://tbl?$>>_long_term"" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>",
            //                                              null)),

            var union_select = new Production(new[]
            {
                "SELECT id, ts FROM warehouse_report_sequence.\"",
                E.Create(new GetterInstruction("context://tbl")),
                "\" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>'"
            }, (key, value) => symbolTable[key] = value, null);

            var union_query = new Production(new[]
            {
                E.Create(new RepetitionInstruction(E.Create(union_select), " UNION ",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["tbl"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("context://sym?tg_table_names.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key)))
            }, (key, value) => symbolTable[key] = value, null);

            var lt_union_select = new Production(new[]
            {
                "SELECT id, ts FROM warehouse_report_sequence.\"",
                E.Create(new GetterInstruction("context://tbl")),
                "\" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>' UNION SELECT id, ts FROM warehouse_report_sequence.\"",
                E.Create(new GetterInstruction("context://tbl")),
                "_long_term\" WHERE ts >= now()-'30d'::interval AND ts >= '<min_batch_ts>' AND ts <= '<max_batch_ts>'"
            }, (key, value) => symbolTable[key] = value, null);

            var lt_union_query = new Production(new[]
            {
                E.Create(new RepetitionInstruction(E.Create(lt_union_select), " UNION ",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["tbl"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("context://sym?tg_table_names.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key))),
            }, (key, value) => symbolTable[key] = value, null);

            /*
             INSERT INTO warehouse.report_sequence_duplicates(id, ts)
        SELECT id, ts
        FROM <report_sequence_set> rss
        WHERE EXISTS (SELECT 1 FROM "<target_schema>"."PathDmSn" t WHERE t.id = rss.id);

            INSERT INTO "<target_schema>"."PathDmSn" (id, ts, payload, silo_id, "pathstyle_vertical_type_id", "pathstyle_id",
                                          "subcampaign_entity_id", "campaign_id", "root_campaign_id", "is_repeat_user",
                                          "device_info_id", "gender", "age", "email_domain_id", "location_id",
                                          "registration_type", "recaptcha_score", "validated_jornaya",
                                          "sub_campaign_id", "ip_address", "third_party_id", "browser_name",
                                          "device_platform", "is_mobile", "utm_campaign", "utm_ad_group", "utm_ad",
                                          "utm_keyword", "user_validation_id", "traffic_type_id", expires)
        SELECT id,
        ts,
        payload,
        silo_id,
        (COALESCE((payload -> 'body' ->> 'PathStyleVerticalTypeId'), '0'))::INT,
        (COALESCE((payload -> 'body' ->> 'PathStyleId'), '0'))::INT,
        (COALESCE((payload -> 'body' ->> 'SubCampaignEntityId'), '0'))::INT,
        (COALESCE((payload -> 'body' ->> 'CampaignId'), '0'))::INT,
        (COALESCE((payload -> 'body' ->> 'RootCampaignId'), '0'))::INT,
        (COALESCE((payload -> 'body' ->> 'IsRepeatUser'), ''))::BOOLEAN,
        (COALESCE((payload -> 'body' ->> 'DeviceInfoId'), ''))::INT,
        (COALESCE((payload -> 'body' ->> 'Gender'), ''))::TEXT,
        (COALESCE((payload -> 'body' ->> 'Age'), ''))::INT,
        (COALESCE((payload -> 'body' ->> 'EmailDomainId'), ''))::INT,
        (COALESCE((payload -> 'body' ->> 'LocationId'), ''))::INT,
        (COALESCE((payload -> 'body' ->> 'RegistrationType'), ''))::TEXT,
        (COALESCE((payload -> 'body' ->> 'RecaptchaScore'), ''))::NUMERIC,
        (COALESCE((payload -> 'body' ->> 'ValidatedJornaya'), ''))::TEXT,
        (COALESCE((payload -> 'body' ->> 'SubCampaignId'), '0'))::INT,
        (COALESCE((payload -> 'body' ->> 'IpAddress'), ''))::TEXT,
        (COALESCE((payload -> 'body' ->> 'ThirdPartyId'), ''))::TEXT,
        (COALESCE((payload -> 'body' ->> 'BrowserName'), ''))::TEXT,
        (COALESCE((payload -> 'body' ->> 'DevicePlatform'), ''))::TEXT,
        (COALESCE((payload -> 'body' ->> 'IsMobile'), ''))::BOOLEAN,
        (COALESCE((payload -> 'body' ->> 'UtmCampaign'), ''))::TEXT,
        (COALESCE((payload -> 'body' ->> 'UtmAdGroup'), ''))::TEXT,
        (COALESCE((payload -> 'body' ->> 'UtmAd'), ''))::TEXT,
        (COALESCE((payload -> 'body' ->> 'UtmKeyword'), ''))::TEXT,
        (COALESCE((payload -> 'body' ->> 'user_validation_id'), ''))::TEXT,
        (COALESCE((payload -> 'body' ->> 'TrafficTypeId'), ''))::INT,
        NOW() + COALESCE(payload ->> 'agg_ttl_interval', '30d')::INTERVAL
        FROM <report_sequence_set>
        WHERE config_id = '<config_id>'
        ON CONFLICT
        DO NOTHING
             */

            var target_schema_column_name = new Production(new[]
            {
                "\"",
                E.Create(new GetterInstruction("context://col?alias")),
                "\""
            }, (key, value) => symbolTable[key] = value, new Entity[] { "" });

            var target_schema_column_name_with_coalesce = new Production(new[]
            {
                //(COALESCE((payload -> 'body' ->> 'PathStyleVerticalTypeId'), '0'))::INT,
                "(COALESCE((payload -> 'body'",
                E.Create(new GetterInstruction("context://col?json_path")),
                "), '",
                E.Create(new GetterInstruction("context://col?default_value", "")),
                "'))::",
                E.Create(new GetterInstruction("context://col?data_type"))
            }, (key, value) => symbolTable[key] = value, new Entity[] { "" });

            var target_table_insert_sql = new Production(new[]
            {
                @"INSERT INTO warehouse.report_sequence_duplicates(id, ts)
                                SELECT id, ts
                                FROM <report_sequence_set> rss
                                WHERE EXISTS (SELECT 1 FROM ""<target_schema>"".",
                E.Create(new GetterInstruction("context://sym?target_table_insert_sql_meta_rs_name")),
                @" t WHERE t.id = rss.id);
                                INSERT INTO ""<target_schema>"".""",
                E.Create(new GetterInstruction("context://sym?target_table_insert_sql_meta_rs_name")),
                @""" (",

                E.Create(new RepetitionInstruction(E.Create(target_schema_column_name), ",",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://6312d62e-0db1-4954-8465-ebccf11bcf56?rs_elements.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key))),

                @" , expires) SELECT id, ts, payload, silo_id ",

                // need the instructions to be able to add a prepend char since it is not part of the
                // (also suppression, I think order is handled by aliasing at template level)

                E.Create(new RepetitionInstruction(E.Create(target_schema_column_name_with_coalesce), ",",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://6312d62e-0db1-4954-8465-ebccf11bcf56?rs_elements.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key))),

                @",
                        NOW() + COALESCE(payload ->> 'agg_ttl_interval', '30d')::INTERVAL
                        FROM <report_sequence_set>
                        WHERE config_id = '<config_id>'
                        ON CONFLICT
                        DO NOTHING"
            }, (key, value) => symbolTable[key] = value, null);

            /*
             ***************************************************************************************************************************
             */

            //MAX("pathstyle_vertical_type_id") "pathstyle_vertical_type_id",
            var checked_transform_rs_elements = new Production(new[]
            {
                E.Create(new ConditionInstruction(new List<(Entity Antecedent, Entity Consequent)> {
                    (E.Create(new GetterInstruction("context://col?data_type[?(@=='BOOLEAN')]", null, true)), "BOOL_OR"),
                    (null, "MAX") })),
                @"(""",
                E.Create(new GetterInstruction("context://col?alias")),
                @""") """,
                E.Create(new GetterInstruction("context://col?alias")),
                @""""
            }, (key, value) => symbolTable[key] = value, new Entity[] { "" });

            //util.try_parse(CASE
            //                        WHEN payload -> 'body' -> 'PathStyleVerticalTypeId' IS NULL THEN NULL
            //                        ELSE COALESCE(payload -> 'body' ->> 'PathStyleVerticalTypeId', '0') END, 'INT',
            //                    NULL)::INT                                                                  "pathstyle_vertical_type_id",
            var checked_transform_parsed_rs_elements = new Production(new[]
            {
                "util.try_parse(CASE WHEN payload -> 'body' ",
                E.Create(new GetterInstruction("context://col?json_path.replace('>>', '>')")),
                @" IS NULL THEN NULL
                                    ELSE COALESCE(payload -> 'body' ",
                E.Create(new GetterInstruction("context://col?json_path", "")),
                ", ",
                E.Create(new GetterInstruction("context://col?default_value", "NULL", false, "'", "'")),
                ") END, '",
                E.Create(new GetterInstruction("context://col?data_type")),
                @"', ",
                //E.Create(new ConditionInstruction(new List<(Entity Antecedent, Entity Consequent)> {
                //    (E.Create(new GetterInstruction("context://col?error_value", null, true)), "'"),
                //    (null, "")})),
                //E.Create(new GetterInstruction("context://col?error_value", "NULL")),
                //E.Create(new ConditionInstruction(new List<(Entity Antecedent, Entity Consequent)> {
                //    (E.Create(new GetterInstruction("context://col?error_value", null, true)), "'"),
                //    (null, "")
                //})),
                E.Create(new GetterInstruction("context://col?error_value", "NULL", false, "'", "'")),
                ")::",
                E.Create(new GetterInstruction("context://col?data_type")),
                @" """,
                E.Create(new GetterInstruction("context://col?alias")),
                @""""
            }, (key, value) => symbolTable[key] = value, new Entity[] { "" });

            //"pathstyle_id" = COALESCE(tgt."pathstyle_id", excluded."pathstyle_id"),
            var checked_transform_tgt_and_excluded = new Production(new[]
            {
                @"""",
                E.Create(new GetterInstruction("context://col?alias")),
                @""" = COALESCE(tgt.""",
                E.Create(new GetterInstruction("context://col?alias")),
                @""", excluded.""",
                E.Create(new GetterInstruction("context://col?alias")),
                @""")"
            }, (key, value) => symbolTable[key] = value, new Entity[] { "" });

            // "root_campaign_id" 
            var checked_transform_all_keys_without_satisfaction = new Production(new[]
            {
                @"""",
                E.Create(new GetterInstruction("context://col?alias")),
                @""""
            }, (key, value) => symbolTable[key] = value, new Entity[] { "" });

            // COALESCE("is_repeat_user", CASE WHEN satisfaction_expires < NOW() THEN 'f'::BOOLEAN END)
            var checked_transform_all_keys_with_satisfaction = new Production(new[]
            {
                @"COALESCE(""",
                E.Create(new GetterInstruction("context://col?alias")),
                @""", CASE WHEN satisfaction_expires < NOW() THEN '",
                E.Create(new GetterInstruction("context://col?satisfaction_default_value")),
                @"'::",
                E.Create(new GetterInstruction("context://col?data_type")),
                @" END)"
            }, (key, value) => symbolTable[key] = value, new Entity[] { "" });

            var checked_transform_all_keys = new Production(new[]
            {
                E.Create(new ConditionInstruction(new List<(Entity Antecedent, Entity Consequent)> {
                    (E.Create(new GetterInstruction("context://col?satisfaction_default_value[?(@)]", null, true)), E.Create(checked_transform_all_keys_with_satisfaction)),
                    (null, E.Create(checked_transform_all_keys_without_satisfaction))
                })),
            }, (key, value) => symbolTable[key] = value, new Entity[] { "" });

            var checked_transform_all_keys_not_null = new Production(new[]
            {
                E.Create(checked_transform_all_keys),
                @" IS NOT NULL"
            }, (key, value) => symbolTable[key] = value, new Entity[] { "" });

            // If singleton then this one is not created at all - it is null.
            var report_sequence_checked_transform_sql = new Production(new[]
            {
                @"DROP TABLE IF EXISTS tmp_checked_pending_set;
                    CREATE TABLE tmp_checked_pending_set AS
                        (SELECT id,
                                MIN(ts)                           ts,
                                MIN(satisfaction_expires)         satisfaction_expires,
                                MIN(expires_interval)             expires_interval,",

                //MAX("pathstyle_vertical_type_id") "pathstyle_vertical_type_id",
                E.Create(new RepetitionInstruction(E.Create(checked_transform_rs_elements), ",",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://6312d62e-0db1-4954-8465-ebccf11bcf56?rs_elements.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key))),

                @" FROM (
                          SELECT rs.id,
                                 rs.ts,
                                 NOW() +
                                 COALESCE((payload ->> 'satisfaction_ttl_interval')::INTERVAL, '5d'::INTERVAL)              satisfaction_expires,
                                 COALESCE(payload ->> 'agg_ttl_interval', '30d')                                            expires_interval,",

                //util.try_parse(CASE
                //                        WHEN payload -> 'body' -> 'PathStyleVerticalTypeId' IS NULL THEN NULL
                //                        ELSE COALESCE(payload -> 'body' ->> 'PathStyleVerticalTypeId', '0') END, 'INT',
                //                    NULL)::INT                                                                  "pathstyle_vertical_type_id",
                E.Create(new RepetitionInstruction(E.Create(checked_transform_parsed_rs_elements), ",",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://6312d62e-0db1-4954-8465-ebccf11bcf56?rs_elements.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key))),

                @"FROM tmp_staging_report_sequence_checked rs
                      WHERE staging_ts < <max_ts_to_move>
                      UNION
                      SELECT rs.id,
                             rs.ts,
                             NOW() +
                             COALESCE((payload ->> 'satisfaction_ttl_interval')::INTERVAL, '5d'::INTERVAL)              satisfaction_expires,
                             NULL::TEXT                                                                                 expires_interval,",

                // same as above repetition
                E.Create(new RepetitionInstruction(E.Create(checked_transform_parsed_rs_elements), ",",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://6312d62e-0db1-4954-8465-ebccf11bcf56?rs_elements.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key))),

                @"FROM tmp_staging_report_sequence_checked_detail rs
                      WHERE staging_ts < < max_ts_to_move >
                      UNION
                      SELECT pnd.id,
                             pnd.ts,
                             satisfaction_expires,
                             expires_interval,",

                // reusing a template from another template
                E.Create(new RepetitionInstruction(E.Create(target_schema_column_name), ",",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://6312d62e-0db1-4954-8465-ebccf11bcf56?rs_elements.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key))),

                @"FROM ""<pending_target_schema>"".""",

                E.Create(new GetterInstruction("context://sym?report_sequence_checked_transform_meta_rs_name")),

                @""" pnd
                                   JOIN tmp_staging_report_sequence_checked rsc
                                        ON (pnd.id = rsc.id AND pnd.ts = rsc.ts)
                                   JOIN tmp_staging_report_sequence_checked_detail rscd
                                        ON (pnd.id = rscd.id AND pnd.ts = rscd.ts)
                          WHERE rsc.staging_ts < <max_ts_to_move>
                            AND rscd.staging_ts < <max_ts_to_move>
                                    <partition_where_clause>
                      ) src
                 GROUP BY id);

                        CREATE UNIQUE INDEX uix_tmp_checked_pending_set ON tmp_checked_pending_set(id, ts);

                        INSERT INTO ""<pending_target_schema>"".""",

                E.Create(new GetterInstruction("context://sym?report_sequence_checked_transform_meta_rs_name")),

                @""" AS tgt (id, ts, satisfaction_expires, expires_interval,",

                // again reusing
                E.Create(new RepetitionInstruction(E.Create(target_schema_column_name), ",",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://6312d62e-0db1-4954-8465-ebccf11bcf56?rs_elements.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key))),

                @")
                    SELECT *
                    FROM tmp_checked_pending_set
                    ON CONFLICT (id, ts) DO UPDATE
                        SET ts                           = COALESCE(tgt.ts, excluded.ts),",

                // "pathstyle_id"               = COALESCE(tgt."pathstyle_id", excluded."pathstyle_id"),
                E.Create(new RepetitionInstruction(E.Create(checked_transform_tgt_and_excluded), ",",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://6312d62e-0db1-4954-8465-ebccf11bcf56?rs_elements.*")), true, 0, ExhaustionBehavior.DefaultValue),
                })), (key, value) => context[key] = value, (key) => context.Remove(key))),

                @";

                    INSERT INTO warehouse.report_sequence_duplicates(id, ts)
                    SELECT id,
                           ts
                    FROM ""<pending_target_schema>"".""",

                E.Create(new GetterInstruction("context://sym?report_sequence_checked_transform_meta_rs_name")),

                @""" p
                        WHERE ts IS NOT NULL",

                // AND "root_campaign_id" IS NOT NULL
                // AND COALESCE("is_repeat_user", CASE WHEN satisfaction_expires < NOW() THEN 'f'::BOOLEAN END) IS NOT NULL
                E.Create(new { Instruction = new RepetitionInstruction(E.Create(checked_transform_all_keys_not_null), " AND ",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://6312d62e-0db1-4954-8465-ebccf11bcf56?rs_elements.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key)), Suppress = false, Prepend = " AND "}),

                @" AND EXISTS(SELECT 1
                        FROM ""<target_schema>"".",

                E.Create(new GetterInstruction("context://sym?report_sequence_checked_transform_meta_rs_name", "", false, @"""", @"""")),

                @" tgt
                     WHERE p.id = tgt.id <dups_partition_where_clause>);

                    WITH inserted AS(
                        INSERT INTO ""<target_schema>"".",

                E.Create(new GetterInstruction("context://sym?report_sequence_checked_transform_meta_rs_name", "", false, @"""", @"""")),

                @" (id, ts ",

                // reuse again (comma sep list of quoted columns)
                E.Create(new { Instruction = new RepetitionInstruction(E.Create(target_schema_column_name), " , ",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://6312d62e-0db1-4954-8465-ebccf11bcf56?rs_elements.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key)), Suppress = false, Prepend = " , "}),

                @", expires)
                    SELECT id,
                           ts",

                // same as two above but without not null
                E.Create(new { Instruction = new RepetitionInstruction(E.Create(checked_transform_all_keys), " , ",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://6312d62e-0db1-4954-8465-ebccf11bcf56?rs_elements.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key)), Suppress = false, Prepend = " , "}),

                @" , NOW() + expires_interval::INTERVAL
                    FROM ""<pending_target_schema>"".",

                E.Create(new GetterInstruction("context://sym?report_sequence_checked_transform_meta_rs_name", "", false, @"""", @"""")),

                @" WHERE ts IS NOT NULL",

                // again with the not null
                E.Create(new { Instruction = new RepetitionInstruction(E.Create(checked_transform_all_keys_not_null), " AND ",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://6312d62e-0db1-4954-8465-ebccf11bcf56?rs_elements.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key)), Suppress = false, Prepend = " AND "}),

                @" ON CONFLICT DO NOTHING
                                RETURNING 1
                        )
                        INSERT
                        INTO log.general(ts, reporter, message)
                        SELECT CLOCK_TIMESTAMP(),
                               'edw.check_and_normalize_report_sequence_satisfaction',
                               FORMAT('inserted %s rows', COUNT(*))
                        FROM inserted
                        ;

                        WITH deleted AS (
                            DELETE FROM ""<pending_target_schema>"".",

                E.Create(new GetterInstruction("context://sym?report_sequence_checked_transform_meta_rs_name", "", false, @"""", @"""")),

                @"
                    WHERE ts IS NOT NULL ",

                E.Create(new { Instruction = new RepetitionInstruction(E.Create(checked_transform_all_keys_not_null), " AND ",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://6312d62e-0db1-4954-8465-ebccf11bcf56?rs_elements.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key)), Suppress = false, Prepend = " AND "}),

                @" RETURNING 1
                    )
                    INSERT
                    INTO log.general(ts, reporter, message)
                    SELECT CLOCK_TIMESTAMP(),
                           'edw.check_and_normalize_report_sequence_satisfaction',
                           FORMAT('deleted %s rows', COUNT(*))
                    FROM deleted;

                    DELETE
                    FROM ""<pending_target_schema>"".",

                E.Create(new GetterInstruction("context://sym?report_sequence_checked_transform_meta_rs_name", "", false, @"""", @"""")),

                @" WHERE NOW() > (satisfaction_expires + '6h'::INTERVAL); "
            }, (key, value) => symbolTable[key] = value, null);

            ///////////*************************** report_sequence_select.sql 
            ///

            /*
            ["process_constants"] = 
                "'<<g|context://constant?value>>'::<<g|context://constant?data_type>>"
                "<<g|context://constant?name>>"

            ["event_elements"] = 
                "<<event_element>> \"<<g|context://evt?alias>>\""

            ["event_element"] = 
                "(coalesce(event_payload -> 'body' <<g|context://evt?json_path>>, ''))::<<g|context://evt?data_type>>"  
                "<<g|context://evt?alias>>",

            ["derived_elements"] =
                "<<derived_element>> \"<<g|context://der?alias>>\""

            ["derived_element"] 
                "<<g|context://der?col_value>>::<<g|context://der?data_type>>"
                "<<g|context://der?alias>>"

            ["rs_elements"]
                "<<rs_element>> \"<<g|context://rs?alias>>\""

            ["rs_element"] = 
                "rs.<<g|context://rs?alias>>", "<<g|context://rs?alias>>")),
            */

            var process_constants = new Production(new[]
            {
                E.Create(new GetterInstruction("context://col?value", "", false, @"'", @"'")),
                @"::",
                E.Create(new GetterInstruction("context://col?data_type")),
                @" ",
                E.Create(new GetterInstruction("context://col?name")),
            }, (key, value) => symbolTable[key] = value, new[] { E.Create(new GetterInstruction("context://col?name")) });

            //["rs_element"] =
            //    "rs.<<g|context://rs?alias>>", "<<g|context://rs?alias>>")),
            var rs_element = new Production(new[]
            {
                @"rs.",
                E.Create(new GetterInstruction("context://col?alias")),
            }, (key, value) => symbolTable[key] = value,
                    new[] { E.Create(new GetterInstruction("context://col?alias", "")) });

            //["rs_elements"]
            //    "<<rs_element>> \"<<g|context://rs?alias>>\""
            var rs_elements = new Production(new[]
            {
                @"    ",
                E.Create(rs_element),
                @"  ",
                E.Create(new GetterInstruction("context://col?alias", "", false, @"""", @"""")),
            }, (key, value) => symbolTable[key] = value, null);

            //["event_element"] =
            //    "(coalesce(event_payload -> 'body' <<g|context://evt?json_path>>, ''))::<<g|context://evt?data_type>>"
            //    "<<g|context://evt?alias>>",
            var event_element = new Production(new[]
            {
                "COALESCE(event_payload -> 'body' ",
                E.Create(new GetterInstruction("context://col?json_path")),
                ", ",
                E.Create(new GetterInstruction("context://col?satisfaction_default_value", "''", false, "'", "'")),
                ")::",
                E.Create(new GetterInstruction("context://col?data_type"))
            }, (key, value) => symbolTable[key] = value,
                    new[] { E.Create(new GetterInstruction("context://col?alias", "")) });

            //["event_elements"] =
            //    "<<event_element>> \"<<g|context://evt?alias>>\""
            var event_elements = new Production(new[]
            {
                "    ",
                E.Create(event_element),
                "  ",
                E.Create(new GetterInstruction("context://col?alias", "", false, @"""", @"""")),
            }, (key, value) => symbolTable[key] = value, null);

            //["derived_element"]
            //    "<<g|context://der?col_value>>::<<g|context://der?data_type>>"
            //    "<<g|context://der?alias>>"
            var derived_element = new Production(new[]
            {
                E.Create(new GetterInstruction("context://col?col_value")),
                "::",
                E.Create(new GetterInstruction("context://col?data_type")),
            }, (key, value) => symbolTable[key] = value,
                    new[] { E.Create(new GetterInstruction("context://col?alias", "")) });

            //["derived_elements"] =
            //    "<<derived_element>> \"<<g|context://der?alias>>\""
            var derived_elements = new Production(new[]
            {
                "    ",
                E.Create(derived_element),
                " ",
                E.Create(new GetterInstruction("context://col?alias", "", false, @"""", @"""")),
            }, (key, value) => symbolTable[key] = value, null);

            //JOIN warehouse_report_sequence."PathDmSn" rs ON (ws.rs_id = rs.id AND ws.rs_ts = rs.ts)
            var select_sql_multiton_join = new Production(new[]
            {
                $"{Environment.NewLine}    JOIN warehouse_report_sequence.",
                E.Create(new GetterInstruction("config://3aeeb2b6-c556-4854-a679-46ea73a6f1c7?$meta.name", "", false, @"""", @"""")),
                $" rs{Environment.NewLine}    ON (ws.rs_id = rs.id AND ws.rs_ts = rs.ts)"
            }, (key, value) => symbolTable[key] = value, null);

            var report_sequence_select_sql = new Production(new[]
            {
                //["process_constants"] =
                //"'<<g|context://constant?value>>'::<<g|context://constant?data_type>>"
                //"<<g|context://constant?name>>"
                E.Create(new { Instruction = new RepetitionInstruction(E.Create(process_constants), "",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://3aeeb2b6-c556-4854-a679-46ea73a6f1c7?constants.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key)), Suppress = true }),

                E.Create(new ConditionInstruction(new List<(Entity Antecedent, Entity Consequent)> {
                    (E.Create(new GetterInstruction(@"config://3aeeb2b6-c556-4854-a679-46ea73a6f1c7?thread_group_id[?(@.thread_group_type!=""singleton"")]", null, true)),
                        @"SELECT event_id,
    event_ts,
    rs.id    rs_id,
    rs.ts    rs_ts"),
                    (null, @"SELECT event_id,
    event_ts")
                })),

                $"{Environment.NewLine}    -- Event elements",
                E.Create(new { Instruction = new RepetitionInstruction(E.Create(event_elements), $",{Environment.NewLine}",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://3aeeb2b6-c556-4854-a679-46ea73a6f1c7?event_elements.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key)), Suppress = false, Prepend = $",{Environment.NewLine}"}),

                $"{Environment.NewLine}    -- RS elements",
                E.Create(new ConditionInstruction(new List<(Entity Antecedent, Entity Consequent)> {
                    (E.Create(new GetterInstruction(@"config://3aeeb2b6-c556-4854-a679-46ea73a6f1c7?thread_group_id[?(@.thread_group_type!=""singleton"")]", null, true)),
                        E.Create(new Production( new [] { E.Create(new { Instruction = new RepetitionInstruction(E.Create(rs_elements), $",{Environment.NewLine}",
                            E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                                ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://3aeeb2b6-c556-4854-a679-46ea73a6f1c7?rs_elements.*")), true, 0, ExhaustionBehavior.DefaultValue)
                        })), (key, value) => context[key] = value, (key) => context.Remove(key)), Suppress = false, Prepend = $",{Environment.NewLine}"}) }))),
                    (null, "")
                })),

                $"{Environment.NewLine}    -- Derived elements",
                E.Create(new { Instruction = new RepetitionInstruction(E.Create(derived_elements), $",{Environment.NewLine}",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://3aeeb2b6-c556-4854-a679-46ea73a6f1c7?derived_elements.*")), true, 0, ExhaustionBehavior.DefaultValue)
                })), (key, value) => context[key] = value, (key) => context.Remove(key)), Suppress = false, Prepend = $",{Environment.NewLine}"}),

                $"{Environment.NewLine}FROM satisfied_set ws",

                E.Create(new ConditionInstruction(new List<(Entity Antecedent, Entity Consequent)> {
                    (E.Create(new GetterInstruction(@"config://3aeeb2b6-c556-4854-a679-46ea73a6f1c7?thread_group_id[?(@.thread_group_type!=""singleton"")]", null, true)),
                        E.Create(select_sql_multiton_join)),
                    (null, "")
                }))

            }, (key, value) => symbolTable[key] = value, null);

            ///////////////////////////  Test recursive joins

            //["test_joins"] = await E.Parse("application/json", test),
            //["test_joins_start_table"] = "ws"

            //{
            //   ""joins"":[
            //      {
            //         ""alias"":""bob"",
            //         ""table_name"":""blob"",
            //         ""join_type"":""LEFT"",
            //         ""on"":""$on_cols1 = $bob.col AND $on_cols2 =$tgt.col2"",
            //         ""where"":""$tgt.col IS NOT NULL""
            //      },
            //      {
            //         ""alias"":""tom"",
            //         ""table_name"":""thom"",
            //         ""join_type"":""LEFT"",
            //         ""on"":""$on_cols1 = $bob.col AND $on_cols2 =$tgt.col2"",
            //         ""where"":""$tgt.col IS NOT NULL"",
            //         ""joins"":[
            //            {
            //               ""alias"":""rich"",
            //               ""table_name"":""richard"",
            //               ""join_type"":""LEFT"",
            //               ""on"":""$on_cols1 = $bob.col AND $on_cols2 =$tgt.col2"",
            //               ""where"":""$tgt.col IS NOT NULL""
            //            }
            //         ]
            //      }
            //   ]
            //}
            //            ";

            var test_join = new Production(new[]
            {
                E.Create(new GetterInstruction("context://col?value", "", false, @"'", @"'")),
                "::",
                E.Create(new GetterInstruction("context://col?data_type")),
                " ",
                E.Create(new GetterInstruction("context://col?name")),

                E.Create(new { Instruction = new RepetitionInstruction(E.Create(event_elements), $",{Environment.NewLine}",
                    E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                        ["col"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("config://3aeeb2b6-c556-4854-a679-46ea73a6f1c7?event_elements.*")), true, 0, ExhaustionBehavior.DefaultValue)

                })), (key, value) => context[key] = value, (key) => context.Remove(key)), Suppress = false, Prepend = $",{Environment.NewLine}"}),
            }, (key, value) => symbolTable[key] = value, new[] { E.Create(new GetterInstruction("context://col?name")) });

            //["rs_element"] =
            //    "rs.<<g|context://rs?alias>>", "<<g|context://rs?alias>>")),
            var test_joins = new Production(new[]
            {
                E.Create(test_join)
            }, (key, value) => symbolTable[key] = value,
                    new[] { E.Create(new GetterInstruction("context://col?alias", "")) });

            var cur_prod = report_sequence_select_sql;

            await foreach (var constant in fw.Entity.Eval("config://3aeeb2b6-c556-4854-a679-46ea73a6f1c7?constants.*"))
            {
                Console.WriteLine(constant);
            }

            await foreach (var output in fw.Evaluator.Evaluate(E.Create(cur_prod), null))
            {
                Console.WriteLine(output.Value<string>());
            }

            Console.WriteLine("\r\nScope:");
            foreach (var kvp in symbolTable)
            {
                Console.WriteLine($"{kvp.Key}: {kvp.Value}");
            }
        }

        const string tokenStart = "[=";
        const string tokenEnd = "=]";

        private static async Task<(bool hadTokens, string tokenReplaced)> ReplaceTokens(Entity entity, string tokenizedInput)
        {
            var result = new StringBuilder();

            var currentIndex = 0;

            while (currentIndex < tokenizedInput.Length)
            {
                var nextTokenStartIndex = tokenizedInput.IndexOf(tokenStart, currentIndex);
                if (nextTokenStartIndex == -1)
                {
                    if (currentIndex == 0)
                    {
                        return (false, tokenizedInput);
                    }

                    _ = result.Append(tokenizedInput[currentIndex..]);
                    break;
                }
                else
                {
                    _ = result.Append(tokenizedInput[currentIndex..nextTokenStartIndex]);
                    var nextTokenEndIndex = tokenizedInput.IndexOf(tokenEnd, nextTokenStartIndex);
                    if (nextTokenStartIndex == -1)
                    {
                        throw new Exception($"Unclosed token starting at index {nextTokenStartIndex}");
                    }

                    var query = tokenizedInput[(nextTokenStartIndex + tokenStart.Length)..nextTokenEndIndex].Trim();
                    var value = await entity.EvalS(query);

                    var nestedReplacedValue = await ReplaceTokens(entity, value);

                    _ = result.Append(nestedReplacedValue.tokenReplaced);

                    currentIndex = nextTokenEndIndex + tokenEnd.Length;
                }
            }

            return (true, result.ToString());
        }

        private static string UnescapeQueryString(Uri uri) => Uri.UnescapeDataString(uri.Query.TrimStart('?'));

        private static async IAsyncEnumerable<Entity> FunctionHandler(IAsyncEnumerable<Entity> entities, string functionName, IReadOnlyList<Entity> functionArguments, string query, Entity evaluationParameters)
        {
            await foreach (var entity in entities)
            { //$meta.id  // EvalL("@")
                switch (functionName)
                {
                    case "replace":
                        if (entity.ValueType == EntityValueType.Array)
                        {
                            var index = 0;
                            await foreach (var child in entity.Eval("@.*"))
                            {
                                yield return entity.Create(child.Value<string>().Replace(functionArguments[0].Value<string>(), functionArguments[1].Value<string>()), $"{entity.Query}[{index}].{query}");
                                index++;
                            }
                        }
                        else
                        {
                            yield return entity.Create(entity.Value<string>().Replace(functionArguments[0].Value<string>(), functionArguments[1].Value<string>()), $"{entity.Query}.{query}");
                        }

                        break;

                    case "distinct":
                        var d = new HashSet<string>();
                        await foreach (var child in entity.EvalL("@"))
                        {
                            var s = await child.EvalS("$meta.id");
                            if (d.Contains(s))
                            {
                                continue;
                            }
                            else
                            {
                                _ = d.Add(s);
                                yield return child;
                            }
                        }

                        break;

                    case "repeat":
                        for (var i = 0; i < functionArguments[0].Value<int>(); i++)
                        {
                            yield return entity.Clone($"{entity.Query}.{query}[{i}]");
                        }

                        break;
                    case "suppress":
                        if (!functionArguments[0].Value<bool>())
                        {
                            yield return entity;
                        }

                        break;
                    default:
                        throw new InvalidOperationException($"Unknown function {functionName}");
                }
            }
        }
    }
}
