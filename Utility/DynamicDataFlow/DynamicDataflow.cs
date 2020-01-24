using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using Utility.GenericEntity;

namespace Utility.Dataflow
{
    public class DynamicDataflow
    {
        private Dictionary<int, IDataflowBlock> _dataflowBlocks;

        private DynamicDataflow(Dictionary<int, IDataflowBlock> dataflowBlocks)
        {
            _dataflowBlocks = dataflowBlocks;
            AllCompleted = Task.WhenAll(_dataflowBlocks.Values.Select(block => block.Completion));
        }

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

        public IDataflowBlock this[int id] => _dataflowBlocks[id];

        public Task AllCompleted { get; }

        public static DynamicDataflow Create(string config) => Create(JsonWrapper.JsonToGenericEntity(config));

        public static DynamicDataflow Create(IGenericEntity config)
        {
            var scripts = new List<ScriptDescriptor>();
            var scriptsPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "DataflowScripts");
            var rw = new RoslynWrapper(scripts, $@"{scriptsPath}\\debug");

            var defaultDataflowBlockOptions = config.GetE("/defaultBlockOptions");
            var defaultDataflowLinkOptions = config.GetE("/defaultLinkOptions");

            var blocks = config.GetL("/blocks");

            var dataflowBlocks = new Dictionary<int, (IDataflowBlock block, Type inputType, Type outputType)>();

            foreach (var block in blocks)
            {
                int.TryParse(block.GetS("id"), out var id);
                dataflowBlocks.Add(id, CreateDataflowBlock(block, defaultDataflowBlockOptions, rw));
            }

            var links = config.GetL("/links");

            foreach (var link in links)
            {
                CreateLink(link, dataflowBlocks, defaultDataflowLinkOptions, rw);
            }

            return new DynamicDataflow(dataflowBlocks.ToDictionary(kvp => kvp.Key, kvp => kvp.Value.block));
        }

        #region Private Static Methods
        #region DataflowBlock Methods
        private static (IDataflowBlock block, Type inputType, Type outputType) CreateDataflowBlock(IGenericEntity block, IGenericEntity defaultDataflowBlockOptions, RoslynWrapper rw)
        {
            var blockType = block.GetS("/blockType");

            switch (blockType)
            {
                case "Transform":
                    var transformOptions = GetExecutionDataflowBlockOptions(block, defaultDataflowBlockOptions);
                    return CreateTransformBlock(block, transformOptions, rw);
                case "Action":
                    var actionOptions = GetExecutionDataflowBlockOptions(block, defaultDataflowBlockOptions);
                    return CreateActionBlock(block, actionOptions, rw);
                default:
                    throw new Exception($"Unsupported block type {blockType}");
            }
        }

        private static (IDataflowBlock block, Type inputType, Type outputType) CreateActionBlock(IGenericEntity block, ExecutionDataflowBlockOptions options, RoslynWrapper rw)
        {
            var inputType = Type.GetType(block.GetS("/inputType"));

            var code = block.GetS("/code");

            var funcMaker = typeof(DynamicDataflow).GetMethod(nameof(CreateAction), BindingFlags.Static | BindingFlags.NonPublic).MakeGenericMethod(inputType);

            var func = funcMaker.Invoke(null, new object[] { code, rw });

            var constructor = typeof(ActionBlock<>).MakeGenericType(inputType).GetConstructor(new[] { func.GetType(), typeof(ExecutionDataflowBlockOptions) });

            var actionBlock = (IDataflowBlock)constructor.Invoke(new object[] { func, options });

            return (actionBlock, inputType, null);
        }

        private static (IDataflowBlock block, Type inputType, Type outputType) CreateTransformBlock(IGenericEntity block, ExecutionDataflowBlockOptions options, RoslynWrapper rw)
        {
            var inputType = Type.GetType(block.GetS("/inputType"));
            var outputType = Type.GetType(block.GetS("/outputType"));

            var code = block.GetS("/code");

            var funcType = typeof(Func<,>).MakeGenericType(inputType, outputType);

            var funcMaker = typeof(DynamicDataflow).GetMethod(nameof(CreateFunction), BindingFlags.Static | BindingFlags.NonPublic).MakeGenericMethod(inputType, outputType);

            var func = funcMaker.Invoke(null, new object[] { code, rw });

            var taskOutputType = typeof(Task<>).MakeGenericType(outputType);

            var constructor = typeof(TransformBlock<,>).MakeGenericType(inputType, outputType).GetConstructor(new[] { func.GetType(), typeof(ExecutionDataflowBlockOptions) });

            var transform = (IDataflowBlock)constructor.Invoke(new object[] { func, options });

            return (transform, inputType, outputType);
        }

