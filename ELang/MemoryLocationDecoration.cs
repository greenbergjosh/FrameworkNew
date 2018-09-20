using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    // This will get moved to dynamic code once it is available
    internal static class MemoryLocationDecoration
    {
        private static async Task<IDictionary<string, object>> Evaluate(Request request, DictionaryStack parameters)
        {
            var decorationStage = parameters.Get<string>("DecorationStage");

            switch (decorationStage)
            {
                case "Pre":
                    return await PreBehavior(request, parameters);
                case "Post":
                    return await Task.FromResult<IDictionary<string, object>>(null);
                default:
                    throw new ArgumentException("Unknown DecorationStage [" + decorationStage + "]");
            }
        }

        private static async Task<IDictionary<string, object>> PreBehavior(Request request, DictionaryStack parameters)
        {
            Guid readGuid = Guid.Empty;
            Guid writeGuid = Guid.Empty;

            var grid = parameters.Get<dynamic>("Grid", null);
            if (grid != null)
            {
                var cellId = parameters.Get<Guid>("CellId");
                writeGuid = cellId;
                Guid oldCellId = cellId;
                dynamic cell;
                do
                {
                    cell = await grid.GetCell(oldCellId);
                    oldCellId = cell.OldCellId;
                } while (oldCellId != Guid.Empty);

                Guid priorCellId = cell.PriorCellId;
                if (priorCellId != Guid.Empty)
                {
                    readGuid = priorCellId;
                }
            }
            else
            {
                var stackFrameId = parameters.Get("StackFrameId", Guid.Empty);
                if (stackFrameId != Guid.Empty)
                {
                    readGuid = stackFrameId;
                    writeGuid = stackFrameId;
                }
                else
                {
                    var targetEntityId = parameters.Get<Guid>("TargetEntityId");
                    var targetEntity = await Entity.GetEntity(targetEntityId);
                    var targetEntityParameters = targetEntity.Get("Placeholders", null);
                    if (targetEntityParameters != null)
                    {
                        var defaultMemoryLocation = targetEntityParameters.Get("MemoryLocationGuid", Guid.Empty);
                        if (defaultMemoryLocation != Guid.Empty)
                        {
                            readGuid = defaultMemoryLocation;
                            writeGuid = defaultMemoryLocation;
                        }
                    }
                }
            }

            var introducedParameters = parameters.Get("IntroducedParameters");
            introducedParameters["ReadLocation"] = readGuid;
            introducedParameters["WriteLocation"] = writeGuid;

            return null;
        }
    }
}
