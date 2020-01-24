using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using Utility;
using Utility.Dataflow;

namespace QuickTester
{
    public class DataFlowTester
    {
        public static async Task TestDynamicDataflow()
        {
            var config = @"
{
	""defaultBlockOptions"": {
		""maxDegreeOfParallelism"": 50
	},
	""defaultLinkOptions"": {
		""propagateCompletion"": true
	},
	""blocks"": [{
		""id"": 1,
		""blockType"": ""Transform"",
		""inputType"": ""System.String"",
		""outputType"": ""System.String"",
		""code"": ""return $\""Processed by 1: {p.Input}\"";""
	}, {
		""id"": 2,
		""blockType"": ""Transform"",
		""inputType"": ""System.String"",
		""outputType"": ""System.String"",
		""code"": ""return p.Input.ToLower();""
	}, {
		""id"": 3,
		""blockType"": ""Transform"",
		""inputType"": ""System.String"",
		""outputType"": ""System.String"",
		""code"": ""return p.Input.ToUpper();""
	}, {
		""id"": 4,
		""blockType"": ""Action"",
		""inputType"": ""System.String"",
		""code"": ""System.Console.WriteLine(p.Input);"",
		""#maxDegreeOfParallelism"": 1
	}],
	""links"": [{
		""from"": 1,
		""to"": 2,
        ""predicate"": ""return (p.Input[p.Input.Length - 1] - '0') % 2 == 0;""
	}, {
		""from"": 1,
		""to"": 3,
        ""predicate"": ""return (p.Input[p.Input.Length - 1] - '0') % 2 != 0;""
	}, {
		""from"": 2,
		""to"": 4,
		""propagateCompletion"": false
	}, {
		""from"": 3,
		""to"": 4,
		""propagateCompletion"": false
	}]
}";

            var flow = DynamicDataflow.Create(config);

            var sendTasks = new List<Task<bool>>();

            for (var i = 0; i < 10; i++)
            {
                sendTasks.Add(flow.SendAsync(1, $"HELLO {i}"));
            }

            await Task.WhenAll(sendTasks);

            if (sendTasks.Any(t => !t.Result))
            {
                throw new Exception("Failed to send all messages.");
            }

            flow.Complete(1);
            
            await flow.Completed(2, 3).ContinueWith(_ => flow.Complete(4));

            await flow.AllCompleted;
        }

        public static async Task TestRoslyn()
        {
            var scripts = new List<ScriptDescriptor>();
            var scriptsPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Scripts");
            var rw = new RoslynWrapper(scripts, $@"{scriptsPath}\\debug");

            var transform2Code = @"return p.Input.ToLower();";
            rw.CompileAndCache(new ScriptDescriptor("transform2", transform2Code, false, null));

            Func<string, Task<string>> transform2Func = async s => (string)await rw["transform2"](new { Input = s }, new StateWrapper());

            var dataBlockOptions = new ExecutionDataflowBlockOptions() { MaxDegreeOfParallelism = 2 };

            var transform1 = new TransformBlock<string, string>(s => $"Processed by transform 1: {s}", dataBlockOptions);
            //var transform2 = new TransformBlock<string, string>(s => s.ToLower(), dataBlockOptions);
            var transform2 = new TransformBlock<string, string>(transform2Func, dataBlockOptions);
            var transform3 = new TransformBlock<string, string>(s => s.ToUpper(), dataBlockOptions);
            var action = new ActionBlock<string>(Console.WriteLine, dataBlockOptions);

            var dataFlowLinkOptions = new DataflowLinkOptions() { PropagateCompletion = true };
            //transform1.LinkTo(transform2, dataFlowLinkOptions);
            transform1.LinkTo(transform2, dataFlowLinkOptions, s => (s.Last() - '0') % 2 == 0);
            transform1.LinkTo(transform3, dataFlowLinkOptions, s => (s.Last() - '0') % 2 != 0);
            transform1.LinkTo(DataflowBlock.NullTarget<string>());

            transform2.LinkTo(action, dataFlowLinkOptions);
            transform3.LinkTo(action, dataFlowLinkOptions);

            var sendTasks = new List<Task<bool>>();

            for (var i = 0; i < 10; i++)
            {
                sendTasks.Add(transform1.SendAsync($"Hello {i}"));
            }

            await Task.WhenAll(sendTasks);

            if (sendTasks.Any(t => !t.Result))
            {
                throw new Exception("Failed to send all messages.");
            }

            transform1.Complete();

            await action.Completion;
        }

