using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;

namespace Utility.Dataflow
{
    public class DynamicDataflow
    {
        #region Prvate Fields
        private readonly Dictionary<int, IDataflowBlock> _dataflowBlocks;
        #endregion

        #region Constructor
        private DynamicDataflow(Dictionary<int, IDataflowBlock> dataflowBlocks)
        {
            _dataflowBlocks = dataflowBlocks;
            AllCompleted = Task.WhenAll(_dataflowBlocks.Values.Select(block => block.Completion));
        }
        #endregion

        #region Public Properties
        public Task AllCompleted { get; }
        #endregion

        #region Public Methods
        public Task<bool> SendAsync<T>(int blockId, T input)
        {
            var block = _dataflowBlocks[blockId];

            return (block as ITargetBlock<T>).SendAsync(input);
        }

        public void Complete(int blockId)
        {
            var block = _dataflowBlocks[blockId];

            block.Complete();
        }

        public Task Completed(int blockId) => _dataflowBlocks[blockId].Completion;

        public Task Completed(params int[] blockIds) => Completed((IEnumerable<int>)blockIds);

        public Task Completed(IEnumerable<int> blockIds) => Task.WhenAll(blockIds.Select(id => _dataflowBlocks[id].Completion));
        #endregion

        #region Public Static Methods
        public static async Task<DynamicDataflow> Create(Entity.Entity config, FrameworkWrapper fw = null)
        {
            var defaultDataflowBlockOptions = await config.EvalE("defaultBlockOptions");
            var defaultDataflowLinkOptions = await config.EvalE("defaultLinkOptions");

            var blocks = await config.EvalL("blocks");

            var dataflowBlocks = new Dictionary<int, (IDataflowBlock block, Type inputType, Type outputType)>();

            foreach (var block in blocks)
            {
                var id = int.Parse(await block.EvalS("id"));
                dataflowBlocks.Add(id, await CreateDataflowBlock(block, defaultDataflowBlockOptions, fw));
            }

            var links = await config.EvalL("links");

            foreach (var link in links)
            {
                await CreateLink(link, dataflowBlocks, defaultDataflowLinkOptions, fw);
            }

            return new DynamicDataflow(dataflowBlocks.ToDictionary(kvp => kvp.Key, kvp => kvp.Value.block));
        }
        #endregion

        #region Private Static Methods
        #region DataflowBlock Methods
        private static async Task<(IDataflowBlock block, Type inputType, Type outputType)> CreateDataflowBlock(Entity.Entity block, Entity.Entity defaultDataflowBlockOptions, FrameworkWrapper fw)
        {
            var blockType = await block.EvalS("blockType");

            switch (blockType)
            {
                case "Transform":
                    var transformOptions = await GetExecutionDataflowBlockOptions(block, defaultDataflowBlockOptions);
                    return await CreateTransformBlock(block, transformOptions, fw);
                case "Action":
                    var actionOptions = await GetExecutionDataflowBlockOptions(block, defaultDataflowBlockOptions);
                    return await CreateActionBlock(block, actionOptions, fw);
                default:
                    throw new Exception($"Unsupported block type {blockType}");
            }
        }

        private static async Task<(IDataflowBlock block, Type inputType, Type outputType)> CreateActionBlock(Entity.Entity block, ExecutionDataflowBlockOptions options, FrameworkWrapper fw)
        {
            var inputType = Type.GetType(await block.EvalS("inputType"));

            var funcMaker = typeof(DynamicDataflow).GetMethod(nameof(CreateAction), BindingFlags.Static | BindingFlags.NonPublic).MakeGenericMethod(inputType);

            var behaviorCode = await GetCode(await block.EvalE("behavior"));

            var behavior = funcMaker.Invoke(null, new object[] { behaviorCode, fw });

            var constructor = typeof(ActionBlock<>).MakeGenericType(inputType).GetConstructor(new[] { behavior.GetType(), typeof(ExecutionDataflowBlockOptions) });

            var actionBlock = (IDataflowBlock)constructor.Invoke(new object[] { behavior, options });

            return (actionBlock, inputType, null);
        }

