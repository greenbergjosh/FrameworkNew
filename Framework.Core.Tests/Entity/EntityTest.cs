using Framework.Core.Entity;
using Framework.Core.Entity.Implementations;
using Framework.Core.Evaluatable;
using Framework.Core.Evaluatable.EvalProviders;
using Framework.Core.Evaluatable.MemoryProviders;
using System.Text.Json;

namespace Framework.Core.Tests.Entity
{
    [TestClass]
    public class EntityTest
    {
        private readonly Evaluator _evaluator;
        private readonly Core.Entity.Entity _entity;
        private readonly IEntityEvalHandler _entityEvalHandler = new StandardJsonEntityEvalHandler();
        private readonly Core.Entity.Entity _undefined = Core.Entity.Entity.Undefined;

        public EntityTest()
        {
            var memoryProvider = new InMemoryJsonSerializedMemoryProvider();

            var roslynWrapper = new RoslynWrapper<EvaluateRequest, EvaluateResponse>("");

            var evalProviders = new Dictionary<string, IEvalProvider>
            {
                ["Constant"] = new ConstantEvalProvider(),
                ["DynamicCSharp"] = new DynamicCSharpEvalProvider(roslynWrapper),
                ["StaticCSharp"] = new StaticCSharpEvalProvider(),
                ["Pfa"] = new PfaEvalProvider(),
            };

            _evaluator = Evaluator.Create(new EvaluatorConfig(memoryProvider, evalProviders));

            _entity = Core.Entity.Entity.Initialize(new EntityConfig(_evaluator));
        }

        [TestMethod]
        public async Task ThrowIfNoEvaluator()
        {
            var exception = await Assert.ThrowsExceptionAsync<InvalidOperationException>(async () => await _undefined.Evaluate(_undefined));
            Assert.AreEqual("This entity has no evaluator", exception.Message);
        }

        [TestMethod]
        public void GetEntityFromConfigDb()
        {
            var entityId = Guid.Parse("0086226a-d81d-4c74-983d-24f232eba731");

            var entity = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, entityId);

