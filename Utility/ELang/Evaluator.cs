using DataManager;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core
{
    public static class Evaluator
    {
        #region Public Static Methods
        public static async Task<IDictionary<string, object>> Evaluate(Guid entityId, Request request, DictionaryStack parameters)
        {
            // Testing integration to IGenericEntity - not the final form - consider async, perf improvements, methods with defaults
            // Definitely want to have the dictionary to quickly find the desired entity by id
            // Afterwards, it would be nice to be able to parse the individual JSON entity using IGenericEntity
            var s = EntityManager.Data.GetS("Type");

            var entity = await Entity.GetEntity(entityId);
            if (entity == null)
            {
                throw new ArgumentException("No entity found with Id: [" + entityId + "]");
            }

            IDictionary<string, object> evaluateConfiguration = null;
            var evaluateType = entity.Get("Type", null);
            if (evaluateType != null)
            {
                var evaluateTypeInt = entity.Get<int>("Type", 0);
                var evaluateTypeGuid = GuidHelper.FromInt(evaluateTypeInt);
                var typeEntity = await Entity.GetEntity(evaluateTypeGuid);
                if (typeEntity == null)
                {
                    throw new ArgumentException("No entity found with Id: [" + evaluateTypeGuid + "]");
                }

                evaluateConfiguration = typeEntity.Get("Evaluate", null);
            }
            else
            {
                evaluateConfiguration = entity.Get("Evaluate", null);
                if (evaluateConfiguration.Get("Constant", null) != null)
                {
                    return new Dictionary<string, object>() { { "this", entity } };
                }
            }

            if (evaluateConfiguration == null)
            {
                return null;
            }

            var parametersXXX = new DictionaryStack(new Dictionary<string, object>() { { "this", entity } });
            var providerType = evaluateConfiguration.Get<string>("ProviderType");
            var provider = CodeProviderFactory.Get(providerType);
            var evaluate = provider.GetEvaluate(evaluateConfiguration);
            return await evaluate(request, parametersXXX);
        }
        /*
                public static async Task<IDictionary<string, object>> Evaluate(Guid entityId, Request request, DictionaryStack parameters)
                {
                    // Deliberately avoid the obvious recursion while maintaining the alternating call stack via Inner Evaluate
                    IDictionary<string, object> result = null;
                    Stack<IDictionary<string, object>> callStack = new Stack<IDictionary<string, object>>();
                    IDictionary<string, object> closure = new Dictionary<string, object>() { { "EntityId", entityId }, { "ActualParameters", new Dictionary<string, object>() } };

                    while (closure != null)
                    {
                        result = await InnerEvaluate(closure, request, parameters, null);

                        if ((closure = result.Get("CallThis", null)) != null)
                            callStack.Push(result.Get("_ContinueWithThis", null));
                        else
                            closure = callStack.Count > 0 ? callStack.Pop() : null;
                    }

                    return result;
                }

                public static async Task<IDictionary<string, object>> InnerEvaluate(IDictionary<string, object> closure, Request request, DictionaryStack parameters, IDictionary<string, object> childResult)
                {
                    var entityId = (Guid)closure["EntityId"];
                    var entity = await Entity.GetEntity(entityId);
                    if (entity == null)
                    {
                        throw new ArgumentException("No entity found with Id: [" + entityId + "]");
                    }

                    var evaluateConfiguration = entity.Get("Evaluate", null);
                    if (evaluateConfiguration == null) return null;

                    var constant = evaluateConfiguration.Get("Constant", null);
                    if (constant != null)
                    {
                        return new Dictionary<string, object>()
                        {
                            {"me", entity}
                        };
                    }

                    var actualParameters = (IDictionary<string, object>)closure["ActualParameters"];
                    parameters.Push();
                    foreach (var parm in actualParameters)
                    {
                        parameters.Add(parm);
                    }

                    parameters.Add("_EntityId", entityId);
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
                        var providerType = evaluateConfiguration.Get<string>("ProviderType");
                        var provider = CodeProviderFactory.Get(providerType);
                        var evaluate = provider.GetEvaluate(evaluateConfiguration);

                        result = await evaluate(request, parameters);

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
                            result.Add("_ContinueWithThis", closure);

                    }

                    return result;
                }

            */
        #endregion
    }
}
