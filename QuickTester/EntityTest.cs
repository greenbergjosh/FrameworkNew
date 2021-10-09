using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Json.Path;
using Utility.Entity;

namespace QuickTester
{
    class EntityTest
    {
        internal static async Task Run()
        {
            var testDocument = @"{
	""a"": {
		""b"": {
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

            var E = Entity.Initialize(new Dictionary<string, EntityParser>
            {
                ["application/json"] = EntityDocumentJson.Parse
            }, new Dictionary<string, EntityRetriever>
            {
                ["entity"] = (entity, uri) =>
                {
                    if (uri.Host == "testdocument")
                    {
                        return entity.Parse("application/json", testDocument);
                    }

                    throw new Exception($"Unknown entity: {uri.Host}");
                }
            });

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
                "$.a.b['c']",
                "$.a.b[\"c\"]",
                "$.a.b.d[0:2:1]",
                "$.a.b.f[::2]",
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
            };

            foreach (var query in queries)
            {
                var jsonPath = JsonPath.Parse(query);
                var jsonPathResult = jsonPath.Evaluate(testJsonDocument.RootElement);

                Console.WriteLine($"Query: {query}");
                Console.WriteLine($"JsonPath:");
                Console.WriteLine(string.Join(Environment.NewLine, jsonPathResult.Matches.Select(m => $"Query: {m.Location} Data: {m.Value}")));
                Console.WriteLine("Entity:");

                foreach (var result in await testEntity.Evaluate(query))
                {
                    Console.WriteLine(result?.ToString() ?? "null");
                }
                Console.WriteLine();
            }

            var valueQueries = new (string query, Func<string, Entity, Task<object>> getter)[]
            {
                ("$.a.b.c", async (query, entity) => await entity.GetS(query)),
                ("$.a.b.e", async (query, entity) => await entity.GetI(query)),
                ("$.a.b.d.length", async (query, entity) => await entity.GetI(query)),
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
            Console.WriteLine(string.Join(Environment.NewLine, JsonPath.Parse(arrayQuery).Evaluate(testJsonDocument.RootElement).Matches.Select(m => $"Query: {m.Location} Data: {m.Value}")));
            Console.WriteLine("Entity:");
            foreach (var result in await testEntity.GetL(arrayQuery))
            {
                Console.WriteLine($"{result} GetS: {await result.GetS("$")}");
            }
            Console.WriteLine();

            var absoluteQuery = "entity://testDocument?$.a.b";
            Console.WriteLine($"Query: {absoluteQuery}");
            Console.WriteLine("Entity:");
            foreach (var result in await E.Evaluate(absoluteQuery))
            {
                Console.WriteLine(result?.ToString() ?? "null");
            }
            Console.WriteLine();
        }
    }
}
