using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    // This will get moved to dynamic code once it is available
    internal static class TransitionLoggerDecoration
    {
        private static async Task<IDictionary<string, object>> Evaluate(Request request, DictionaryStack parameters)
        {
            var targetEntityId = parameters.Get<Guid>("TargetEntityId");

            var targetEntity = await Entity.GetEntity(targetEntityId);
            var targetEntityName = targetEntity.Get("Name", string.Empty);
            var targetId = GuidHelper.ToInt(targetEntityId);

            var calls = parameters.Get<dynamic>("Calls");

            var decorationStage = parameters.Get<string>("DecorationStage");
            if (decorationStage == "Post")
            {
                await calls.IO("Unindent");
            }

            var message = parameters.Get("Message", string.Empty);

            await calls.IO("WriteLine", string.Format("TransitionLogger: {0}-Evaluate Entity: {1} {2} {3} {4}", decorationStage, message, targetId, targetEntityName, targetEntityId));

            if (decorationStage == "Pre")
            {
                await calls.IO("Indent");
            }

            return null;
        }
    }
}
