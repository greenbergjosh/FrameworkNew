using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Utility;
using Utility.Entity;
using Utility.Entity.Implementations;

namespace QuickTester
{
    public class CastedEntity
    {
        public static Entity e;

        public CastedEntity() { }

        public CastedEntity(int b) { e = e.Create(b); }
        public CastedEntity(bool b) { e = e.Create(b); }

        public CastedEntity(string b) { e = e.Create(b); }

        public CastedEntity(dynamic d) { e = e.Create(d); }

        //public CastedEntity(var o) { e = e.Create(o); }

        public CastedEntity(Dictionary<string, CastedEntity> d) { e = e.Create(d); }

        public static implicit operator CastedEntity(int b) => new CastedEntity(b);
        public static implicit operator CastedEntity(bool b) => new CastedEntity(b);
        public static implicit operator CastedEntity(string s) => new CastedEntity(s);
        public static implicit operator CastedEntity(Dictionary<string, CastedEntity> d) => new CastedEntity(d);
        //public static implicit operator CastedEntity(dynamic o) => new CastedEntity(o);

        public CastedEntity this[string index]
        {
            set
            {
                Console.WriteLine("{0} was assigned to index {1}", value, index);
            }
        }

        public static CastedEntity TestReturn(Dictionary<string, CastedEntity> d) { return d; }

        public static async Task<int> Run()
        {
            var threadState = new EntityDocumentDictionary(new Dictionary<string, object>()
            {
                ["threadVariable1"] = 20
            });

            var fw = await FrameworkWrapper.Create(new EntityConfig(
                Retriever: async (entity, uri) => uri.Scheme switch
                {
                    "entity" => uri.Host switch
                    {

                        _ => throw new InvalidOperationException($"Unknown entity: {uri.Host}")
                    },
                    "memory" => (new[] {entity.Create(uri.Host switch
                    {
                        "thread" => threadState,
                        _ => throw new Exception($"Unknown memory location {uri.Host}"),
                    })}, UnescapeQueryString(uri)),
                    _ => throw new InvalidOperationException($"Unknown scheme: {uri.Scheme}")
                },
                MissingPropertyHandler: (entity, propertyName) =>
                {
                    if (propertyName != "$evaluate")
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

            try
            {
                e = fw.Entity;
                TestEntity("hello");
                CastedEntity i = 3;
                CastedEntity s = "bob";
                CastedEntity b = false;
                CastedEntity d = new() { ["a"] = 1, ["b"] = true };
                CastedEntity d2 = (dynamic)new { a = 1, b = true };
                CastedEntity d3 = CastedEntity.TestReturn(new() { ["a"] = 1, ["b"] = true });
            }
            catch (Exception e)
            {
                int i = 1;
            }

            return 1;

        }

        public static void TestEntity(CastedEntity e)
        {

        }

        
    }

    public static class CastedEntityExtension
    {
        static CastedEntity ToDictionary(this object obj)
        {
            CastedEntity.e = CastedEntity.e.Create(obj.GetType().GetProperties().Where(prop => prop.CanRead).ToDictionary(prop => prop.Name, prop => prop.GetValue(obj, null)));
            return new CastedEntity();
        }

    }
}
