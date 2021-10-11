﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Json.Path;
using Utility;
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

            var refTestParentDocument = @"{
    ""a"": {
        ""$ref"": ""entity://refTestChildDocument""
    },
    ""b"": 5,
    ""c"": {
        ""$ref"": ""memory://thread?$.threadVariable1""
    }
}";
            var refTestChildDocument = @"{
    ""x"": 50
}";

            var threadState = new EntityDocumentObject(new Dictionary<string, object>()
            {
                ["threadVariable1"] = 20
            });

            var processState = new EntityDocumentObject(new Dictionary<string, object>()
            {
                ["processVariable1"] = "Hello there"
            });

            var fw = new FrameworkWrapper();

            var E = Entity.Initialize(new Dictionary<string, EntityParser>
            {
                ["application/json"] = (entity, json) => EntityDocumentJson.Parse(json)
            }, new Dictionary<string, EntityRetriever>
            {
                ["entity"] = (entity, uri) => uri.Host switch
                {
                    "testdocument" => entity.Parse("application/json", testDocument),
                    "reftestparentdocument" => entity.Parse("application/json", refTestParentDocument),
                    "reftestchilddocument" => entity.Parse("application/json", refTestChildDocument),
                    _ => GetEntity(fw, entity, uri.Host)
                },
                ["memory"] = (entity, uri) => Task.FromResult(Entity.Create(entity, uri.Host switch
                {
                    "thread" => threadState,
                    "process" => processState,
                    _ => throw new Exception($"Unknown memory location {uri.Host}"),
                }))
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

            var absoluteQueries = new[]
            {
                "entity://testDocument?$.a.b",
                "entity://refTestParentDocument?$.a.x",
                "memory://thread?$.threadVariable1",
                "entity://refTestParentDocument?$.c",
                "entity://5f78294e-44b8-4ab9-a893-4041060ae0ea?$.RsConfigId"
            };

            foreach (var absoluteQuery in absoluteQueries)
            {
                Console.WriteLine($"Query: {absoluteQuery}");
                Console.WriteLine("Entity:");
                foreach (var result in await E.Evaluate(absoluteQuery))
                {
                    Console.WriteLine(result?.ToString() ?? "null");
                }
                Console.WriteLine();
            }
        }

        private static async Task<Entity> GetEntity(FrameworkWrapper fw, Entity root, string entityId)
        {
            var id = Guid.Parse(entityId);
            var entity = await fw.Entities.GetEntity(id);
            return await root.Parse("application/json", entity.GetS("/Config"));
        }
    }
}
