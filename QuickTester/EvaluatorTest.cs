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
        }

        private static async Task EntityMutator()
        {
            static async IAsyncEnumerable<Entity> Mutate42(Entity entity)
            {
                if (entity.ValueType == EntityValueType.Number && await entity.EvalI("@") == 42)
                {
                    yield return entity.Create(420);
                }
            }

            var fw = await FrameworkWrapper.Create(evaluatorConfig: new EvaluatorConfig(EntityMutator: Mutate42));

            var constant10 = fw.Entity.Create(10);

            var count = 0;
            await foreach (var result in fw.Evaluator.Evaluate(constant10))
            {
                count++;
                Assert.AreEqual(constant10, result);
            }

            Assert.AreEqual(1, count);

            var constant42 = fw.Entity.Create(42);
            var constant420 = fw.Entity.Create(420);

            count = 0;
            await foreach (var result in fw.Evaluator.Evaluate(constant42))
            {
                count++;
                Assert.AreEqual(constant420, result);
            }

            Assert.AreEqual(1, count);
        }

        private static async Task EvaluateConstant(FrameworkWrapper fw)
        {
            var constant = fw.Entity.Create(5);

            var count = 0;
            await foreach (var result in fw.Evaluator.Evaluate(constant))
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

            public Task<Entity> Evaluate(Entity entity) => Task.FromResult(entity.Create(new
            {
                Entity = _result,
                Complete = true
            }));
        }

        private static async Task EvaluateSingleResult(FrameworkWrapper fw)
        {
            var constant = fw.Entity.Create(5);

            var singleResult = fw.Entity.Create(new SingleResultEvaluator(constant));

            var count = 0;
            await foreach (var result in fw.Evaluator.Evaluate(singleResult))
            {
                count++;
                Assert.AreEqual(constant, result);
            }

            Assert.AreEqual(1, count);
        }

        private class NoResultEvaluator : IEvaluatable
        {
            public Task<Entity> Evaluate(Entity entity) => Task.FromResult(entity.Create(new { Complete = true }));
        }

        private static async Task EvaluateNoResult(FrameworkWrapper fw)
        {
            var noResult = fw.Entity.Create(new NoResultEvaluator());

            var count = 0;
            await foreach (var result in fw.Evaluator.Evaluate(noResult))
            {
                count++;
            }

            Assert.AreEqual(0, count);
        }

        private static async Task EntityPathEvaluateSingleResult(FrameworkWrapper fw)
        {
            var constant = fw.Entity.Create(5);

            var singleResult = fw.Entity.Create(new SingleResultEvaluator(constant));

            var parent = fw.Entity.Create(new { a = singleResult });

            var result = await parent.EvalE("a");

            Assert.AreEqual(constant, result);
        }

        class SequenceEvaluator : IEvaluatable
        {
            private readonly IReadOnlyList<Entity> _entities;
            private int _index;

            public SequenceEvaluator(IReadOnlyList<Entity> entities) => _entities = entities;

            public Task<Entity> Evaluate(Entity entity) => Task.FromResult(entity.Create(new
            {
                Entity = _entities[_index++],
                Complete = _index == _entities.Count
            }));
        }

        private static async Task EvaluateSequence(FrameworkWrapper fw)
        {
            var entities = Enumerable.Range(0, 5).Select(i => fw.Entity.Create(i)).ToList();

            var sequenceEvaluator = fw.Entity.Create(new SequenceEvaluator(entities));

            var results = new List<Entity>();

            await foreach(var result in fw.Evaluator.Evaluate(sequenceEvaluator))
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

            var results = (await parent.Eval("a")).ToList();

            Assert.AreEqual(entities.Count, results.Count);
            CollectionAssert.AreEqual(entities, results);
        }
    }
}