        // This is not part of the final code - this is just an example that will be automated using BuildDynamicBlockWorkflow
        // This should be fixed to use Fw, or maybe there should be two versions of the library, one with FW, one without
        public static async Task TestDynamicBlockCreator()
        {
            // Real code should take a FrameworkWrapper.  
            FrameworkWrapper fw = null; //new FrameworkWrapper(null);

            // We will take a RoslynWrapper here for simple testing without DB
            //string TestF1 =
            //    @"
            //        System.Console.WriteLine(p.x1);
            //        if (p.x1 > 0) await f.testf1(new {x1 = p.x1 - 1}, s);
            //        """"";
            string TestF1 =
                @"
                    System.Console.WriteLine(""testf1"");
                    return p.msg;
                    """"";
            string TestF2 =
                @"
                    return !p.x1.HasError;
                    """"";
            var scripts = new List<ScriptDescriptor>();
            var scriptsPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Scripts");
            dynamic rw = new RoslynWrapper(scripts, $@"{scriptsPath}\\debug");
            rw.CompileAndCache(new ScriptDescriptor(null, "TestF1", TestF1, false, null));
            rw.CompileAndCache(new ScriptDescriptor(null, "TestF2", TestF2, false, null));
            string fname = "testf1";

            /* T->T->A */
            dynamic tBlock1 = DynamicBlockCreator(
                "System.Threading.Tasks.Dataflow.TransformBlock`2, System.Threading.Tasks.Dataflow",
                "QuickTester.DataFlowTester+Msg",
                "QuickTester.DataFlowTester+Msg",
                CreateRoslynCompatibleFunction(rw, fname, new string[] { "tblock1: " }),  // Funcify(async (object msg) => (Msg)msg),
                2, DataflowBlockOptions.Unbounded, false);

            dynamic tBlock2 = DynamicBlockCreator(
                "System.Threading.Tasks.Dataflow.TransformBlock`2, System.Threading.Tasks.Dataflow",
                "QuickTester.DataFlowTester+Msg",
                "QuickTester.DataFlowTester+Msg",
                CreateRoslynCompatibleFunction(rw, fname, new string[] { "tblock2: " }),
                2, DataflowBlockOptions.Unbounded, false);

            dynamic actionBlock = DynamicBlockCreator(
                "System.Threading.Tasks.Dataflow.ActionBlock`1, System.Threading.Tasks.Dataflow",
                "QuickTester.DataFlowTester+Msg",
                null,
                CreateRoslynCompatibleFunction(rw, fname, new string[] { "ablock: " }),
                2, DataflowBlockOptions.Unbounded, false);

            tBlock1.LinkTo(tBlock2.block, new DataflowLinkOptions
            {
                PropagateCompletion = true
            }, CreateLinkToPredicate(rw, "QuickTester.DataFlowTester+Msg", "testf2", null));
            tBlock1.LinkTo(DataflowBlock.NullTarget<Msg>());

            tBlock2.LinkTo(actionBlock.block, new DataflowLinkOptions
            {
                PropagateCompletion = true
            }, CreateLinkToPredicate(rw, "QuickTester.DataFlowTester+Msg", "testf2", null));
            tBlock2.LinkTo(DataflowBlock.NullTarget<Msg>());

            for (int i = 0; i < 10; i++)
                await tBlock1.SendAsync(new Msg { x = i });

            tBlock1.Complete();

            await actionBlock.Completion;
        }

        public static object CreateLinkToPredicate(RoslynWrapper rw, string linkType, string fname, string[] args)
        {
            Type predicateType = typeof(Predicate<>).MakeGenericType(new Type[] { Type.GetType(linkType) });
            var del = Funcify((object msg) =>
            {
                var lbmResultTask = rw[fname](new { x1 = msg }, new StateWrapper());
                return (bool)lbmResultTask.GetAwaiter().GetResult();
            });
            return Delegate.CreateDelegate(predicateType, del.Target, del.Method);
        }

