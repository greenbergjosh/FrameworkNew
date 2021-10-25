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

            var fw = new FrameworkWrapper();

            static string UnescapeQueryString(Uri uri) => Uri.UnescapeDataString(uri.Query.TrimStart('?'));

            static async IAsyncEnumerable<Entity> functionHandler(IEnumerable<Entity> entities, string functionName, IReadOnlyList<Entity> functionArguments, string query)
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

            var E = Entity.Initialize(new EntityConfig(
                Parser: (entity, contentType, content) => contentType switch
                {
                    "application/json" => EntityDocumentJson.Parse(content),
                    _ => throw new InvalidOperationException($"Unknown contentType: {contentType}")
                },
                Retriever: async (entity, uri) => uri.Scheme switch
                {
                    "entity" => uri.Host switch
                    {
                        "testdocument" => (await entity.Parse("application/json", testDocument), UnescapeQueryString(uri)),
                        "reftestparentdocument" => (await entity.Parse("application/json", refTestParentDocument), UnescapeQueryString(uri)),
                        "reftestchilddocument" => (await entity.Parse("application/json", refTestChildDocument), UnescapeQueryString(uri)),
                        "reftestchilddocument2" => (await entity.Parse("application/json", refTestChildDocument2), UnescapeQueryString(uri)),
                        _ => (await GetEntity(fw, entity, uri.Host), UnescapeQueryString(uri))
                    },
                    "memory" => (entity.Create(uri.Host switch
                    {
                        "thread" => threadState,
                        "process" => processState,
                        _ => throw new Exception($"Unknown memory location {uri.Host}"),
                    }), UnescapeQueryString(uri)),
                    _ => throw new InvalidOperationException($"Unknown scheme: {uri.Scheme}")
                },
                MissingPropertyHandler: (entity, propertyName) =>
                {
                    Console.WriteLine($"Missing property `{propertyName}` in entity: {entity.Query}");
                    return Task.FromResult<EntityDocument>(null);
                },
                FunctionHandler: functionHandler
            ));

            var testEntity = await E.Parse("application/json", testDocument);
            var testJsonDocument = JsonDocument.Parse(testDocument);

            Console.WriteLine($"Document: {testEntity}");
            Console.WriteLine();

            var queries = new[]
            {
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

                foreach (var result in await testEntity.Evaluate(query))
                {
                    Console.WriteLine($"\t{result?.ToString() ?? "null"}");
                }
                Console.WriteLine();
            }

            var valueQueries = new (string query, Func<string, Entity, Task<object>> getter)[]
            {
                ("$.a.b.c", async (query, entity) => await entity.GetS(query)),
                ("$.a.b.e", async (query, entity) => await entity.GetI(query)),
                ("$.a.b.d.length", async (query, entity) => await entity.GetI(query)),
                ("a.b", async (query, entity) => await entity.GetE(query)),
                ("$..[?(@.color=='blue')]", async (query, entity) => await entity.GetE(query)),
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
            foreach (var result in await testEntity.Get(arrayQuery))
            {
                Console.WriteLine($"\t{result} GetS: {await result.GetS("@")}");
            }
            Console.WriteLine();

            var absoluteQueries = new[]
            {
                "entity://3aeeb2b6-c556-4854-a679-46ea73a6f1c7?thread_group_id.thread_group_type[?(@!=\"multiton\")]",
                "entity://3aeeb2b6-c556-4854-a679-46ea73a6f1c7?$id",
                "entity://testDocument?$.a.b",
                "entity://refTestParentDocument?a.x",
                "entity://refTestParentDocument?a.$ref",
                "memory://thread?$.threadVariable1",
                "entity://refTestParentDocument?c",
                "entity://5f78294e-44b8-4ab9-a893-4041060ae0ea?RsConfigId",
                "entity://refTestParentDocument?d",
                "entity://testDocument?$.a.b.c",
                "entity://testDocument?$.a.b.c.replace(\"string\", \"COOL STRING\")",
                "entity://testDocument?$.a.b.c.repeat(4)",
                "entity://testDocument?$.a.b.d",
                "entity://testDocument?$.a.b.d.replace(\"e\", \"E\")",
                "entity://testDocument?$.a.b.c.suppress(true)",
                "entity://testDocument?$.a.b.c.suppress(false)",
            };

            foreach (var absoluteQuery in absoluteQueries)
            {
                Console.WriteLine($"Query: {absoluteQuery}");
                Console.WriteLine("Entity:");
                foreach (var result in await E.Evaluate(absoluteQuery))
                {
                    Console.WriteLine($"\t{result?.ToString() ?? "null"}");
                }
                Console.WriteLine();
            }
        }

        private static async Task<Entity> GetEntity(FrameworkWrapper fw, Entity root, string entityId)
        {
            var id = Guid.Parse(entityId);
            var entity = await fw.Entities.GetEntity(id);
            entity.Set("/Config/$id", id);
            entity.Set("/Config/$name", entity.GetS("/Name"));
            return await root.Parse("application/json", entity.GetS("/Config"));
        }
    }
}
