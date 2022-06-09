using Framework.Core.Evaluatable;
using Framework.Core.Evaluatable.EvalProviders;
using Framework.Core.Evaluatable.MemoryProviders;

namespace Framework.Core.Tests
{
    [TestClass]
    public class EvaluatorTest
    {
        private readonly Evaluator _evaluator;
        private readonly Core.Entity.Entity _entity;

        public EvaluatorTest()
        {
            var memoryProvider = new InMemoryJsonSerializedMemoryProvider();

            var roslynWrapper = new RoslynWrapper<EvaluateRequest, EvaluateResponse>("");

            var evalProviders = new Dictionary<string, IEvalProvider>
            {
                ["Constant"] = new ConstantEvalProvider(),
                ["Dynamic"] = new DynamicCSharpEvalProvider(roslynWrapper)
            };

            _evaluator = Evaluator.Create(new EvaluatorConfig(memoryProvider, evalProviders));

            _entity = Core.Entity.Entity.Initialize(new Core.Entity.EntityConfig(_evaluator, null));
        }

        [TestMethod]
        public async Task EvaluateConstant()
        {
            var constant = _entity.Create(42);

            var providerName = "Constant";
            var providerParameters = constant;

            var response = await _evaluator.Evaluate(providerName, providerParameters, Core.Entity.Entity.Undefined);

            Assert.IsTrue(response.Complete);
            Assert.AreEqual(constant.Value<int>(), response.Entity.Value<int>());
        }

        [TestMethod]
        public async Task EvaluateDynamic()
        {
            var parameters = _entity.Create(new
            {
                param1 = 42
            });

            var providerName = "Dynamic";
            var providerParameters = _entity.Create(new
            {
                code = @"
using Framework.Core.Evaluatable;
using Framework.Core.Entity;

var param1 = await Parameters.GetRequired<int>(""param1"", Parameters);
return new EvaluateResponse(true, param1 + 1);
"
            });

            var response = await _evaluator.Evaluate(providerName, providerParameters, parameters);

            Assert.IsTrue(response.Complete);
            Assert.AreEqual(43, response.Entity.Value<int>());
        }
    }
}