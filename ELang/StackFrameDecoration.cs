using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    // This will get moved to dynamic code once it is available
    internal static class StackFrameDecoration
    {
        private static async Task<IDictionary<string, object>> Evaluate(Request request, DictionaryStack parameters)
        {
            var decorationStage = parameters.Get<string>("DecorationStage");

            IDictionary<string, object> result = new Dictionary<string, object>();

            switch (decorationStage)
            {
                case "Pre":
                    var stackFrameId = parameters.Get("ContinuationPointer", Guid.NewGuid());
                    parameters.Get("IntroducedParameters")["StackFrameId"] = stackFrameId;
                    break;
                case "Post":
                    var compositeReturn = parameters.Get("CompositeReturn");
                    var completed = compositeReturn.Get("Completed", false);

                    if (!completed)
                    {
                        result["ContinuationPointer"] = parameters["StackFrameId"];
                    }
                    result["InContinuationPointer"] = parameters["StackFrameId"];
                    break;
                default:
                    throw new ArgumentException("Unknown DecorationStage [" + decorationStage + "]");
            }

            return await Task.FromResult(result);
        }
    }
}