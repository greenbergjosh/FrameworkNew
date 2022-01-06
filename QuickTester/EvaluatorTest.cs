using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Utility;
using Utility.Entity;
using Utility.Evaluatable;

namespace QuickTester
{
    public static class EvaluatorTest
    {
        public static async Task Run()
        {
            var fw = await FrameworkWrapper.Create();

            await EvaluateConstant(fw);
            await EvaluateSingleResult(fw);
            await EvaluateNoResult(fw);
            await EntityPathEvaluateSingleResult(fw);
            await EvaluateSequence(fw);
            await EntityPathEvaluateSequence(fw);
            await EntityPathEvaluateSequence(fw);
            await EntityMutator();
            await EvaluateWithParameters(fw);
            await EvaluatableEntity(fw);
            await EvaluatableEntityWithParameters(fw);
            await EvaluatableEntityWithActualParameters(fw);
            await EvaluatableEntityWithMergedParameters(fw);
        }

        private static async Task EvaluateConstant(FrameworkWrapper fw)
        {
            var constant = 5;

            var count = 0;
            await foreach (var result in fw.Evaluator.Evaluate(constant, null))
            {
                count++;
                Assert.AreEqual(constant, result);
            }

            Assert.AreEqual(1, count);
        }

        private class SingleResultEvaluator : IEvaluatable
        {
            private readonly Entity _result;

            public SingleResultEvaluator(Entity result) => _result = result;

            public Task<EvaluateResponse> Evaluate(EvaluateRequest request) => Task.FromResult(new EvaluateResponse(
                Entity: _result,
                Complete: true
            ));
        }

        private static async Task EvaluateSingleResult(FrameworkWrapper fw)
        {
            var constant = 5;

            var singleResult = fw.Entity.Create(new SingleResultEvaluator(constant));

            var count = 0;
            await foreach (var result in fw.Evaluator.Evaluate(singleResult, null))
            {
                count++;
                Assert.AreEqual(constant, result);
            }

            Assert.AreEqual(1, count);
        }

        private class NoResultEvaluator : IEvaluatable
        {
            public Task<EvaluateResponse> Evaluate(EvaluateRequest request) => Task.FromResult(new EvaluateResponse(Complete: true));
        }

        private static async Task EvaluateNoResult(FrameworkWrapper fw)
        {
            var noResult = fw.Entity.Create(new NoResultEvaluator());

            var count = 0;
            await foreach (var result in fw.Evaluator.Evaluate(noResult, null))
            {
                count++;
            }

            Assert.AreEqual(0, count);
        }

        private static async Task EntityPathEvaluateSingleResult(FrameworkWrapper fw)
        {
            var constant = 5;

            var singleResult = fw.Entity.Create(new SingleResultEvaluator(constant));

            var parent = fw.Entity.Create(new { a = singleResult });

            var result = await parent.EvalE("a");

            Assert.AreEqual(constant, result);
        }

        class SequenceEvaluator : IEvaluatable
        {
            private readonly IReadOnlyList<Entity> _entities;

            public SequenceEvaluator(IReadOnlyList<Entity> entities) => _entities = entities;

            public async Task<EvaluateResponse> Evaluate(EvaluateRequest request)
            {
                var index = await request.ReadLocation.EvalI("index", 0);

                var current = _entities[index++];

                request.WriteLocation["index"] = index;

                return new EvaluateResponse(
                    Entity: current,
                    Complete: index == _entities.Count
                );
            }
        }

        private static async Task EvaluateSequence(FrameworkWrapper fw)
        {
            var entities = Enumerable.Range(0, 5).Select(i => fw.Entity.Create(i)).ToList();

            var sequenceEvaluator = fw.Entity.Create(new SequenceEvaluator(entities));

            var results = new List<Entity>();

            await foreach (var result in fw.Evaluator.Evaluate(sequenceEvaluator, null))
            {
                results.Add(result);
            }

            Assert.AreEqual(entities.Count, results.Count);
            CollectionAssert.AreEqual(entities, results);
        }

        private static async Task EntityPathEvaluateSequence(FrameworkWrapper fw)
        {
            var entities = Enumerable.Range(0, 5).Select(i => fw.Entity.Create(i)).ToList();

            var sequenceEvaluator = fw.Entity.Create(new SequenceEvaluator(entities));

            var parent = fw.Entity.Create(new { a = sequenceEvaluator });

            var results = await parent.Eval("a").ToList();

            Assert.AreEqual(entities.Count, results.Count);
            CollectionAssert.AreEqual(entities, results);
        }

