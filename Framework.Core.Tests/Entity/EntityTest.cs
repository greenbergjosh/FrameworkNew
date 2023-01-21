using Framework.Core.Entity;
using Framework.Core.Entity.Implementations;
using Framework.Core.Evaluatable;
using Framework.Core.Evaluatable.EvalProviders;
using Framework.Core.Evaluatable.MemoryProviders;
using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Serialization;

// Storage and an Entity seem the same. Getting an entity from an entity is the same
// as getting an entity from storage - both use the []
// Alternatively there is evaluation of an entity which uses ()

namespace Framework.Core.Tests.Entity
{
    [TestClass]
    public class EntityTest
    {
        private readonly Evaluator _evaluator;
        private readonly Core.Entity.Entity _entity;
        private readonly Core.Entity.Entity _undefined = Core.Entity.Entity.Undefined;
        private readonly Random _random = new();
        private readonly StandardJsonEntityEvalHandler _storage1 = new("Storage 1");
        private readonly StandardJsonEntityEvalHandler _storage2 = new("Storage 2");

        public EntityTest()
        {
            var memoryProvider = new InMemoryJsonSerializedMemoryProvider();

            var roslynWrapper = new RoslynWrapper<EvaluateRequest, EvaluateResponse>("");

            var evalProviders = new Dictionary<string, EvalProvider>
            {
                [ConstantEvalProvider.Name] = ConstantEvalProvider.Evaluate,
                [DynamicCSharpEvalProvider.Name] = new DynamicCSharpEvalProvider(roslynWrapper).Evaluate,
                [StaticCSharpEvalProvider.Name] = StaticCSharpEvalProvider.Evaluate,
                [PfaEvalProvider.Name] = PfaEvalProvider.Evaluate,
                [ERefEvalProvider.Name] = ERefEvalProvider.Evaluate
            };

            _evaluator = Evaluator.Create(new EvaluatorConfig(memoryProvider, evalProviders));

            _entity = Core.Entity.Entity.Initialize(new EntityConfig(_evaluator, ResolveEntity));
        }

        private Task<Core.Entity.Entity> ResolveEntity(Core.Entity.Entity baseEntity, Uri uri)
        {
            return Task.FromResult(uri.Scheme switch
            {
                "config" => _storage1.GetFromConfigDb(baseEntity, Guid.Parse(uri.Host)),
                "config2" => _storage2.GetFromConfigDb(baseEntity, Guid.Parse(uri.Host)),
                _ => Core.Entity.Entity.Unhandled
            });
        }

        [TestMethod]
        public async Task ThrowIfNoEvaluator()
        {
            var exception = await Assert.ThrowsExceptionAsync<InvalidOperationException>(async () => await _undefined.Evaluate(_undefined));
            Assert.AreEqual("This entity has no evaluator", exception.Message);
        }

        /*
         * dynamic applyParam2ToParam1Entity = await _entity["config://111d3def-e80b-4877-84e3-571e3736b87a"];
            var quotedPlusOneEntity = await _entity["config://76157733-7ee0-4af3-af17-cdaffb31dbd8"];

            var param1 = _random.Next();
            // Evaluate an entity (passing in parameters)
            // The evaluate response contains the g-pair, the result, what else? Is the response an Entity?
            var result = await applyParam2ToParam1Entity(new { param1, param2 = quotedPlusOneEntity });

         */

