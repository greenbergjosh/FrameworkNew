using Framework.Core.Entity;
using Framework.Core.Entity.Implementations;
using Framework.Core.Evaluatable;
using Framework.Core.Evaluatable.EvalProviders;
using Framework.Core.Evaluatable.MemoryProviders;
using System.Text.Json;

namespace Framework.Core.Tests
{
    [TestClass]
    public class EntityTest
    {
        private readonly Evaluator _evaluator;
        private readonly Entity.Entity _entity;
        private readonly IEntityEvalHandler _entityEvalHandler = new StandardJsonEntityEvalHandler();

        public EntityTest()
        {
            var memoryProvider = new InMemoryJsonSerializedMemoryProvider();

            var roslynWrapper = new RoslynWrapper<EvaluateRequest, EvaluateResponse>("");

            var evalProviders = new Dictionary<string, IEvalProvider>
            {
                ["Constant"] = new ConstantEvalProvider(),
                ["Dynamic"] = new DynamicCSharpEvalProvider(roslynWrapper)
            };

            _evaluator = Evaluator.Create(new EvaluatorConfig(memoryProvider, evalProviders));

            _entity = Entity.Entity.Initialize(new Entity.EntityConfig(_evaluator));
        }

        [TestMethod]
        public async Task ThrowIfNoEvalHandler()
        {
            var exception = await Assert.ThrowsExceptionAsync<InvalidOperationException>(async () => await _entity.Evaluate(Entity.Entity.Undefined));
            Assert.AreEqual("This entity has no eval handler", exception.Message);
        }

        [TestMethod]
        public void GetEntityFromConfigDb()
        {
            var entityId = Guid.Parse("0086226a-d81d-4c74-983d-24f232eba731");

            var entity = GetFromConfigDb(_entity, entityId);

            Assert.AreEqual(42, entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateConstantShorthandIntEntityFromConfigDb()
        {
            var entityId = Guid.Parse("0086226a-d81d-4c74-983d-24f232eba731");

            var entity = GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(Entity.Entity.Undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateConstantIntEntityFromConfigDb()
        {
            var entityId = Guid.Parse("c3a5a51f-ff96-4a06-bfcc-18daaef2453b");

            var entity = GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(Entity.Entity.Undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        public async Task EvaluateConstantShorthandStringEntityFromConfigDb()
        {
            var entityId = Guid.Parse("211a0e51-d9b3-4f12-8a88-293d72f29280");

            var entity = GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(Entity.Entity.Undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual("Hello World", result.Entity.Value<string>());
        }

        [TestMethod]
        public async Task EvaluateConstantStringEntityFromConfigDb()
        {
            var entityId = Guid.Parse("eb7944eb-2b9c-41a9-abfe-77c887370a83");

            var entity = GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(Entity.Entity.Undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual("Hello World", result.Entity.Value<string>());
        }

        [TestMethod]
        public async Task EvaluateConstantShorthandObjectEntityFromConfigDb()
        {
            var entityId = Guid.Parse("0fd44eef-578a-4b3d-8ca8-2b89dc20ec30");

            var entity = GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(Entity.Entity.Undefined);

            Assert.IsTrue(result.Complete);

            var (found, color) = await result.Entity.TryGetProperty("color");
            Assert.IsTrue(found);
            Assert.AreEqual("red", color.Value<string>()); 
        }

        [TestMethod]
        public async Task EvaluateConstantObjectEntityFromConfigDb()
        {
            var entityId = Guid.Parse("c3041fc7-8de3-477d-b668-c550bc883a49");

            var entity = GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(Entity.Entity.Undefined);

            Assert.IsTrue(result.Complete);

            var (found, color) = await result.Entity.TryGetProperty("color");
            Assert.IsTrue(found);
            Assert.AreEqual("red", color.Value<string>());
        }

        private Entity.Entity GetFromConfigDb(Entity.Entity baseEntity, Guid id)
        {
            var entities = JsonDocument.Parse(File.ReadAllText("ConfigDB.json")).RootElement;
            var entity = entities.GetProperty(id.ToString());

            return baseEntity.Create(new EntityDocumentJson(entity), _entityEvalHandler);
        }
    }

    public class StandardJsonEntityEvalHandler : IEntityEvalHandler
    {
        public async Task<(string providerName, Entity.Entity providerParameters)> HandleEntity(Entity.Entity entity)
        {
            var (evaluateFound, evaluate) = await entity.TryGetProperty("$evaluate");
            if (!evaluateFound)
            {
                return (ConstantEvalProvider.Name, entity.Create(new
                {
                    value = entity
                }));
            }

            var providerName = await evaluate.GetRequiredString("provider");
            return (providerName, evaluate);
        }
    }
}
