using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Json.Path;
using Utility;
using Utility.Entity;
using Utility.Entity.Implementations;

namespace QuickTester
{
    class TestClass
    {
        public string Field1;
        public string Property1 { get; set; }
        public int Property2 { get; set; }

        public TestClass2 TestClass2 { get; set; } = new TestClass2 { Property3 = "Property3!" };
    }

    class TestClass2
    {
        public string Property3 { get; set; }
    }

    internal class EntityTest
    {
        internal static async Task Run()
        {
            var testDocument = @"{
	""targetColor"": ""green"",
	""a"": {
		""b"": {
			""c"": ""A string value"",
			""d"": [""giraffe"", ""elephant"", ""mouse"", ""mongoose""],
			""e"": 123
		},
		""f"": {
			""c"": ""A string value"",
			""d"": [""giraffe"", ""elephant"", ""mouse"", ""mongoose""],
			""e"": 123
		}
	},
	""f"": [{
			""color"": ""red"",
			""count"": 5
		}, {
			""color"": ""blue"",
			""count"": 3
		}, {
			""color"": ""green"",
			""count"": 10
		}
	]
}";

            var refTestParentDocument = @"{
    ""a"": {
        ""$ref"": ""entity://refTestChildDocument""
    },
    ""b"": 5,
    ""c"": {
        ""$ref"": ""memory://thread?threadVariable1""
    },
    ""d"": {
        ""$ref"": ""entity://refTestChildDocument2""
    },
    ""d"": {
        ""$ref"": ""entity://testdocument?$.a..c""
    }
}";

