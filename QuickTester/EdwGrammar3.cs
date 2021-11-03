using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Utility.Entity;
using Utility.Entity.Implementations;
using Utility.Evaluatable;

namespace QuickTester
{
    public static class EdwGrammar3
    {
        public class Production : IEvaluatable
        {
            public IEnumerable<Entity> Entities { get; } // each Entity is expected to evaluate to a string
            public string Symbol { get; }

            private readonly Action<string, string> _symbolSetter;

            public Production(IEnumerable<Entity> entities, Action<string, string> symbolSetter = null, string symbol = null)
            {
                Entities = entities;
                Symbol = symbol;
                _symbolSetter = symbolSetter;
            }

            public async IAsyncEnumerable<Entity> Evaluate(Entity entity)
            {
                // TODO: Seperate evaluation order from concat order
                var sb = new StringBuilder();
                foreach (var child in Entities)
                {
                    sb.Append(await child.GetAsS("@"));
                }

                var result = sb.ToString();

                if (_symbolSetter != null && Symbol != null)
                {
                    _symbolSetter(Symbol, result);
                }

                yield return entity.Create(result);
            }
        }

        public class GetterInstruction : IEvaluatable
        {
            public string Query { get; }
            public Entity DefaultValue { get; }

            public GetterInstruction(string query, Entity defaultValue = null)
            {
                Query = query;
                DefaultValue = defaultValue;
            }

            public async IAsyncEnumerable<Entity> Evaluate(Entity entity)
            {
                var hadResults = false;

                var result = await entity.Get(Query);
                foreach (var resultEntity in result)
                {
                    hadResults = true;
                    yield return resultEntity;
                }

                if (!hadResults && DefaultValue != null)
                {
                    yield return DefaultValue;
                }
            }
        }

        public class ConditionInstruction : IEvaluatable
        {
            public string Query { get; }
            public Entity TrueValue { get; }
            public Entity FalseValue { get; }

            public ConditionInstruction(string query, Entity trueValue, Entity falseValue)
            {
                Query = query;
                TrueValue = trueValue;
                FalseValue = falseValue;
            }

            public async IAsyncEnumerable<Entity> Evaluate(Entity entity)
            {
                if ((await entity.Get(Query)).Any())
                {
                    yield return TrueValue;
                }
                else
                {
                    yield return FalseValue;
                }
            }
        }

        // <<s|abc|entity://5>>
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

            public async IAsyncEnumerable<Entity> Evaluate(Entity entity)
            {
                var ies = new Dictionary<string, IEnumerator<Entity>>();

                var dominants = Scopes.Where(scope => scope.Value.Dominant).Select(scope => scope.Key).ToList();
                if (!dominants.Any())
                {
                    dominants = Scopes.Keys.ToList();
                }

                var finished = new HashSet<string>();

                try
                {
                    foreach (var (k, v) in Scopes)
                    {
                        ies[k] = (await v.Scope.Get("@")).GetEnumerator();
                    }

                    bool done;
                    var repeatCount = 0;
                    do
                    {
                        done = true;
                        var result = new Dictionary<string, Entity>();

                        var anyProduced = false;
                        foreach (var (k, v) in ies)
                        {
                            var scopeConfig = Scopes[k];

                            bool repeatCountMet = scopeConfig.RepeatCount > 0 && repeatCount >= scopeConfig.RepeatCount;

                            if (!repeatCountMet && v.MoveNext())
                            {
                                if (dominants.Contains(k) && !finished.Contains(k))
                                {
                                    anyProduced = true;
                                }
                                result[k] = v.Current;
                                if (scopeConfig.RepeatCount > 0 && repeatCount == scopeConfig.RepeatCount)
                                {
                                    finished.Add(k);
                                }
                            }
                            else
                            {
                                finished.Add(k);

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
                                    else if (scopeConfig.ExhaustionBehavior == ExhaustionBehavior.DefaultValue)
                                    {
                                        result[k] = scopeConfig.DefaultValue;
                                    }
                                    else
                                    {
                                        result[k] = null;
                                    }
                                }
                                else
                                {
                                    result[k] = null;
                                }
                            }
                        }

                        if (anyProduced)
                        {
                            yield return entity.Create(result);
                        }

                        done = finished.Intersect(dominants).Count() == dominants.Count;

                        repeatCount++;
                    } while (!done);
                }
                finally
                {
                    foreach (var (_, v) in ies)
                    {
                        v.Dispose();
                    }
                }
            }
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