        // The lambda in here should be stripped down to the minimum it can be and should maybe work with FW and should use GlobalConfig instead of fname
        public static object CreateRoslynCompatibleFunction(RoslynWrapper rw, string fname, string[] args)
        {
            return
                Funcify(async (object msg) =>
                {
                    try
                    {
                        // Maybe call the LBM and cast its result
                        Console.WriteLine($"{args[0]}: Before delay");
                        //Console.WriteLine("lbm" + lbmId.ToString());
                        //var lbm = (await fw.Entities.GetEntity(lbmId))?.GetS("Config");
                        //var lbmResult = (string)await fw.RoslynWrapper.Evaluate(lbmId, lbm,
                        //    new { msg, err = fw.Err }, new StateWrapper());
                        //var lbmResult = await rw[fname](new { x1 = ((Msg)msg).x }, new StateWrapper());
                        await Task.Delay(100);
                        Console.WriteLine($"{args[0]}: After delay");
                        //return Convert.ChangeType(lbmResult, Type.GetType(destType));
                        //return new Msg { x = 1, HasError = false };
                        //return new Msg((Msg)msg);
                        return (Msg)msg;
                        //return await rw[fname](new { msg }, new StateWrapper());
                    }
                    catch (Exception ex)
                    {
                        return new Msg { x = 0, HasError = false };
                    }
                });
        }

        public class DynamicBlock : System.Dynamic.DynamicObject
        {
            public dynamic block;
            public MethodInfo sendAsync;
            public MethodInfo linkTo2;
            public MethodInfo linkTo3;
            public MethodInfo linkTo4;

            public static readonly MethodInfo sendAsyncInfo;
            public static readonly MethodInfo linkTo2Info;
            public static readonly MethodInfo linkTo3Info;
            public static readonly MethodInfo linkTo4Info;

            static DynamicBlock()
            {
                // public static Task<bool> SendAsync<TInput>(this ITargetBlock<TInput> target, TInput item);
                var sendAsyncQuery = from method in typeof(DataflowBlock).GetMethods(BindingFlags.Static
                        | BindingFlags.Public | BindingFlags.NonPublic)
                                     where method.GetParameters().Length == 2
                                     where method.IsDefined(typeof(ExtensionAttribute), false)
                                     where method.GetParameters()[0].ParameterType.GetGenericTypeDefinition() == typeof(ITargetBlock<>)
                                     where method.GetParameters()[1].ParameterType == method.GetGenericArguments()[0]
                                     where method.Name == "SendAsync"
                                     select method;
                sendAsyncInfo = sendAsyncQuery.First();

                //public static IDisposable LinkTo<TOutput>(this ISourceBlock<TOutput> source, ITargetBlock<TOutput> target);
                //public static IDisposable LinkTo<TOutput>(this ISourceBlock<TOutput> source, ITargetBlock<TOutput> target, Predicate<TOutput> predicate);
                //public static IDisposable LinkTo<TOutput>(this ISourceBlock<TOutput> source, ITargetBlock<TOutput> target, DataflowLinkOptions linkOptions, Predicate<TOutput> predicate);
                var linkTo2Query = from method in typeof(DataflowBlock).GetMethods(BindingFlags.Static
                            | BindingFlags.Public | BindingFlags.NonPublic)
                                   where method.GetParameters().Length == 2
                                   where method.IsDefined(typeof(ExtensionAttribute), false)
                                   where method.GetParameters()[0].ParameterType.GetGenericTypeDefinition() == typeof(ISourceBlock<>)
                                   where method.GetParameters()[1].ParameterType.GetGenericTypeDefinition() == typeof(ITargetBlock<>)
                                   where method.Name == "LinkTo"
                                   select method;
                linkTo2Info = linkTo2Query.First();
                var linkTo3Query = from method in typeof(DataflowBlock).GetMethods(BindingFlags.Static
                            | BindingFlags.Public | BindingFlags.NonPublic)
                                   where method.GetParameters().Length == 3
                                   where method.IsDefined(typeof(ExtensionAttribute), false)
                                   where method.GetParameters()[0].ParameterType.GetGenericTypeDefinition() == typeof(ISourceBlock<>)
                                   where method.GetParameters()[1].ParameterType.GetGenericTypeDefinition() == typeof(ITargetBlock<>)
                                   where method.GetParameters()[2].ParameterType.GetGenericTypeDefinition() == typeof(Predicate<>)
                                   where method.Name == "LinkTo"
                                   select method;
                linkTo3Info = linkTo3Query.First();
                var linkTo4Query = from method in typeof(DataflowBlock).GetMethods(BindingFlags.Static
                            | BindingFlags.Public | BindingFlags.NonPublic)
                                   where method.GetParameters().Length == 4
                                   where method.IsDefined(typeof(ExtensionAttribute), false)
                                   where method.GetParameters()[0].ParameterType.GetGenericTypeDefinition() == typeof(ISourceBlock<>)
                                   where method.GetParameters()[1].ParameterType.GetGenericTypeDefinition() == typeof(ITargetBlock<>)
                                   where method.GetParameters()[2].ParameterType == typeof(DataflowLinkOptions)
                                   where method.GetParameters()[3].ParameterType.GetGenericTypeDefinition() == typeof(Predicate<>)
                                   where method.Name == "LinkTo"
                                   select method;
                linkTo4Info = linkTo4Query.First();
            }

