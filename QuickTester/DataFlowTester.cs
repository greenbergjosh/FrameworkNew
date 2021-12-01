using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
		""behavior"": {
            ""code"": ""return $\""Processed by 1: {p.Input}\"";""
        }
	}, {
		""id"": 2,
		""blockType"": ""Transform"",
		""inputType"": ""System.String"",
		""outputType"": ""System.String"",
		""behavior"": {
     		""code"": ""return p.Input.ToLower();""
        }
	}, {
		""id"": 3,
		""blockType"": ""Transform"",
		""inputType"": ""System.String"",
		""outputType"": ""System.String"",
		""behavior"": {
     		""code"": ""return p.Input.ToUpper();""
        }
	}, {
		""id"": 4,
		""blockType"": ""Action"",
		""inputType"": ""System.String"",
		""behavior"": {
     		""#code"": ""System.Console.WriteLine(p.Input);"",
            ""entityId"": ""088d9b95-ebe2-4646-97b8-8d0b2cfcd1e5""
        },
		""#maxDegreeOfParallelism"": 1
	}],
	""links"": [{
		""from"": 1,
		""to"": 2,
        ""predicate"": {
             ""code"": ""return (p.Input[p.Input.Length - 1] - '0') % 2 == 0;""
         }
	}, {
		""from"": 1,
		""to"": 3,
        ""predicate"": {
            ""code"": ""return (p.Input[p.Input.Length - 1] - '0') % 2 != 0;""
        }
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

            var fw = await FrameworkWrapper.Create();

            var flow = await DynamicDataflow.Create(await fw.Entity.Parse("application/json", config), fw);

            var sendTasks = new List<Task<bool>>();

            for (var i = 0; i < 10; i++)
            {
                sendTasks.Add(flow.SendAsync(1, $"HELLO {i}"));
            }

            _ = await Task.WhenAll(sendTasks);

            if (sendTasks.Any(t => !t.Result))
            {
                throw new Exception("Failed to send all messages.");
            }

            flow.Complete(1);

            await flow.Completed(2, 3).ContinueWith(_ => flow.Complete(4));

            await flow.AllCompleted;
        }
    }
}