            public async IAsyncEnumerable<Entity> Evaluate(Entity entity)
            {
                var parts = new List<string>();

                foreach (var step in await Repeater.Get("@"))
                {
                    var scope = await step.GetD("@");

                    foreach (var kvp in scope)
                    {
                        _contextSetter(kvp.Key, kvp.Value);
                    }

                    var stepContent = await Template.GetAsS("@");

                    foreach (var kvp in scope)
                    {
                        _contextRemover(kvp.Key);
                    }

                    parts.Add(stepContent);
                }

                yield return entity.Create(string.Join(await Separator.GetAsS("@"), parts));
            }
        }

        public static async Task Run()
        {
            var fw = new FrameworkWrapper();

            Entity contextEntity = null;

            var E = Entity.Initialize(new EntityConfig(
                Parser: (entity, contentType, content) => contentType switch
                {
                    "application/json" => EntityDocumentJson.Parse(content),
                    _ => throw new InvalidOperationException($"Unknown contentType: {contentType}")
                },
                Retriever: async (entity, uri) => uri.Scheme switch
                {
                    "entity" => (await GetEntity(fw, entity, uri.Host), UnescapeQueryString(uri)),
                    "entityType" => (await GetEntityType(entity, uri.Host), UnescapeQueryString(uri)),
                    "context" => (new[] { await contextEntity.GetE(uri.Host) }, UnescapeQueryString(uri)),
                    _ => throw new InvalidOperationException($"Unknown scheme: {uri.Scheme}")
                },
                MissingPropertyHandler: null,
                FunctionHandler: FunctionHandler)
            );

            var symbolTable = new Dictionary<string, Entity>()
            {
                ["firstName"] = E.Create("John"),
                ["condition1"] = E.Create(true),
                ["condition2"] = E.Create(false),
                ["1to5"] = E.Create(new[] { 1, 2, 3, 4, 5 }),
                ["1to3"] = E.Create(new[] { 1, 2, 3 }),
            };

            var productions = new Dictionary<string, Entity>();

            var context = new Dictionary<string, Entity>
            {
                ["sym"] = E.Create(symbolTable),
                ["productions"] = E.Create(productions),
            };

            contextEntity = E.Create(context);

            var subProduction = new Production(new[]
            {
                E.Create("I am repeating: a: "),
                E.Create(new GetterInstruction("context://a", E.Create("***NOT FOUND A***"))),
                E.Create(" b: "),
                E.Create(new GetterInstruction("context://b", E.Create("***NOT FOUND B***"))),
                E.Create(" c: "),
                E.Create(new GetterInstruction("context://c", E.Create("***NOT FOUND C***"))),
            });

            var production = new Production(new[]
            {
                E.Create("Hello there "),
                E.Create(new GetterInstruction("context://sym?firstName", E.Create("***NO NAME***"))),
                E.Create("! How are you?\r\n"),
                E.Create(new ConditionInstruction("context://sym?condition1[?(@==true)]", E.Create("Condition1 is true!!!"), E.Create("Condition1 is *NOT* true!!!"))),
                E.Create("\r\n"),
                E.Create(new ConditionInstruction("context://sym?condition2[?(@==true)]", E.Create("Condition2 is true!!!"), E.Create("Condition2 is *NOT* true!!!"))),
                E.Create("\r\n"),
                E.Create(new RepetitionInstruction(E.Create(subProduction), E.Create("\r\n"), E.Create(new ParallelGetInstruction(new Dictionary<string, ParallelGetInstructionScope>{
                    ["a"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("context://sym?1to5.*")), true, 0, ExhaustionBehavior.DefaultValue),
                    ["b"] = new ParallelGetInstructionScope(E.Create(new GetterInstruction("context://sym?1to3.*")), false, 0, ExhaustionBehavior.Restart),//ExhaustionBehavior.DefaultValue, E.Create("Default Value for b!"))
                    ["c"] = new ParallelGetInstructionScope(E.Create("Hello"), false, 3, ExhaustionBehavior.DefaultValue, E.Create("Goodbye")),
                })), (key, value) => context[key] = value, (key) => context.Remove(key))),
            }, (key, value) => symbolTable[key] = E.Create(value), "production1");

            await foreach (var output in production.Evaluate(E.Create(production)))
            {
                Console.WriteLine(output.Value<string>());
            }

            Console.WriteLine("\r\nScope:");
            foreach (var kvp in symbolTable)
            {
                Console.WriteLine($"{kvp.Key}: {kvp.Value}");
            }
        }

        private static async Task<IEnumerable<Entity>> GetEntity(FrameworkWrapper fw, Entity root, string entityId)
        {
            var id = Guid.Parse(entityId);
            var entity = await fw.Entities.GetEntity(id);
            entity.Set("/Config/$id", id);
            entity.Set("/Config/$name", entity.GetS("/Name"));
            return new[] { await root.Parse("application/json", entity.GetS("/Config")) };
        }

        private static async Task<IEnumerable<Entity>> GetEntityType(Entity root, string entityType)
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
            return convertedEntities;
        }

        private static string UnescapeQueryString(Uri uri) => Uri.UnescapeDataString(uri.Query.TrimStart('?'));

        private static async IAsyncEnumerable<Entity> FunctionHandler(IEnumerable<Entity> entities, string functionName, IReadOnlyList<Entity> functionArguments, string query)
        {
            foreach (var entity in entities)
            {
                switch (functionName)
                {
                    case "replace":
                        if (entity.ValueType == EntityValueType.Array)
                        {
                            var index = 0;
                            foreach (var child in await entity.Get("@.*"))
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