        [TestMethod]
        public void GetEntityFromConfigDb()
        {
            var entityId = Guid.Parse("0086226a-d81d-4c74-983d-24f232eba731");

            var entity = _storage1.GetFromConfigDb(_entity, entityId);

            Assert.AreEqual(42, entity.Value<int>());
        }

        
        [TestMethod]
        public async Task EvaluateConstantShorthandIntEntityFromConfigDb()
        {
            var entityId = Guid.Parse("0086226a-d81d-4c74-983d-24f232eba731");

            var entity = _storage1.GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task GetAndEvaluateConstantShorthandIntEntityFromConfigDbSyntax()
        {
            dynamic entity = await _entity["config://0086226a-d81d-4c74-983d-24f232eba731"];
            var result = await entity(_undefined);
            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, entity.Value<int>());
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateConstantIntEntityFromConfigDb()
        {
            var entityId = Guid.Parse("c3a5a51f-ff96-4a06-bfcc-18daaef2453b");

            var entity = _storage1.GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateConstantIntEntityFromConfigDbSyntax()
        {
            dynamic entity = await _entity["config://c3a5a51f-ff96-4a06-bfcc-18daaef2453b"];
            var result = await entity(_undefined);
            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, entity.Value<int>());
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        public async Task EvaluateConstantShorthandStringEntityFromConfigDb()
        {
            var entityId = Guid.Parse("211a0e51-d9b3-4f12-8a88-293d72f29280");

            var entity = _storage1.GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual("Hello World", result.Entity.Value<string>());
        }

        [TestMethod]
        public async Task EvaluateConstantStringEntityFromConfigDb()
        {
            var entityId = Guid.Parse("eb7944eb-2b9c-41a9-abfe-77c887370a83");

            var entity = _storage1.GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual("Hello World", result.Entity.Value<string>());
        }

        [TestMethod]
        public async Task EvaluateConstantShorthandObjectEntityFromConfigDb()
        {
            var entityId = Guid.Parse("0fd44eef-578a-4b3d-8ca8-2b89dc20ec30");

            var entity = _storage1.GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);

            var color = await result.Entity.GetRequiredString("color");
            Assert.AreEqual("red", color);
        }

        [TestMethod]
        public async Task EvaluateConstantObjectEntityFromConfigDb()
        {
            var entityId = Guid.Parse("c3041fc7-8de3-477d-b668-c550bc883a49");

            var entity = _storage1.GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);

            var color = await result.Entity.GetRequiredString("color");
            Assert.AreEqual("red", color);
        }