        private static async Task<(IDataflowBlock block, Type inputType, Type outputType)> CreateTransformBlock(Entity.Entity block, ExecutionDataflowBlockOptions options, FrameworkWrapper fw)
        {
            var inputType = Type.GetType(await block.EvalS("inputType"));
            var outputType = Type.GetType(await block.EvalS("outputType"));

            var funcType = typeof(Func<,>).MakeGenericType(inputType, outputType);

            var funcMaker = typeof(DynamicDataflow).GetMethod(nameof(CreateFunction), BindingFlags.Static | BindingFlags.NonPublic).MakeGenericMethod(inputType, outputType);

            var behaviorCode = await GetCode(await block.EvalE("behavior"));

            var behavior = funcMaker.Invoke(null, new object[] { behaviorCode });

            var taskOutputType = typeof(Task<>).MakeGenericType(outputType);

            var constructor = typeof(TransformBlock<,>).MakeGenericType(inputType, outputType).GetConstructor(new[] { behavior.GetType(), typeof(ExecutionDataflowBlockOptions) });

            var transform = (IDataflowBlock)constructor.Invoke(new object[] { behavior, options });

            return (transform, inputType, outputType);
        }

        private static Func<TInput, Task> CreateAction<TInput>((Guid id, string code) behavior, FrameworkWrapper fw)
        {
            if (behavior.id == default)
            {
                return (TInput input) => fw.EvaluateEntity(behavior.code, fw.Entity.Create(new { Input = input }));
            }
            else
            {
                return (TInput input) => fw.EvaluateEntity(behavior.id, fw.Entity.Create(new { Input = input }));
            }
        }

        private static Func<TInput, Task<TOutput>> CreateFunction<TInput, TOutput>((Guid id, string code) behavior, FrameworkWrapper fw)
        {
            if (behavior.id == default)
            {
                return async (TInput input) => (await fw.EvaluateEntity(behavior.code, fw.Entity.Create(new { Input = input }))).Value<TOutput>();
            }
            else
            {
                return async (TInput input) => (await fw.EvaluateEntity(behavior.id, fw.Entity.Create(new { Input = input }))).Value<TOutput>();
            }
        }

        private static async Task<ExecutionDataflowBlockOptions> GetExecutionDataflowBlockOptions(Entity.Entity options, Entity.Entity defaultDataflowBlockOptions)
        {
            var executionDataflowBlockOptions = new ExecutionDataflowBlockOptions();

            executionDataflowBlockOptions.BoundedCapacity = await GetOption("boundedCapacity", options, defaultDataflowBlockOptions, executionDataflowBlockOptions.BoundedCapacity);
            executionDataflowBlockOptions.EnsureOrdered = await GetOption("ensureOrdered", options, defaultDataflowBlockOptions, executionDataflowBlockOptions.EnsureOrdered);
            executionDataflowBlockOptions.MaxDegreeOfParallelism = await GetOption("maxDegreeOfParallelism", options, defaultDataflowBlockOptions, executionDataflowBlockOptions.MaxDegreeOfParallelism);
            executionDataflowBlockOptions.MaxMessagesPerTask = await GetOption("maxMessagesPerTask", options, defaultDataflowBlockOptions, executionDataflowBlockOptions.MaxMessagesPerTask);
            executionDataflowBlockOptions.SingleProducerConstrained = await GetOption("singleProducerConstrained", options, defaultDataflowBlockOptions, executionDataflowBlockOptions.SingleProducerConstrained);

            return executionDataflowBlockOptions;
        }
        #endregion

