using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    // This will get moved to dynamic code once it is available
    internal static class BootstrapEvaluatable
    {
        private static Dictionary<Guid, Guid> _continuationPointers = new Dictionary<Guid, Guid>();

        private static async Task<IDictionary<string, object>> Evaluate(Request request, DictionaryStack parameters)
        {
            var requestParameters = new DictionaryStack();
            requestParameters.Push();
            foreach (KeyValuePair<string, object> kvp in request)
            {
                requestParameters[kvp.Key] = kvp.Value;
            }

            Guid requestedEntityId;

            var continuationPointer = request.Get("g", Guid.Empty);
            if (continuationPointer == Guid.Empty)
            {
                var requestedEntity = request.Get<string>("entityId");
                if (!Guid.TryParse(requestedEntity, out requestedEntityId))
                {
                    requestedEntityId = GuidHelper.FromInt(int.Parse(requestedEntity));
                }
            }
            else
            {
                requestedEntityId = _continuationPointers[continuationPointer];
                requestParameters["ContinuationPointer"] = continuationPointer;
            }

            // Used to be Evaluator.Evaluate()
            var result = await Evaluatable.Evaluate(requestedEntityId, request, requestParameters);
            var calls = parameters.Get<dynamic>("Calls");

            var inContinuationPointer = result.Get("InContinuationPointer", Guid.Empty);
            if (inContinuationPointer != Guid.Empty)
            {
                if (!_continuationPointers.ContainsKey(inContinuationPointer))
                {
                    _continuationPointers.Add(inContinuationPointer, requestedEntityId);
                }
                await calls.IO(string.Format(@"<br/>Current: <a href=""http://localhost:54744/Default.ashx?g={0}&value=10"">{0}</a>", inContinuationPointer));
            }

            var nextContinuationPointer = result.Get("ContinuationPointer", Guid.Empty);
            if (nextContinuationPointer != Guid.Empty)
            {
                _continuationPointers[nextContinuationPointer] = requestedEntityId;
                await calls.IO(string.Format(@"<br/>Next: <a href=""http://localhost:54744/Default.ashx?g={0}&value=10"">{0}</a>", nextContinuationPointer));
            }

            return result;
        }
    }
}