            public DynamicBlock(dynamic block, MethodInfo sendAsync, MethodInfo linkTo2, MethodInfo linkTo3, MethodInfo linkTo4)
            {
                this.block = block;
                this.sendAsync = sendAsync;
                this.linkTo2 = linkTo2;
                this.linkTo3 = linkTo3;
                this.linkTo4 = linkTo4;
            }

            public override bool TryGetMember(GetMemberBinder binder, out object result)
            {
                if (binder.Name.Equals("Completion"))
                {
                    result = ((PropertyInfo)block.GetType().GetMember("Completion")[0]).GetValue(block);
                    return true;
                }

                return base.TryGetMember(binder, out result);
            }

            public override bool TryInvokeMember(InvokeMemberBinder binder, object[] args, out object result)
            {
                if (binder.Name.Equals("LinkTo"))
                {
                    if (args.Length == 1)
                        result = linkTo2.Invoke(null, new object[] { this.block, args[0] });
                    else if (args.Length == 2)
                        result = linkTo3.Invoke(null, new object[] { this.block, args[0], args[1] });
                    else
                        result = linkTo4.Invoke(null, new object[] { this.block, args[0], args[1], args[2] });

                    return true;
                }
                else if (binder.Name.Equals("SendAsync"))
                {
                    result = sendAsync.Invoke(null, new object[] { this.block, args[0] });
                    return true;
                }
                else if (binder.Name.Equals("Complete"))
                {
                    result = ((MethodInfo)((object)block).GetType().GetMember("Complete")[0]).Invoke(this.block, new object[] { });
                    return true;
                }
                else
                {
                    return base.TryInvokeMember(binder, args, out result);
                }
            }
        }

