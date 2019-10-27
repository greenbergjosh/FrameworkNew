using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;

namespace QuickTester
{
    class DataFlowTester
    {
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