            var refTestChildDocument = @"{
    ""x"": 50
}";

            var refTestChildDocument2 = @"[1,2,3,4,5]";

            var threadState = new EntityDocumentDictionary(new Dictionary<string, object>()
            {
                ["threadVariable1"] = 20
            });

            var processState = new EntityDocumentDictionary(new Dictionary<string, object>()
            {
                ["processVariable1"] = "Hello there"
            });

            var testClass = new TestClass { Field1 = "Field string", Property1 = "Test string", Property2 = 100 };

            var fw = await FrameworkWrapper.Create(new EntityConfig(
                Retriever: async (entity, uri) => uri.Scheme switch
                {
                    "entity" => uri.Host switch
                    {
                        "testdocument" => (new[] { await entity.Parse("application/json", testDocument) }, UnescapeQueryString(uri)),
                        "reftestparentdocument" => (new[] { await entity.Parse("application/json", refTestParentDocument) }, UnescapeQueryString(uri)),
                        "reftestchilddocument" => (new[] { await entity.Parse("application/json", refTestChildDocument) }, UnescapeQueryString(uri)),
                        "reftestchilddocument2" => (new[] { await entity.Parse("application/json", refTestChildDocument2) }, UnescapeQueryString(uri)),
                        "testclass" => (new[] { entity.Create(testClass) }, UnescapeQueryString(uri)),
                        _ => throw new InvalidOperationException($"Unknown entity: {uri.Host}")
                    },
                    "memory" => (new[] {entity.Create(uri.Host switch
                    {
                        "thread" => threadState,
                        "process" => processState,
                        _ => throw new Exception($"Unknown memory location {uri.Host}"),
                    })}, UnescapeQueryString(uri)),
                    _ => throw new InvalidOperationException($"Unknown scheme: {uri.Scheme}")
                },
                MissingPropertyHandler: (entity, propertyName) =>
                {
                    if (propertyName is not "$evaluate" and not "Entity")
                    {
                        Console.WriteLine($"Missing property `{propertyName}` in entity: {entity.Query}");
                    }

                    return Task.FromResult<EntityDocument>(null);
                },
                FunctionHandler: functionHandler
            ));

            static string UnescapeQueryString(Uri uri) => Uri.UnescapeDataString(uri.Query.TrimStart('?'));

            static bool tryInvokeStringMethod(Entity entity, string functionName, IReadOnlyList<Entity> functionArguments, out object value)
            {
                var method = typeof(string).GetMethods().Where(m => m.Name == functionName && m.GetParameters().Length == functionArguments.Count && (functionArguments.Count == 0 || m.GetParameters()[0].ParameterType != typeof(char))).SingleOrDefault();
                if (method != null)
                {
                    var methodParameters = method.GetParameters();
                    var actualParameters = new object[methodParameters.Length];
                    var valueMethod = typeof(Entity).GetMethod("Value");

                    for (var i = 0; i < methodParameters.Length; i++)
                    {
                        var methodParameter = methodParameters[i];

                        var typedArgumentValueMethod = valueMethod.MakeGenericMethod(methodParameter.ParameterType);
                        var typedArgument = typedArgumentValueMethod.Invoke(functionArguments[i], null);
                        actualParameters[i] = typedArgument;
                    }

                    var entityValue = entity.Value<string>();
                    value = method.Invoke(entityValue, actualParameters);
                    return true;
                }

                value = default;
                return false;
            }

            static async IAsyncEnumerable<Entity> functionHandler(IAsyncEnumerable<Entity> entities, string functionName, IReadOnlyList<Entity> functionArguments, string query, Entity evaluationParameters)
            {
                await foreach (var entity in entities)
                {
                    if (entity.ValueType == EntityValueType.Array)
                    {
                        var index = 0;
                        var yielded = false;
                        await foreach (var child in entity.Eval("@.*"))
                        {
                            if (tryInvokeStringMethod(child, functionName, functionArguments, out var value))
                            {
                                yield return entity.Create(value, $"{entity.Query}[{index}].{query}");
                                yielded = true;
                                index++;
                            }
                        }

                        if (yielded)
                        {
                            continue;
                        }
                    }
                    else if (entity.ValueType == EntityValueType.String)
                    {
                        if (tryInvokeStringMethod(entity, functionName, functionArguments, out var value))
                        {
                            yield return entity.Create(value, $"{entity.Query}.{query}");
                            continue;
                        }
                    }

                    switch (functionName)
                    {
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

            var E = fw.Entity;

            var testEntity = await E.Parse("application/json", testDocument);
            var testJsonDocument = JsonDocument.Parse(testDocument);

            Console.WriteLine($"Document: {testEntity}");
            Console.WriteLine();

            var queries = new[]
            {
                "$..[?(@.color==$.targetColor)]", // root selector in an operator
                "$.a.b.*",
                "$.a.b.d",
                "$.a.b.d.length",
                "$.a.b.d[1]",
                "$.a.b.d[-1]",
                "$.a.b.d[0,1,?(@==\"mongoose\")]",
                "$.a.b['c']",
                "$.a.b[\"c\"]",
                "$.a.b.d[0:2:1]",
                "$.a.b.d[::2]",
                "$..color", // any property named color
                "$..[?(@.color)]", // any object with a property named color
                "$.f[?(@.color)]",
                "$..[?(@.color==\"red\")]",
                "$.f[?(@.count==3+2)]", // addition operator
                "$.f[?(@.count==5 && @.color==\"red\")]", // && operator
                "$.f[?(@.count==9/3)]", // division operator
                "$.f[?(@.color==\"red\")]", // == operator
                "$.f[?(@.count>3)]", // > operator
                "$.f[?(@.count>=3)]", // >= operator
                "$.f[?(@.count<5)]", // < operator
                "$.f[?(@.count<=5)]", // <= operator
                "$.f[?(@.count==8%5)]", // % operator
                "$.f[?(@.count==5*2)]", // * operator
                "$.f[?(@.color!=\"red\")]", // != operator
                "$.f[?(!@.colora)]", // ! operator
                "$.f[?(@.count==3 || @.color==\"red\")]", // || operator
                "$.f[?(@.count==5-2)]", // subtraction operator
                "$..[?(@.color==$.targetColor)]", // root selector in an operator
            };

            foreach (var query in queries)
            {
                var jsonPath = JsonPath.Parse(query);
                var jsonPathResult = jsonPath.Evaluate(testJsonDocument.RootElement);

                Console.WriteLine($"Query: {query}");
                Console.WriteLine($"JsonPath:");
                Console.WriteLine($"\t{string.Join($"{Environment.NewLine}\t", jsonPathResult.Matches.Select(m => $"Query: {m.Location} Data: {m.Value}"))}");
                Console.WriteLine("Entity:");

                await foreach (var result in testEntity.Eval(query))
                {
                    Console.WriteLine($"\tQuery: {result?.Query} Data: {result?.ToString() ?? "null"}");
                }

                Console.WriteLine();
            }

            var valueQueries = new (string query, Func<string, Entity, Task<object>> getter)[]
            {
                ("$.a.b.c", async (query, entity) => await entity.EvalS(query)),
                ("$.a.b.e", async (query, entity) => await entity.EvalI(query)),
                ("$.a.b.d.length", async (query, entity) => await entity.EvalI(query)),
                ("a.b", async (query, entity) => await entity.EvalE(query)),
                ("$..[?(@.color=='blue')]", async (query, entity) => await entity.EvalE(query)),
                ("entity://testClass", async (query, entity) => (await entity.EvalE(query)).Value<TestClass>()),
                ("entity://testClass?Field1", async (query, entity) => await entity.EvalS(query)),
                ("entity://testClass?Property1", async (query, entity) => await entity.EvalS(query)),
                ("entity://testClass?Property2", async (query, entity) => await entity.EvalI(query)),
            };

            foreach (var valueQuery in valueQueries)
            {
                var value = await valueQuery.getter(valueQuery.query, testEntity);
                Console.WriteLine($"Query: {valueQuery.query} Value: {value} ValueType: {value.GetType()}");
            }

            Console.WriteLine();

            var arrayQuery = "$.a.b.d.*";
            Console.WriteLine($"Query: {arrayQuery}");
            Console.WriteLine($"JsonPath:");
            Console.WriteLine($"\t{string.Join($"{Environment.NewLine}\t", JsonPath.Parse(arrayQuery).Evaluate(testJsonDocument.RootElement).Matches.Select(m => $"Query: {m.Location} Data: {m.Value}"))}");
            Console.WriteLine("Entity:");
            await foreach (var result in testEntity.Eval(arrayQuery))
            {
                Console.WriteLine($"\tQuery: {result.Query} Data: {result} GetS: {await result.EvalS("@")}");
            }

            Console.WriteLine();

            var absoluteQueries = new[]
            {
                "config://3aeeb2b6-c556-4854-a679-46ea73a6f1c7?thread_group_id.thread_group_type[?(@==\"multiton\")]",
                "config://3aeeb2b6-c556-4854-a679-46ea73a6f1c7?thread_group_id.thread_group_type[?(@!=\"multiton\")]",
                "config://3aeeb2b6-c556-4854-a679-46ea73a6f1c7?$meta.id",
                "entity://testDocument?$.a.b",
                "entity://refTestParentDocument?a.x",
                "entity://refTestParentDocument?a.$ref",
                "memory://thread?$.threadVariable1",
                "entity://refTestParentDocument?c",
                "config://5f78294e-44b8-4ab9-a893-4041060ae0ea?RsConfigId",
                "entity://refTestParentDocument?d",
                "entity://testDocument?$.a.b.c",
                "entity://testDocument?$.a.b.c.Replace(\"string\", \"COOL STRING\")",
                "entity://testDocument?$.a.b.c.repeat(4)",
                "entity://testDocument?$.a.b.c.Replace(\"string\", \"COOL STRING\").repeat(4)",
                "entity://testDocument?$.a.b.d",
                "entity://testDocument?$.a.b.d.Replace(\"e\", \"E\")",
                "entity://testDocument?$.a.b.c.suppress(true)",
                "entity://testDocument?$.a.b.c.suppress(false)",
                "entity://testClass?Property1",
                "entity://testClass?TestClass2",
                "entity://testClass?TestClass2.Property3",
                "entity://testDocument?$.a.b.c.ToUpper()",
                "entity://testDocument?$.a.b.d.ToUpper()",
            };

            foreach (var absoluteQuery in absoluteQueries)
            {
                Console.WriteLine($"Query: {absoluteQuery}");
                Console.WriteLine("Entity:");
                await foreach (var result in E.Eval(absoluteQuery))
                {
                    Console.WriteLine($"\t{result?.ToString() ?? "null"}");
                }

                Console.WriteLine();
            }
        }
    }
}
