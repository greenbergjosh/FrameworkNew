using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Dynamic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using Utility;

namespace QuickTester
{
    public class DataFlowTester
    {
        public static async Task TestDynamicBlockCreator()
        {
            //await ActionTester();
            //await DynamicBlockCreatorOld(
            //    "System.Threading.Tasks.Dataflow.TransformBlock`2, System.Threading.Tasks.Dataflow",
            //    "QuickTester.DataFlowTester+Msg",
            //    "QuickTester.DataFlowTester+Msg",
            //    Guid.NewGuid(), 2, 3, false);

            var fw = new FrameworkWrapper(null);
            

            dynamic x = DynamicBlockCreator(
                "System.Threading.Tasks.Dataflow.TransformBlock`2, System.Threading.Tasks.Dataflow",
                "QuickTester.DataFlowTester+Msg",
                "QuickTester.DataFlowTester+Msg",
                fw,
                Guid.NewGuid(), 2, DataflowBlockOptions.Unbounded, false);
            x.LinkTo(DataflowBlock.NullTarget<Msg>(), new DataflowLinkOptions
            {
                PropagateCompletion = true
            }, (Predicate<Msg>)((Msg response) => !response.HasError));

            await x.SendAsync(new Msg { x = 1 });
            await x.SendAsync(new Msg { x = 2 });
            await x.SendAsync(new Msg { x = 3 });
            x.Complete();
            Task tt = x.Completion;
            await tt;
        }

        
        public class DynamicBlock : System.Dynamic.DynamicObject
        {
            dynamic block;
            MethodInfo sendAsync;
            MethodInfo linkTo2;
            MethodInfo linkTo3;
            MethodInfo linkTo4;

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

        public static DynamicBlock DynamicBlockCreator(string blockType, string srcType, string destType, FrameworkWrapper fw, Guid lbmId, int maxParallelism, int boundedCapacity, bool ensureOrdered)
        {
            try
            {
                Type genericType = Type.GetType(blockType).MakeGenericType(new Type[]{ Type.GetType(srcType), Type.GetType(destType) });
                Type genericFuncType = typeof(Func<,>).MakeGenericType(
                    new Type[]{ Type.GetType(srcType), typeof(Task<>).MakeGenericType(Type.GetType(destType)) });
                var cnstctr = genericType.GetConstructor(new Type[] { genericFuncType, typeof(ExecutionDataflowBlockOptions) });

                dynamic tBlock1 = cnstctr.Invoke(new object[] {Funcify(async (object msg) =>
                {
                    try
                    {
                        // Maybe call the LBM and cast its result
                        Console.WriteLine("aBlockBehavior: before delay");
                        Console.WriteLine("lbm" + lbmId.ToString());
                        var lbm = (await fw.Entities.GetEntity(lbmId))?.GetS("Config");
                        var lbmResult = (string)await fw.RoslynWrapper.Evaluate(lbmId, lbm,
                            new { msg, err = fw.Err }, new StateWrapper());
                        await Task.Delay(100);
                        Console.WriteLine("aBlockBehavior: after delay");
                        return Convert.ChangeType(lbmResult, Type.GetType(destType));
                        //return new Msg { x = 1, HasError = false };
                    }
                    catch (Exception ex)
                    {
                        return new Msg { x = 0, HasError = false };
                    }

                }),  new ExecutionDataflowBlockOptions()
                {
                    MaxDegreeOfParallelism = maxParallelism,
                    BoundedCapacity = (boundedCapacity == -1) ? DataflowBlockOptions.Unbounded : boundedCapacity,
                    EnsureOrdered = ensureOrdered
                }});

                // This does not need to be called every time
                // public static Task<bool> SendAsync<TInput>(this ITargetBlock<TInput> target, TInput item);
                var sendAsyncQuery = from method in typeof(DataflowBlock).GetMethods(BindingFlags.Static
                            | BindingFlags.Public | BindingFlags.NonPublic)
                            where method.GetParameters().Length == 2
                            where method.IsDefined(typeof(ExtensionAttribute), false)
                            where method.GetParameters()[0].ParameterType.GetGenericTypeDefinition() == typeof(ITargetBlock<>)
                            where method.GetParameters()[1].ParameterType == method.GetGenericArguments()[0]
                            where method.Name == "SendAsync"
                            select method;

                MethodInfo sendAsyncInfo = sendAsyncQuery.First();
                var sendAsync = sendAsyncInfo.MakeGenericMethod(Type.GetType(srcType));

                //public static IDisposable LinkTo<TOutput>(this ISourceBlock<TOutput> source, ITargetBlock<TOutput> target);
                //public static IDisposable LinkTo<TOutput>(this ISourceBlock<TOutput> source, ITargetBlock<TOutput> target, Predicate<TOutput> predicate);
                //public static IDisposable LinkTo<TOutput>(this ISourceBlock<TOutput> source, ITargetBlock<TOutput> target, DataflowLinkOptions linkOptions, Predicate<TOutput> predicate);

                // This does not need to be called every time
                var linkTo2Query = from method in typeof(DataflowBlock).GetMethods(BindingFlags.Static
                            | BindingFlags.Public | BindingFlags.NonPublic)
                            where method.GetParameters().Length == 2
                            where method.IsDefined(typeof(ExtensionAttribute), false)
                            where method.GetParameters()[0].ParameterType.GetGenericTypeDefinition() == typeof(ISourceBlock<>)
                            where method.GetParameters()[1].ParameterType.GetGenericTypeDefinition() == typeof(ITargetBlock<>)
                            where method.Name == "LinkTo"
                            select method;

                MethodInfo linkTo2Info = linkTo2Query.First();
                var linkTo2 = linkTo2Info.MakeGenericMethod(Type.GetType(destType));

                var linkTo3Query = from method in typeof(DataflowBlock).GetMethods(BindingFlags.Static
                            | BindingFlags.Public | BindingFlags.NonPublic)
                                   where method.GetParameters().Length == 3
                                   where method.IsDefined(typeof(ExtensionAttribute), false)
                                   where method.GetParameters()[0].ParameterType.GetGenericTypeDefinition() == typeof(ISourceBlock<>)
                                   where method.GetParameters()[1].ParameterType.GetGenericTypeDefinition() == typeof(ITargetBlock<>)
                                   where method.GetParameters()[2].ParameterType.GetGenericTypeDefinition() == typeof(Predicate<>)
                                   where method.Name == "LinkTo"
                                   select method;

                MethodInfo linkTo3Info = linkTo3Query.First();
                var linkTo3 = linkTo3Info.MakeGenericMethod(Type.GetType(destType));

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

                MethodInfo linkTo4Info = linkTo4Query.First();
                var linkTo4 = linkTo4Info.MakeGenericMethod(Type.GetType(destType));

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

        public class Msg { public int x; public bool HasError; }
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
