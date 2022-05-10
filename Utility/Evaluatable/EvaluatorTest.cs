using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Utility.Evaluatable
{
    // We designed in-g and out-g so that a client can restart after initial bootstrap
    // This was because the path would bootstrap, move forward, process the next step, and then finally return to the client.
    // The client never got the bootstrap-g, only the splash-g.  The client could never request to go back in history to after bootstrap but before splash.
    // Is this something the framework needs to handle or is it just the way some applications work.  Could those apps be written to NOT do this and instead expose every g to the client?
    internal class EvaluatorTest
    {
        public class CallTable
        {
            private readonly IDictionary<(string variableName, Guid parentH), (Guid initialChildH, Guid finalChildH)> _callTable;

            public CallTable()
            {
                _callTable = new Dictionary<(string variableName, Guid parentH), (Guid initialChildH, Guid finalChildH)>();
            }

            public CallTable(IDictionary<(string variableName, Guid parentH), (Guid initialChildH, Guid finalChildH)> callTable)
            {
                _callTable = callTable;
            }
        }

        public record ERequest(EContext Context, Entity.Entity Entity);

        public record EResponse(IAsyncEnumerable<Entity.Entity> Result);

        public class EContext
        {
            private readonly CallTable _callTable;
            private readonly IDictionary<string, Entity.Entity> _locals;
            private readonly IDictionary<string, Entity.Entity> _threadState;
            private readonly IDictionary<string, Entity.Entity> _processState;
            private readonly IDictionary<string, Entity.Entity> _apartmentState;

            public EContext(CallTable callTable, IDictionary<string, Entity.Entity> locals, IDictionary<string, Entity.Entity> threadState, IDictionary<string, Entity.Entity> processState, IDictionary<string, Entity.Entity> apartmentState)
            {
                _callTable = callTable;
                _locals = locals;
                _threadState = threadState;
                _processState = processState;
                _apartmentState = apartmentState;
            }
        }

        public async Task<EResponse> LoopControllerEvaluatable(ERequest request)
        {
            // Consider evaluating "steps" lazily as needed versus fully evaluating on initial call
            var enumerable = await request.Entity.EvalE("continual://enumerable", request.Entity.Create(new { InitialValueGetterAsync = (Func<Task<Entity.Entity>>)(async () => await request.Entity.EvalE("enumerable")) }));
            var enumerableIndex = await request.Entity.Eval<int>("historical://enumerableIndex", request.Entity.Create(new { InitialValue = 0 }));

            // Consider evaluating "steps" lazily as needed versus fully evaluating on initial call
            var steps = await request.Entity.EvalE("continual://steps", request.Entity.Create(new { InitialValueGetterAsync = (Func<Task<Entity.Entity>>)(async () => await request.Entity.EvalE("steps")) }));
            var stepIndex = await request.Entity.Eval<int>("historical://stepIndex", request.Entity.Create(new { InitialValue = 0 }));

            Entity.Entity currentItem;

            if (stepIndex == await steps.EvalI("length"))
            {
                await request.Entity.EvalVoid("historical://enumerableIndex", request.Entity.Create(new { Value = enumerableIndex++ }));

                currentItem = await enumerable.EvalE($"@[{enumerableIndex}");
                await request.Entity.EvalVoid("historical://currentItem", request.Entity.Create(new { Value = currentItem }));

                // Check if something was returned, if not then exit
                if (currentItem == null)
                {
                    return null;
                }

                stepIndex = 0;
            }
            else
            {
                currentItem = await request.Entity.EvalE("historical://currentItem");
            }

            // Eval steps[stepIndex]
            var response = steps.Eval($"@[{stepIndex}]", request.Entity.Create(new { Current = currentItem }));
            // Increment stepIndex
            await request.Entity.EvalVoid("historical://stepIndex", request.Entity.Create(new { Value = stepIndex + 1 }));

            return new EResponse(response);
        }

        //public IAsyncEnumerable<Entity.Entity> Evaluate(Entity.Entity entity, Entity.Entity parameters)
        //{
        //    // initialize eval context (threadState, evaluatableState (continual), historialState)
        //    // handle stack/grid/none
        //    // call trampoline
        //    // return result
        //}

        public async Task Main()
        {
            var fw = await FrameworkWrapper.Create();// entity config, eval config);

            WebHost.CreateDefaultBuilder()
                .Configure(app =>
                {
                    // configure application pipeline
                    app.Run(async c =>
                    {
                        var entityWithRequestScope = fw.Entity.Wrap(null); // Retriever that handles request://

                        Guid topLevelRequestHandlerEntityFromConfig = Guid.Empty;

                        var result = entityWithRequestScope.Eval($"entity://{topLevelRequestHandlerEntityFromConfig}");

                        await c.Response.WriteAsync("Hello World!");
                    });
                })
                .Build().Run();
            // Initialize memory, entity, etc...
            // If this was a webAPI, translate HTTP request to eval request
            // If a console app, translate input to eval request
        }
    }
}