        private static async Task EntityMutator()
        {
#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
            static async IAsyncEnumerable<Entity> Mutate42(Entity entity, Entity parameters)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
            {
                if (entity.ValueType == EntityValueType.Number && entity.Value<int>() == 42)
                {
                    yield return 420;
                }
            }

            var fw = await FrameworkWrapper.Create(evaluatorConfig: new EvaluatorConfig(entityMutator: Mutate42));

            var constant10 = 10;

            var count = 0;
            await foreach (var result in fw.Evaluator.Evaluate(constant10, null))
            {
                count++;
                Assert.AreEqual(constant10, result);
            }

            Assert.AreEqual(1, count);

            var constant42 = 42;
            var constant420 = 420;

            count = 0;
            await foreach (var result in fw.Evaluator.Evaluate(constant42, null))
            {
                count++;
                Assert.AreEqual(constant420, result);
            }

            Assert.AreEqual(1, count);
        }

        private class AdderEvaluatable : IEvaluatable
        {
            public async Task<EvaluateResponse> Evaluate(EvaluateRequest request)
            {
                var left = await request.Parameters.EvalI("left");
                var right = await request.Parameters.EvalI("right");

                return new EvaluateResponse(
                    Entity: left + right,
                    Complete: true
                );
            }
        }

        private static async Task EvaluateWithParameters(FrameworkWrapper fw)
        {
            var random = new Random();
            var left = random.Next();
            var right = random.Next();
            var sum = left + right;

            var parameters = fw.Entity.Create(new
            {
                left,
                right
            });

            var adder = fw.Entity.Create(new AdderEvaluatable());

            var count = 0;
            await foreach (var result in fw.Evaluator.Evaluate(adder, parameters))
            {
                count++;
                Assert.AreEqual(sum, result.Value<int>());
            }

            Assert.AreEqual(1, count);
        }

        private static async Task EvaluatableEntity(FrameworkWrapper fw)
        {
            var entity = fw.Entity.Create(new Dictionary<string, object>
            {
                ["$evaluate"] = new
                {
                    code = "return new Utility.Evaluatable.EvaluateResponse(Entity: 42, Complete: true);"
                }
            });

            var count = 0;
            await foreach (var result in fw.Evaluator.Evaluate(entity, null))
            {
                count++;
                Assert.AreEqual(42, result);
            }

            Assert.AreEqual(1, count);
        }

        private static async Task EvaluatableEntityWithParameters(FrameworkWrapper fw)
        {
            var random = new Random();
            var left = random.Next();
            var right = random.Next();
            var sum = left + right;

            var parameters = fw.Entity.Create(new
            {
                left,
                right
            });

            var adder = fw.Entity.Create(new Dictionary<string, object>
            {
                ["$meta"] = new
                {
                    id = Guid.NewGuid()
                },
                ["$evaluate"] = new
                {
                    code = "return new Utility.Evaluatable.EvaluateResponse(Entity: await Parameters.EvalI(\"left\") + await Parameters.EvalI(\"right\"), Complete: true);"
                }
            });

            var count = 0;
            await foreach (var result in fw.Evaluator.Evaluate(adder, parameters))
            {
                count++;
                Assert.AreEqual(sum, result.Value<int>());
            }

            Assert.AreEqual(1, count);
        }

        private static async Task EvaluatableEntityWithActualParameters(FrameworkWrapper fw)
        {
            var value = 7;

            var entity = fw.Entity.Create(new Dictionary<string, object>
            {
                ["$evaluate"] = new
                {
                    code = "return new Utility.Evaluatable.EvaluateResponse(Entity: await Parameters.EvalI(\"value\"), Complete: true);",
                    actualParameters = new { value }
                }
            });

            var count = 0;
            await foreach (var result in fw.Evaluator.Evaluate(entity, null))
            {
                count++;
                Assert.AreEqual(value, result);
            }

            Assert.AreEqual(1, count);
        }

        private static async Task EvaluatableEntityWithMergedParameters(FrameworkWrapper fw)
        {
            var random = new Random();
            var left = random.Next();
            var right = random.Next();
            var sum = left + right;

            var parameters = fw.Entity.Create(new
            {
                left,
            });

            var adder = fw.Entity.Create(new Dictionary<string, object>
            {
                ["$evaluate"] = new
                {
                    code = "return new Utility.Evaluatable.EvaluateResponse(Entity: await Parameters.EvalI(\".left\") + await Parameters.EvalI(\"right\"), Complete: true);",
                    actualParameters = new { right }
                }
            });

            var count = 0;
            await foreach (var result in fw.Evaluator.Evaluate(adder, parameters))
            {
                count++;
                Assert.AreEqual(sum, result.Value<int>());
            }

            Assert.AreEqual(1, count);
        }
    }
}
