using System;
using System.Collections.Generic;
using System.IO;
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
            var rw = fw?.RoslynWrapper;
            if (rw == null)
            {
                var scripts = new List<ScriptDescriptor>();
                var scriptsPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "DataflowScripts");
                rw = new RoslynWrapper(scripts, $@"{scriptsPath}\\debug");
            }

            var defaultDataflowBlockOptions = await config.GetE("defaultBlockOptions");
            var defaultDataflowLinkOptions = await config.GetE("defaultLinkOptions");

            var blocks = await config.GetL("blocks");

            var dataflowBlocks = new Dictionary<int, (IDataflowBlock block, Type inputType, Type outputType)>();

            foreach (var block in blocks)
            {
                var id = int.Parse(await block.GetS("id"));
                dataflowBlocks.Add(id, await CreateDataflowBlock(block, defaultDataflowBlockOptions, fw, rw));
            }

            var links = await config.GetL("links");

            foreach (var link in links)
            {
                await CreateLink(link, dataflowBlocks, defaultDataflowLinkOptions, fw, rw);
            }

            return new DynamicDataflow(dataflowBlocks.ToDictionary(kvp => kvp.Key, kvp => kvp.Value.block));
        }
        #endregion

        #region Private Static Methods
        #region DataflowBlock Methods
        private static async Task<(IDataflowBlock block, Type inputType, Type outputType)> CreateDataflowBlock(Entity.Entity block, Entity.Entity defaultDataflowBlockOptions, FrameworkWrapper fw, RoslynWrapper rw)
        {
            var blockType = await block.GetS("blockType");

            switch (blockType)
            {
                case "Transform":
                    var transformOptions = await GetExecutionDataflowBlockOptions(block, defaultDataflowBlockOptions);
                    return await CreateTransformBlock(block, transformOptions, fw, rw);
                case "Action":
                    var actionOptions = await GetExecutionDataflowBlockOptions(block, defaultDataflowBlockOptions);
                    return await CreateActionBlock(block, actionOptions, fw, rw);
                default:
                    throw new Exception($"Unsupported block type {blockType}");
            }
        }

        private static async Task<(IDataflowBlock block, Type inputType, Type outputType)> CreateActionBlock(Entity.Entity block, ExecutionDataflowBlockOptions options, FrameworkWrapper fw, RoslynWrapper rw)
        {
            var inputType = Type.GetType(await block.GetS("inputType"));

            var funcMaker = typeof(DynamicDataflow).GetMethod(nameof(CreateAction), BindingFlags.Static | BindingFlags.NonPublic).MakeGenericMethod(inputType);

            var behaviorCode = await GetCode(await block.GetE("behavior"), fw);

            var behavior = funcMaker.Invoke(null, new object[] { behaviorCode, rw });

            var constructor = typeof(ActionBlock<>).MakeGenericType(inputType).GetConstructor(new[] { behavior.GetType(), typeof(ExecutionDataflowBlockOptions) });

            var actionBlock = (IDataflowBlock)constructor.Invoke(new object[] { behavior, options });

            return (actionBlock, inputType, null);
        }

        private static async Task<(IDataflowBlock block, Type inputType, Type outputType)> CreateTransformBlock(Entity.Entity block, ExecutionDataflowBlockOptions options, FrameworkWrapper fw, RoslynWrapper rw)
        {
            var inputType = Type.GetType(await block.GetS("inputType"));
            var outputType = Type.GetType(await block.GetS("outputType"));

            var funcType = typeof(Func<,>).MakeGenericType(inputType, outputType);

            var funcMaker = typeof(DynamicDataflow).GetMethod(nameof(CreateFunction), BindingFlags.Static | BindingFlags.NonPublic).MakeGenericMethod(inputType, outputType);

            var behaviorCode = await GetCode(await block.GetE("behavior"), fw);

            var behavior = funcMaker.Invoke(null, new object[] { behaviorCode, rw });

            var taskOutputType = typeof(Task<>).MakeGenericType(outputType);

            var constructor = typeof(TransformBlock<,>).MakeGenericType(inputType, outputType).GetConstructor(new[] { behavior.GetType(), typeof(ExecutionDataflowBlockOptions) });

            var transform = (IDataflowBlock)constructor.Invoke(new object[] { behavior, options });

            return (transform, inputType, outputType);
        }

        private static Func<TInput, Task> CreateAction<TInput>((Guid id, string code) behavior, RoslynWrapper rw)
        {
            var sd = rw.CompileAndCache(new ScriptDescriptor(behavior.id, null, behavior.code));

            return (TInput input) => rw[sd.Key](new { Input = input }, new StateWrapper());
        }

        private static Func<TInput, Task<TOutput>> CreateFunction<TInput, TOutput>((Guid id, string code) behavior, RoslynWrapper rw)
        {
            var sd = rw.CompileAndCache(new ScriptDescriptor(behavior.id, null, behavior.code));

            return async (TInput input) => (TOutput)await rw[sd.Key](new { Input = input }, new StateWrapper());
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
        private static async Task CreateLink(Entity.Entity edge, Dictionary<int, (IDataflowBlock block, Type inputType, Type outputType)> dataflowBlocks, Entity.Entity defaultDataflowLinkOptions, FrameworkWrapper fw, RoslynWrapper rw)
        {
            var dataflowLinkOptions = GetDataflowLinkOptions(edge, defaultDataflowLinkOptions);

            var fromId = int.Parse(await edge.GetS("from"));
            var toId = int.Parse(await edge.GetS("to"));

            var predicateCode = await GetCode(await edge.GetE("predicate"), fw);

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
                var predicate = predicateMaker.Invoke(null, new object[] { predicateCode, rw });

                var linkTo = typeof(DataflowBlock).GetMethods(BindingFlags.Public | BindingFlags.Static).Where(mi => mi.Name == nameof(DataflowBlock.LinkTo) && mi.GetParameters().Length == 4).Single().MakeGenericMethod(source.outputType);
                linkTo.Invoke(null, new object[] { source.block, target.block, dataflowLinkOptions, predicate });
            }
            else
            {
                var linkTo = sourceBlockType.GetMethod(nameof(DataflowBlock.LinkTo), new[] { targetBlockType, typeof(DataflowLinkOptions) });
                linkTo.Invoke(source.block, new object[] { target.block, dataflowLinkOptions });
            }
        }

        private static Predicate<TOutput> CreatePredicate<TOutput>((Guid id, string code) predicate, RoslynWrapper rw)
        {
            var sd = rw.CompileAndCache(new ScriptDescriptor(predicate.id, null, predicate.code));

            return (TOutput input) => (bool)rw[sd.Key](new { Input = input }, new StateWrapper()).GetAwaiter().GetResult();
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
            if (!int.TryParse(await options.GetS(name), out var value))
            {
                if (!int.TryParse(await defaultOptions.GetS(name), out value))
                {
                    value = defaultValue;
                }
            }

            return value;
        }

        private static async Task<bool> GetOption(string name, Entity.Entity options, Entity.Entity defaultOptions, bool defaultValue)
        {
            if (!bool.TryParse(await options.GetS(name), out var value))
            {
                if (!bool.TryParse(await defaultOptions.GetS(name), out value))
                {
                    value = defaultValue;
                }
            }

            return value;
        }
        #endregion

        public static async Task<(Guid id, string code)> GetCode(Entity.Entity entity, FrameworkWrapper fw)
        {
            if (entity == null)
            {
                return (Guid.Empty, null);
            }

            if (Guid.TryParse(await entity.GetS("entityId") ?? string.Empty, out var entityId))
            {
                var lbm = await fw.Entities.GetEntity(entityId);
                return (entityId, await lbm.GetS("Config"));
            }

            return (Guid.NewGuid(), await entity.GetS("code"));
        }
        #endregion
    }
}