        #region Link Methods
        private static async Task CreateLink(Entity.Entity edge, Dictionary<int, (IDataflowBlock block, Type inputType, Type outputType)> dataflowBlocks, Entity.Entity defaultDataflowLinkOptions, FrameworkWrapper fw)
        {
            var dataflowLinkOptions = GetDataflowLinkOptions(edge, defaultDataflowLinkOptions);

            var fromId = int.Parse(await edge.EvalS("from"));
            var toId = int.Parse(await edge.EvalS("to"));

            var predicateCode = await GetCode(await edge.EvalE("predicate"));

            var source = dataflowBlocks[fromId];
            var target = dataflowBlocks[toId];

            if (source.outputType == null)
            {
                throw new InvalidOperationException($"Block Id: {fromId} does not have an output.  It is of type {source.block.GetType()}");
            }

            if (source.outputType != target.inputType)
            {
                throw new InvalidOperationException($"Block Id: {fromId} outputs {source.outputType} but Block Id: {toId} inputs {target.inputType}");
            }

            var sourceBlockType = typeof(ISourceBlock<>).MakeGenericType(source.outputType);
            var targetBlockType = typeof(ITargetBlock<>).MakeGenericType(source.outputType);
            var predicateType = typeof(Predicate<>).MakeGenericType(source.outputType);

            if (!string.IsNullOrWhiteSpace(predicateCode.code))
            {
                var predicateMaker = typeof(DynamicDataflow).GetMethod(nameof(CreatePredicate), BindingFlags.Static | BindingFlags.NonPublic).MakeGenericMethod(source.outputType);
                var predicate = predicateMaker.Invoke(null, new object[] { predicateCode, fw });

                var linkTo = typeof(DataflowBlock).GetMethods(BindingFlags.Public | BindingFlags.Static).Where(mi => mi.Name == nameof(DataflowBlock.LinkTo) && mi.GetParameters().Length == 4).Single().MakeGenericMethod(source.outputType);
                _ = linkTo.Invoke(null, new object[] { source.block, target.block, dataflowLinkOptions, predicate });
            }
            else
            {
                var linkTo = sourceBlockType.GetMethod(nameof(DataflowBlock.LinkTo), new[] { targetBlockType, typeof(DataflowLinkOptions) });
                _ = linkTo.Invoke(source.block, new object[] { target.block, dataflowLinkOptions });
            }
        }

        private static Predicate<TInput> CreatePredicate<TInput>((Guid id, string code) predicate, FrameworkWrapper fw)
        {
            if (predicate.id == default)
            {
                return (TInput input) => fw.EvaluateEntity(predicate.code, fw.Entity.Create(new { Input = input })).GetAwaiter().GetResult().Value<bool>();
            }
            else
            {
                return (TInput input) => fw.EvaluateEntity(predicate.id, fw.Entity.Create(new { Input = input })).GetAwaiter().GetResult().Value<bool>();
            }
        }

        private static async Task<DataflowLinkOptions> GetDataflowLinkOptions(Entity.Entity options, Entity.Entity defaultDataflowLinkOptions)
        {
            var dataflowLinkOptions = new DataflowLinkOptions();

            dataflowLinkOptions.Append = await GetOption("append", options, defaultDataflowLinkOptions, dataflowLinkOptions.Append);
            dataflowLinkOptions.MaxMessages = await GetOption("maxMessages", options, defaultDataflowLinkOptions, dataflowLinkOptions.MaxMessages);
            dataflowLinkOptions.PropagateCompletion = await GetOption("propagateCompletion", options, defaultDataflowLinkOptions, dataflowLinkOptions.PropagateCompletion);

            return dataflowLinkOptions;
        }
        #endregion

        #region Option Methods
        private static async Task<int> GetOption(string name, Entity.Entity options, Entity.Entity defaultOptions, int defaultValue)
        {
            if (!int.TryParse(await options.EvalS(name), out var value))
            {
                if (!int.TryParse(await defaultOptions.EvalS(name), out value))
                {
                    value = defaultValue;
                }
            }

            return value;
        }

        private static async Task<bool> GetOption(string name, Entity.Entity options, Entity.Entity defaultOptions, bool defaultValue)
        {
            if (!bool.TryParse(await options.EvalS(name), out var value))
            {
                if (!bool.TryParse(await defaultOptions.EvalS(name), out value))
                {
                    value = defaultValue;
                }
            }

            return value;
        }
        #endregion

        private static async Task<(Guid id, string code)> GetCode(Entity.Entity entity)
        {
            if (entity == null)
            {
                return (Guid.Empty, null);
            }

            if (Guid.TryParse(await entity.EvalS("entityId") ?? string.Empty, out var entityId))
            {
                return (entityId, null);
            }

            return (default, await entity.EvalS("code"));
        }
        #endregion
    }
}