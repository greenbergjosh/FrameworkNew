using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    internal static class Evaluatable
    {
        #region Public Static Methods
        public static async Task<IDictionary<string, object>> Evaluate(Guid entityId, Request request, DictionaryStack parameters)
        {
            // Deliberately avoid the obvious recursion while maintaining the alternating call stack via Inner Evaluate
            IDictionary<string, object> result = null;
            Stack<IDictionary<string, object>> callStack = new Stack<IDictionary<string, object>>();
            IDictionary<string, object> closure = new Dictionary<string, object>() { { "Entity", parameters["this"] }, { "ActualParameters", new Dictionary<string, object>() } };

            while (closure != null)
            {
                result = await InnerEvaluate(closure, request, parameters, null);

                if ((closure = result.Get("_CallThis", null)) != null)
                    callStack.Push(result.Get("_ContinueWithThis", null));
                else
                    closure = callStack.Count > 0 ? callStack.Pop() : null;
            }

            return result;
        }

        public static async Task<IDictionary<string, object>> InnerEvaluate(IDictionary<string, object> closure, Request request, DictionaryStack parameters, IDictionary<string, object> childResult)
        {
            Entity entity = (Entity)closure["Entity"];

            var evaluateConfiguration = entity.Get("Evaluate", null);
            if (evaluateConfiguration == null) return null;

            var actualParameters = (IDictionary<string, object>)closure["ActualParameters"];
            parameters.Push();
            foreach (var parm in actualParameters)
            {
                parameters.Add(parm);
            }

            //parameters.Add("_EntityId", entity.);  // Should be a simple way to pull the id from the entity
            parameters.Add("_Me", entity);
            parameters.Add("_LastChildResult", childResult);

            IDictionary<string, object> result;
            var evalEntityId = evaluateConfiguration.Get<Guid>("EntityId", Guid.Empty);
            if (evalEntityId != Guid.Empty)
            {
                result = new Dictionary<string, object>() {
                    { "Completed", false },
                    { "_CallThis", new Dictionary<string, object>() {
                            { "EntityId", evalEntityId },
                            { "ActualParameters", actualParameters }
                        }
                    }
                };
            }
            else
            {
                result = await Evaluator.Evaluate(entity.Get("EntityId", Guid.Empty), request, parameters);  // ugly force to compile

                // Evaluate maps the entries in Output based on OutputMappings configuration on the evaluatable
                //  This allows a composite to change the name of the variable it will introduce into scope for its next child
                // Evaluate expects the result to contain { "Completed": "True"|"False", "CallChild": {{"EntityId": xxx}, {"ActualParameters"}}, "Output": {} }
                // Evaluate is Completed when its child is completed - it daisy chains completed
                var outputMappings = evaluateConfiguration.Get("OutputMappings", null);
                var output = result.Get("Output", null);
                if (output != null)
                {
                    foreach (var map in outputMappings)
                    {   // map.Key is FromName, map.Value to ToName
                        if (output.ContainsKey(map.Key))
                        {
                            output.Add((string)map.Value, output[map.Key]);
                            output.Remove(map.Key);
                        }
                    }
                }

                if (result.Get("_CallThis") == null)
                    parameters.Pop();
                else
                    // Interestingly, this could be returned from the evaluatable - the continuation need not be the closure passed in
                    result.Add("_ContinueWithThis", closure);  

            }

            return result;
        }
        #endregion 
    }
}