        [TestMethod]
        public async Task EvaluateDynamicCSharpEntityFromConfigDb()
        {
            var entityId = Guid.Parse("d6a1f3ab-0f8b-4de3-b8ab-54cebe9a5920");

            var entity = _storage1.GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateStaticCSharpEntityFromConfigDb()
        {
            var entityId = Guid.Parse("9f48b14b-8fd4-4eb2-a4ab-caa5828a128e");

            var entity = _storage1.GetFromConfigDb(_entity, entityId);

            var result = await entity.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluatePlusOneFromConfigDb()
        {
            var entityId = Guid.Parse("7f984dad-e6e0-4f2d-ae0d-ecec9dcc10d0");

            var entity = _storage1.GetFromConfigDb(_entity, entityId);

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
        public async Task EvaluateApplyParam2ToParam1()
        {
            var applyParam2ToParam1EntityId = Guid.Parse("111d3def-e80b-4877-84e3-571e3736b87a");
            var quotedPlusOneEntityId = Guid.Parse("76157733-7ee0-4af3-af17-cdaffb31dbd8");

            var applyParam2ToParam1Entity = _storage1.GetFromConfigDb(_entity, applyParam2ToParam1EntityId);
            var quotedPlusOneEntity = _storage1.GetFromConfigDb(_entity, quotedPlusOneEntityId);

            var param1 = _random.Next();

            var parameters = _entity.Create(new
            {
                param1,
                param2 = quotedPlusOneEntity
            });

            var result = await applyParam2ToParam1Entity.Evaluate(parameters);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(param1 + 1, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateApplyParam2ToParam1Syntax()
        {
            // Get an entity from storage without evaluation
            dynamic applyParam2ToParam1Entity = await _entity["config://111d3def-e80b-4877-84e3-571e3736b87a"];
            var quotedPlusOneEntity = await _entity["config://76157733-7ee0-4af3-af17-cdaffb31dbd8"];

            var param1 = _random.Next();
            // Evaluate an entity (passing in parameters)
            // The evaluate response contains the g-pair, the result, what else? Is the response an Entity?
            var result = await applyParam2ToParam1Entity(new { param1, param2 = quotedPlusOneEntity });

            //www.codetraveler.io/NDCOslo-AsyncAwait

            // The above code is an imperative approach to using the framework
            // We are getting the parameter 'quotedPlusOneEntity' explicitly, and then passing it to another explicit entity
            // A single query should be able to express this
            // _entity(query)
            // _entity is the entry point into the entire system, it's not really an entity unless we somehow identify
            //   it as the topmost entity of all eval trees
            // If it is an entity, it doesn't seem to have a representation in any underlying storage
            // We still need to
            // 1. Convert incoming request to eval (could be done in many ways, not really part of framework)
            // 2. Calltable
            // 3. QueryLanguage provider
            // 4. Sref, eref providers

            // Request enters the system (in this function we are building the request, but normally we'd convert some
            //      request structure (e.g. http querystring) into a request)
            // Get the top level entity required for the request (the top level may be a well-known entity or it may be
            //      an entity implied/determined/specified by the request structure)
            //   The getter [] has a plugin for caching
            //   The getter [] uses the
            //      Scheme and implied Resolver to find the entity storage location
            //      The Handler to lift the storage format into Entity
            // Get any other entities implied by the request structure
            // Kick off the evaluation of top level entities (up to the app to determine if one or more top levels)
            //   The result of the top level evaluation is a pair of g's, a resultEntity, and other flags (e.g. completed)
            //   The evaluation of an entity is always delegated to the entity's Provider

            // Resolver --> Handler --> EvalProvider

            // Where does the query language fit in?
            //  The query language is just a provider (does eref subsume qref? should they be separate?)
            // How are parameters passed and intepreted?
            //  1. No passing of reference to entity
            //  2. Shared entities are named, not passed on stack - creator manages lifetime of shared entity (and hence history)

            // The handler/resolver/mapthunk is eta
            // What is mu? It is the composition of entities operator
            // [] 3 -> [3]
            // [[3]] -> [3]    [] [] 3 -> [3]   [[2,3],[4,5]] -> [2,3,4,5]    [ [[a],[b]], [[c],[d]] ]
            // x
            //  provider:
            //  entity:
            // Once an object is lifted into entity it can be evaluated (by its provider)
            // What would it mean to lift a lifted entity - that would be mu
            // It is an entity of an entity which we can intepret
            // Is the provider (and possibly the function it points to) our map operation?
            // Are we applying a function to something hat has been lifted into entity?
            // Map, Lift, Flatten
            // 1=>e(1), 2=>e(2), plus1=>e(plus1)    plus1::int->int
            // plus1 1 == 2
            // e(plus1) e(1) == e(2)    e(plus1)::e(int)->e(int)
            // A handler lifts 1 to e(1) and, potentially a different handler, lifts plus1 to e(plus1)
            // If I want to apply plus1 to 1, I lift both then apply
            // If I have an entity that points to other entities, thereby forming a tree of entities, I can evalaute that tree
            // I would like mu to result in the hypothetical entity that would behave the same as having evaluated the tree

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(param1 + 1, result.Entity.Value<int>());
        }

        // Get entity (may not be strictly necessary in general, just evaluate the incoming query string)
        // Evaluate entity (again, just passing query to _entity will delegate to the specific entity as required)
        [TestMethod]
        public async Task EvaluateLeet4v7()
        {
            ///////////////////////////////////
            // var m = new Meme(); // place A and B in scope

            // If the entity is an array, it should support indexers
            // We could make the base entity type support indexer syntax
            //   (like javascript, but with obvious return self for primitives and index 0)
            // This is separate from evalpath syntax which could also be used to get an item from a particular index
            // Assigning meme paths to local parms should have a simple, dynamic syntax (e.g. to simplify swapping A and B here)
            var entityId = Guid.Parse("37aba1f7-fc25-418c-b0b3-a08d53058d75");
            var storage1Entity = _storage1.GetFromConfigDb(_entity, entityId);
            var A = await storage1Entity.GetRequiredProperty("A");
            var B = await storage1Entity.GetRequiredProperty("B");
            int i = 1;

            //if (A.Length > B.Length)
            //{
            //    var tmp = A;
            //    A = B;
            //    B = A;
            //}


            // Evaluate config entity that defines binding between median and traversal
            // Here, the config entity is just known - not exposing it outside of this method (e.g. as web endpoint)

            //return st.median;

        }

        [TestMethod]
        public async Task EvaluateApplyParam1ToParam2()
        {
            var applyParam1ToParam2EntityId = Guid.Parse("1ddd3def-e80b-4877-84e3-571e3736b87a");
            var plusOneEntityId = Guid.Parse("7f984dad-e6e0-4f2d-ae0d-ecec9dcc10d0");

            var applyParam1ToParam2Entity = _storage1.GetFromConfigDb(_entity, applyParam1ToParam2EntityId);
            var plusOneEntity = _storage1.GetFromConfigDb(_entity, plusOneEntityId);

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

            var applyParam1ToQuotedParam2Entity = _storage1.GetFromConfigDb(_entity, applyParam1ToQuotedParam2EntityId);
            var quotedPlusOneEntity = _storage1.GetFromConfigDb(_entity, quotedPlusOneEntityId);

            var param1 = _random.Next();

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

            var pfa = _storage1.GetFromConfigDb(_entity, pfaEntityId);

            var result = await pfa.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateShorthandPfa()
        {
            var pfaEntityId = Guid.Parse("a979ee89-43d1-40bd-b9f6-01210522a8cc");

            var pfa = _storage1.GetFromConfigDb(_entity, pfaEntityId);

            var result = await pfa.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluatePartiallyAppliedHardCodedPfa()
        {
            // Pfa is the Sum entity bound with left: 2
            var plus2EntityId = Guid.Parse("71a86345-d21f-4213-ada4-9b0ff59d5c5d");

            var plus2 = _storage1.GetFromConfigDb(_entity, plus2EntityId);

            var right = _random.Next();

            var parameters = _entity.Create(new
            {
                right
            });

            var result = await plus2.Evaluate(parameters);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(right + 2, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateNestedPfa()
        {
            // Pfa is a nested Linear Equation entity bound at one level with x: 5 and
            // another level with m: 8
            var boundLinearEquationEntityId = Guid.Parse("bd1c69d5-54ae-47d3-a5bd-4b70cdf78997");

            var boundLinearEquation = _storage1.GetFromConfigDb(_entity, boundLinearEquationEntityId);

            var b = _random.Next();

            var parameters = _entity.Create(new
            {
                b
            });

            var result = await boundLinearEquation.Evaluate(parameters);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual((8 * 5) + b, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateNestedPfaWithEvaluatedParameter()
        {
            // Pfa is a nested Linear Equation entity bound at one level with x (via eval): 5 and
            // another level with m: 8
            var boundLinearEquationEntityId = Guid.Parse("51f30765-f903-4001-a938-98b0ea097c2b");

            var boundLinearEquation = _storage1.GetFromConfigDb(_entity, boundLinearEquationEntityId);

            var b = _random.Next();

            var parameters = _entity.Create(new
            {
                b
            });

            var result = await boundLinearEquation.Evaluate(parameters);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual((8 * 5) + b, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateEref()
        {
            // Pfa is an eref to the PlusOne entity with an eref-chained param1: 41
            var plus1EntityId = Guid.Parse("1184373c-e8cb-479e-b2bd-c8c38a087a40");

            var plus1 = _storage1.GetFromConfigDb(_entity, plus1EntityId);

            var result = await plus1.Evaluate(_undefined);

            Assert.IsTrue(result.Complete);
            Assert.AreEqual(42, result.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EntityEvalHandlerFollowsEntity()
        {
            var entityId = Guid.Parse("0fd44eef-578a-4b3d-8ca8-2b89dc20ec30");

            Assert.AreNotEqual(_storage1, _storage2);

            var storage1Entity = _storage1.GetFromConfigDb(_entity, entityId);
            var storage2Entity = _storage2.GetFromConfigDb(_entity, entityId);

            ValidateHandler(storage1Entity, _storage1);
            ValidateHandler(storage2Entity, _storage2);

            var storage1A = await storage1Entity.GetRequiredProperty("a");
            var storage2A = await storage2Entity.GetRequiredProperty("a");

            ValidateHandler(storage1A, _storage1);
            ValidateHandler(storage2A, _storage2);

            var storage1AB = await storage1A.GetRequiredProperty("b");
            var storage2AB = await storage2A.GetRequiredProperty("b");

            ValidateHandler(storage1AB, _storage1);
            ValidateHandler(storage2AB, _storage2);

            // The "extra" property is an eref to config2 schema
            var storage1AExtra = await storage1A.GetRequiredProperty("extra");

            ValidateHandler(storage1AExtra, _storage2);

            static void ValidateHandler(Core.Entity.Entity entity, IEntityEvalHandler expectedHandler)
            {
                Assert.IsNotNull(entity.Document.EvalHandler);
                Assert.AreEqual(expectedHandler, entity.Document.EvalHandler);
            }
        }
    }
}