            Assert.AreEqual(42, entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateConstantShorthandIntEntityFromConfigDb()
        {
            var entityId = Guid.Parse("0086226a-d81d-4c74-983d-24f232eba731");

            var entity = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateConstantIntEntityFromConfigDb()
        {
            var entityId = Guid.Parse("c3a5a51f-ff96-4a06-bfcc-18daaef2453b");

            var entity = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        public async Task EvaluateConstantShorthandStringEntityFromConfigDb()
        {
            var entityId = Guid.Parse("211a0e51-d9b3-4f12-8a88-293d72f29280");

            var entity = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual("Hello World", result.Entity.Value<string>());
        }

        [TestMethod]
        public async Task EvaluateConstantStringEntityFromConfigDb()
        {
            var entityId = Guid.Parse("eb7944eb-2b9c-41a9-abfe-77c887370a83");

            var entity = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual("Hello World", result.Entity.Value<string>());
        }

        [TestMethod]
        public async Task EvaluateConstantShorthandObjectEntityFromConfigDb()
        {
            var entityId = Guid.Parse("0fd44eef-578a-4b3d-8ca8-2b89dc20ec30");

            var entity = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);

            var color = await result.Entity.GetRequiredString("color");
            Assert.AreEqual("red", color);
        }

        [TestMethod]
        public async Task EvaluateConstantObjectEntityFromConfigDb()
        {
            var entityId = Guid.Parse("c3041fc7-8de3-477d-b668-c550bc883a49");

            var entity = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);

            var color = await result.Entity.GetRequiredString("color");
            Assert.AreEqual("red", color);
        }

        [TestMethod]
        public async Task EvaluateDynamicCSharpEntityFromConfigDb()
        {
            var entityId = Guid.Parse("d6a1f3ab-0f8b-4de3-b8ab-54cebe9a5920");

            var entity = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateStaticCSharpEntityFromConfigDb()
        {
            var entityId = Guid.Parse("9f48b14b-8fd4-4eb2-a4ab-caa5828a128e");

            var entity = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluatePlusOneFromConfigDb()
        {
            var entityId = Guid.Parse("7f984dad-e6e0-4f2d-ae0d-ecec9dcc10d0");

            var entity = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, entityId);

            var random = new Random();

            var param1 = random.Next();

            var parameters = _entity.Create(new
            {
                param1
            });

            var result = await entity.Evaluate(parameters);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(param1 + 1, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateApplyParam1ToParam2()
        {
            var applyParam1ToParam2EntityId = Guid.Parse("1ddd3def-e80b-4877-84e3-571e3736b87a");
            var plusOneEntityId = Guid.Parse("7f984dad-e6e0-4f2d-ae0d-ecec9dcc10d0");

            var applyParam1ToParam2Entity = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, applyParam1ToParam2EntityId);
            var plusOneEntity = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, plusOneEntityId);

            var random = new Random();

            var param1 = random.Next();

            var parameters = _entity.Create(new
            {
                param1,
                param2 = plusOneEntity
            });

            var result = await applyParam1ToParam2Entity.Evaluate(parameters);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(param1 + 1, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateApplyParam1ToQuotedParam2()
        {
            var applyParam1ToQuotedParam2EntityId = Guid.Parse("87846315-093d-48ad-a216-5b320b70186c");
            var quotedPlusOneEntityId = Guid.Parse("76157733-7ee0-4af3-af17-cdaffb31dbd8");

            var applyParam1ToQuotedParam2Entity = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, applyParam1ToQuotedParam2EntityId);
            var quotedPlusOneEntity = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, quotedPlusOneEntityId);

            var random = new Random();

            var param1 = random.Next();

            var parameters = _entity.Create(new
            {
                param1,
                param2 = quotedPlusOneEntity
            });

            var result = await applyParam1ToQuotedParam2Entity.Evaluate(parameters);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(param1 + 1, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateHardCodedPfa()
        {
            var pfaEntityId = Guid.Parse("a6a6f0d9-7703-444a-957a-6a1f6acf6567");

            var pfa = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, pfaEntityId);

            var result = await pfa.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateShorthandPfa()
        {
            var pfaEntityId = Guid.Parse("a979ee89-43d1-40bd-b9f6-01210522a8cc");

            var pfa = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, pfaEntityId);

            var result = await pfa.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluatePartiallyAppliedHardCodedPfa()
        {
            // Pfa is the Sum entity bound with left: 2
            var plus2EntityId = Guid.Parse("71a86345-d21f-4213-ada4-9b0ff59d5c5d");

            var plus2 = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, plus2EntityId);

            var parameters = _entity.Create(new
            {
                right = 40
            });

            var result = await plus2.Evaluate(parameters);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateNestedPfa()
        {
            // Pfa is a nested Linear Equation entity bound at one level with x: 5 and
            // another level with m: 8
            var boundLinearEquationEntityId = Guid.Parse("bd1c69d5-54ae-47d3-a5bd-4b70cdf78997");

            var boundLinearEquation = StandardJsonEntityEvalHandler.GetFromConfigDb(_entity, boundLinearEquationEntityId);

            var parameters = _entity.Create(new
            {
                b = 2
            });

            var result = await boundLinearEquation.Evaluate(parameters);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }
    }

    public class StandardJsonEntityEvalHandler : IEntityEvalHandler
    {
        public async Task<(string providerName, Core.Entity.Entity providerParameters)> HandleEntity(Core.Entity.Entity entity, Core.Entity.Entity parameters)
        {
            // The EntityEvalHandler knows the shape of the stored entity and how to interpret that shape.
            var (evaluateFound, evaluate) = await entity.TryGetProperty("$evaluate", parameters);
            if (!evaluateFound)
            {
                // No evalute, so use the constant provider
                return (ConstantEvalProvider.Name, entity);
            }

            // TODO: Look for $eref and any other special names

            var providerName = await evaluate.GetRequiredString("provider", parameters);
            if (providerName == ConstantEvalProvider.Name)
            {
                // Go to the document directly because we want to avoid evaluation/recursion of this property.
                // This gives us a base-case for evaluation, and also gives us free quoting by wrapping an entity
                // in a Constant provider.
                var (valueFound, value) = await evaluate.Document.TryGetProperty("value");
                if (!valueFound)
                {
                    throw new InvalidOperationException("`value` is required.");
                }

                return (ConstantEvalProvider.Name, value);
            }
            else if (providerName == PfaEvalProvider.Name)
            {
                // This is short-hand for pointing to another entity in the current "database"
                var (entityIdFound, entityId) = await evaluate.TryGetProperty("entityId", parameters);
                if (entityIdFound)
                {
                    var targetEntity = GetFromConfigDb(entity, entityId.Value<Guid>());
                    return (providerName, entity.Create(new
                    {
                        entity = QuoteEntity(targetEntity),
                        parameters = await evaluate.GetRequiredProperty("parameters", parameters)
                    }));
                }
            }

            return (providerName, evaluate);
        }

        private static readonly StandardJsonEntityEvalHandler _instance = new();

        public static Core.Entity.Entity GetFromConfigDb(Core.Entity.Entity baseEntity, Guid id)
        {
            var entities = JsonDocument.Parse(File.ReadAllText("Entity/ConfigDB.json")).RootElement;
            var entity = entities.GetProperty(id.ToString());

            // This is equivalent to the scheme knowing which EntityEvalHandler to use.
            return baseEntity.Create(new EntityDocumentJson(entity, _instance));
        }

        private static Core.Entity.Entity QuoteEntity(Core.Entity.Entity entity)
        {
            return entity.Create(new Dictionary<string, Core.Entity.Entity>
            {
                ["$evaluate"] = entity.Create(new
                {
                    provider = ConstantEvalProvider.Name,
                    value = entity
                })
            });
        }
    }
}