        public static DynamicBlock DynamicBlockCreator(string blockType, string srcType, string destType, object f,
            int maxParallelism, int boundedCapacity, bool ensureOrdered, List<String> args = null)
        {
            try
            {
                Type genericFuncType = null;
                Type genericType = null;
                if (!srcType.IsNullOrWhitespace() && destType.IsNullOrWhitespace())
                {
                    genericFuncType = typeof(Func<,>).MakeGenericType(
                        new Type[] { Type.GetType(srcType), typeof(Task) });
                    genericType = Type.GetType(blockType).MakeGenericType(new Type[] { Type.GetType(srcType) });
                }
                else if (srcType.IsNullOrWhitespace() && !destType.IsNullOrWhitespace())
                {
                    genericFuncType = typeof(Func<,>).MakeGenericType(
                        new Type[] { typeof(Task<>).MakeGenericType(Type.GetType(destType)) });
                    genericType = Type.GetType(blockType).MakeGenericType(new Type[] { Type.GetType(destType) });
                }
                else if (!srcType.IsNullOrWhitespace() && !destType.IsNullOrWhitespace())
                {
                    genericFuncType = typeof(Func<,>).MakeGenericType(
                        new Type[] { Type.GetType(srcType), typeof(Task<>).MakeGenericType(Type.GetType(destType)) });
                    genericType = Type.GetType(blockType).MakeGenericType(new Type[] { Type.GetType(srcType), Type.GetType(destType) });
                }
                else
                {
                    // Has to be an ISourceBlock or ITargetBlock derived class so this case should never happen
                }

                var cnstctr = genericType.GetConstructor(new Type[] { genericFuncType, typeof(ExecutionDataflowBlockOptions) });

                dynamic tBlock1 = cnstctr.Invoke(new object[] {f,  new ExecutionDataflowBlockOptions()
                {
                    MaxDegreeOfParallelism = maxParallelism,
                    BoundedCapacity = (boundedCapacity == -1) ? DataflowBlockOptions.Unbounded : boundedCapacity,
                    EnsureOrdered = ensureOrdered
                }});

                MethodInfo sendAsync = (!srcType.IsNullOrWhitespace()) ?
                    DynamicBlock.sendAsyncInfo.MakeGenericMethod(Type.GetType(srcType)) : null;

                MethodInfo linkTo2 = (!destType.IsNullOrWhitespace()) ?
                    DynamicBlock.linkTo2Info.MakeGenericMethod(Type.GetType(destType)) : null;

                MethodInfo linkTo3 = (!destType.IsNullOrWhitespace()) ?
                    DynamicBlock.linkTo3Info.MakeGenericMethod(Type.GetType(destType)) : null;

                MethodInfo linkTo4 = (!destType.IsNullOrWhitespace()) ?
                    DynamicBlock.linkTo4Info.MakeGenericMethod(Type.GetType(destType)) : null;

                return new DynamicBlock(tBlock1, sendAsync, linkTo2, linkTo3, linkTo4);
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public static Func<T, TResult> Funcify<T, TResult>(Func<T, TResult> f)
        { return f; }

        public static Func<T> Actionify<T>(Func<T> f)
        { return f; }

        public class Msg
        {
            public int x;
            public bool HasError;

            public Msg() { }

            public Msg(Msg msg)
            {
                this.x = msg.x;
                this.HasError = msg.HasError;
            }

        }

        // This method goes away completely from the library - it is here to see the explicit way to use TPL Dataflow
        public static async Task ActionTester()
        {
            var tBlock1 = new TransformBlock<Msg, Msg>(async msg =>
            {
                var response = await tBlock1Behavior(msg);
                return response;
            }, new ExecutionDataflowBlockOptions
            {
                MaxDegreeOfParallelism = 2,
                BoundedCapacity = DataflowBlockOptions.Unbounded,
                EnsureOrdered = false
            });

            var tBlock2 = new TransformBlock<Msg, Msg>(async msg =>
            {
                var response = await tBlock2Behavior(msg);
                return response;
            }, new ExecutionDataflowBlockOptions
            {
                MaxDegreeOfParallelism = 2,
                BoundedCapacity = DataflowBlockOptions.Unbounded,
                EnsureOrdered = false
            });

            var actionBlock = new ActionBlock<Msg>(async msg =>
            {
                var result = await aBlockBehavior(msg);
            }, new ExecutionDataflowBlockOptions
            {
                MaxDegreeOfParallelism = 2,
                BoundedCapacity = DataflowBlockOptions.Unbounded,
                EnsureOrdered = false
            });

            tBlock1.LinkTo<Msg>(tBlock2, new DataflowLinkOptions
            {
                PropagateCompletion = true
            }, response => !response.HasError); // LinkTo only for Responses with HasError != true
            tBlock1.LinkTo(DataflowBlock.NullTarget<Msg>());

            tBlock2.LinkTo<Msg>(actionBlock, new DataflowLinkOptions
            {
                PropagateCompletion = true
            }, response => !response.HasError); // LinkTo only for Responses with HasError != true
            tBlock2.LinkTo(DataflowBlock.NullTarget<Msg>());

            for (int i = 0; i < 10; i++)
                await tBlock1.SendAsync(new Msg { x = i });

            tBlock1.Complete();

            await actionBlock.Completion;
        }

        // This method goes away - it is only used by the ActionTester
        public static async Task<Msg> tBlock1Behavior(Msg msg)
        {
            try
            {
                Console.WriteLine("tBlock1Behavior: " + msg.x + " before delay");
                await Task.Delay(100);
                Console.WriteLine("tBlock1Behavior: " + msg.x + " after delay");
                return new Msg { x = msg.x, HasError = msg.x % 2 == 0 ? false : true };
            }
            catch (Exception ex)
            {
                return new Msg { x = 0, HasError = false };
            }
        }

        // This method goes away - it is only used by the ActionTester
        public static async Task<Msg> tBlock2Behavior(Msg msg)
        {
            try
            {
                Console.WriteLine("tBlock2Behavior: " + msg.x + " before delay");
                await Task.Delay(100);
                Console.WriteLine("tBlock2Behavior: " + msg.x + " after delay");
                return new Msg { x = msg.x, HasError = msg.x % 4 == 0 ? false : true };
            }
            catch (Exception ex)
            {
                return new Msg { x = 0, HasError = false };
            }
        }

        // This method goes away - it is only used by the ActionTester
        public static async Task<Msg> aBlockBehavior(Msg msg)
        {
            try
            {
                Console.WriteLine("aBlockBehavior: " + msg.x + " before delay");
                await Task.Delay(100);
                Console.WriteLine("aBlockBehavior: " + msg.x + " after delay");
                return new Msg { x = msg.x, HasError = false };
            }
            catch (Exception ex)
            {
                return new Msg { x = 0, HasError = false };
            }
        }
    }
}