        private static Func<TInput, Task> CreateAction<TInput>(string code, RoslynWrapper rw)
        {
            var sd = rw.CompileAndCache(new ScriptDescriptor(null, code));

            return (TInput input) => rw[sd.Key](new { Input = input }, new StateWrapper());
        }

        private static Func<TInput, Task<TOutput>> CreateFunction<TInput, TOutput>(string code, RoslynWrapper rw)
        {
            var sd = rw.CompileAndCache(new ScriptDescriptor(null, code));

            return async (TInput input) =>
            {
                Console.WriteLine("running rw");
                return (TOutput)await rw[sd.Key](new { Input = input }, new StateWrapper());
            };
        }

        private static ExecutionDataflowBlockOptions GetExecutionDataflowBlockOptions(IGenericEntity options, IGenericEntity defaultDataflowBlockOptions)
        {
            var executionDataflowBlockOptions = new ExecutionDataflowBlockOptions();

            executionDataflowBlockOptions.BoundedCapacity = GetOption("/boundedCapacity", options, defaultDataflowBlockOptions, executionDataflowBlockOptions.BoundedCapacity);
            executionDataflowBlockOptions.EnsureOrdered = GetOption("/ensureOrdered", options, defaultDataflowBlockOptions, executionDataflowBlockOptions.EnsureOrdered);
            executionDataflowBlockOptions.MaxDegreeOfParallelism = GetOption("/maxDegreeOfParallelism", options, defaultDataflowBlockOptions, executionDataflowBlockOptions.MaxDegreeOfParallelism);
            executionDataflowBlockOptions.MaxMessagesPerTask = GetOption("/maxMessagesPerTask", options, defaultDataflowBlockOptions, executionDataflowBlockOptions.MaxMessagesPerTask);
            executionDataflowBlockOptions.SingleProducerConstrained = GetOption("/singleProducerConstrained", options, defaultDataflowBlockOptions, executionDataflowBlockOptions.SingleProducerConstrained);

            return executionDataflowBlockOptions;
        }
        #endregion

        #region Link Methods
        private static void CreateLink(IGenericEntity edge, Dictionary<int, (IDataflowBlock block, Type inputType, Type outputType)> dataflowBlocks, IGenericEntity defaultDataflowLinkOptions, RoslynWrapper rw)
        {
            var dataflowLinkOptions = GetDataflowLinkOptions(edge, defaultDataflowLinkOptions);

            var fromId = int.Parse(edge.GetS("/from"));
            var toId = int.Parse(edge.GetS("/to"));
            var predicateCode = edge.GetS("/predicate");

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

            if (!string.IsNullOrWhiteSpace(predicateCode))
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

        private static Predicate<TOutput> CreatePredicate<TOutput>(string code, RoslynWrapper rw)
        {
            var sd = rw.CompileAndCache(new ScriptDescriptor(null, code));

            return (TOutput input) => (bool)rw[sd.Key](new { Input = input }, new StateWrapper()).GetAwaiter().GetResult();
        }

        private static DataflowLinkOptions GetDataflowLinkOptions(IGenericEntity options, IGenericEntity defaultDataflowLinkOptions)
        {
            var dataflowLinkOptions = new DataflowLinkOptions();

            dataflowLinkOptions.Append = GetOption("/append", options, defaultDataflowLinkOptions, dataflowLinkOptions.Append);
            dataflowLinkOptions.MaxMessages = GetOption("/maxMessages", options, defaultDataflowLinkOptions, dataflowLinkOptions.MaxMessages);
            dataflowLinkOptions.PropagateCompletion = GetOption("/propagateCompletion", options, defaultDataflowLinkOptions, dataflowLinkOptions.PropagateCompletion);

            return dataflowLinkOptions;
        }
        #endregion

        #region Option Methods
        private static int GetOption(string name, IGenericEntity options, IGenericEntity defaultOptions, int defaultValue)
        {
            if (!int.TryParse(options.GetS(name), out var value))
            {
                if (!int.TryParse(defaultOptions.GetS(name), out value))
                {
                    value = defaultValue;
                }
            }

            return value;
        }

        private static bool GetOption(string name, IGenericEntity options, IGenericEntity defaultOptions, bool defaultValue)
        {
            if (!bool.TryParse(options.GetS(name), out var value))
            {
                if (!bool.TryParse(defaultOptions.GetS(name), out value))
                {
                    value = defaultValue;
                }
            }

            return value;
        }
        #endregion
        #endregion
    }
}