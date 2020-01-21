using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;

namespace Utility.DynamicDataFlow
{
    public class DynamicDataFlowBlock<TInput>
    {
        internal ITargetBlock<TInput> TargetBlock { get; }

        public Task Completion => TargetBlock.Completion;

        private static readonly Dictionary<string, Type> _typeMap = new Dictionary<string, Type>()
        {
            { "Action", typeof(ActionBlock<TInput>) }
        };

        private static readonly ConcurrentDictionary<Type, ConstructorInfo> _constructorCache = new ConcurrentDictionary<Type, ConstructorInfo>();

        private DynamicDataFlowBlock(ITargetBlock<TInput> block) => TargetBlock = block;

        public static DynamicDataFlowBlock<TInput> Create(string type, Action<TInput> behavior, int boundedCapacity = DataflowBlockOptions.Unbounded, bool ensureOrdered = false, int maxDegreesOfParallelism = 1, int maxMessagesPerTask = -1)
        {
            var options = new ExecutionDataflowBlockOptions()
            {
                BoundedCapacity = boundedCapacity,
                EnsureOrdered = ensureOrdered,
                MaxDegreeOfParallelism = maxDegreesOfParallelism,
                MaxMessagesPerTask = maxMessagesPerTask
            };

            if (!_typeMap.TryGetValue(type, out var blockType))
            {
                throw new ArgumentException($"Unknown DataFlowBlock type: {type}", nameof(type));
            }

            var constructor = _constructorCache.GetOrAdd(blockType, blockTypeToFind => blockTypeToFind.GetConstructor(new[] { typeof(Action<TInput>), typeof(ExecutionDataflowBlockOptions) }));

            var block = (ITargetBlock<TInput>)constructor.Invoke(new object[] { behavior, options });

            return new DynamicDataFlowBlock<TInput>(block);
        }

        public Task SendAsync(TInput input) => TargetBlock.SendAsync(input);

        public Task SendAsync(TInput input, CancellationToken cancellationToken) => TargetBlock.SendAsync(input, cancellationToken);
    }

    public class DynamicDataFlowBlock<TInput, TOutput>
    {
        private readonly IPropagatorBlock<TInput, TOutput> _propagatorBlock;

        public Task Completion => _propagatorBlock.Completion;

        private static readonly Dictionary<string, Type> _typeMap = new Dictionary<string, Type>()
        {
            { "Transform", typeof(TransformBlock<TInput, TOutput>) }
        };

        private DynamicDataFlowBlock(IPropagatorBlock<TInput, TOutput> block) => _propagatorBlock = block;

        public static DynamicDataFlowBlock<TInput, TOutput> Create(string type, Func<TInput, TOutput> behavior, int boundedCapacity = DataflowBlockOptions.Unbounded, bool ensureOrdered = false, int maxDegreesOfParallelism = 1, int maxMessagesPerTask = -1)
        {
            var options = new ExecutionDataflowBlockOptions()
            {
                BoundedCapacity = boundedCapacity,
                EnsureOrdered = ensureOrdered,
                MaxDegreeOfParallelism = maxDegreesOfParallelism,
                MaxMessagesPerTask = maxMessagesPerTask
            };

            if (!_typeMap.TryGetValue(type, out var blockType))
            {
                throw new ArgumentException($"Unknown DataFlowBlock type: {type}", nameof(type));
            }

            var constructor = blockType.GetConstructor(new[] { typeof(Func<TInput, TOutput>), typeof(ExecutionDataflowBlockOptions) });

            var block = (IPropagatorBlock<TInput, TOutput>)constructor.Invoke(new object[] { behavior, options });

            return new DynamicDataFlowBlock<TInput, TOutput>(block);
        }

        public Task<bool> SendAsync(TInput input) => _propagatorBlock.SendAsync(input);

        public Task<bool> SendAsync(TInput input, CancellationToken cancellationToken) => _propagatorBlock.SendAsync(input, cancellationToken);

        public IDisposable LinkTo(DynamicDataFlowBlock<TOutput> target) => _propagatorBlock.LinkTo(target.TargetBlock);

        public IDisposable LinkTo(DynamicDataFlowBlock<TOutput> target, DataflowLinkOptions options) => _propagatorBlock.LinkTo(target.TargetBlock, options);

        public IDisposable LinkTo(DynamicDataFlowBlock<TOutput> target, DataflowLinkOptions options, Predicate<TOutput> predicate) => _propagatorBlock.LinkTo(target.TargetBlock, options, predicate);

        public IDisposable LinkTo(DynamicDataFlowBlock<TOutput> target, Predicate<TOutput> predicate) => _propagatorBlock.LinkTo(target.TargetBlock, predicate);

        public IDisposable LinkTo<T>(DynamicDataFlowBlock<TOutput, T> target) => _propagatorBlock.LinkTo(target._propagatorBlock);

        public IDisposable LinkTo<T>(DynamicDataFlowBlock<TOutput, T> target, DataflowLinkOptions options) => _propagatorBlock.LinkTo(target._propagatorBlock, options);

        public IDisposable LinkTo<T>(DynamicDataFlowBlock<TOutput, T> target, DataflowLinkOptions options, Predicate<TOutput> predicate) => _propagatorBlock.LinkTo(target._propagatorBlock, options, predicate);

        public IDisposable LinkTo<T>(DynamicDataFlowBlock<TOutput, T> target, Predicate<TOutput> predicate) => _propagatorBlock.LinkTo(target._propagatorBlock, predicate);

        public void Complete() => _propagatorBlock.Complete();
    }
}
