using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;
using Utility;
using Utility.GenericEntity;

namespace TrackingDataLib
{
    internal class ActionPixel
    {
        internal static async Task Process(IGenericEntity parameters, HttpContext context, FrameworkWrapper fw)
        {
            var timestamp = DateTime.UtcNow;

            if (!Guid.TryParse(parameters.GetS("linkoutToken"), out var linkoutToken) && !Guid.TryParse(context.Request.Cookies[Common.LinkoutTokenCookie], out linkoutToken))
            {
                throw new HttpException(401, "Missing linkout token");
            }

            _ = Task.Run(async () => await BackgroundProcess(linkoutToken, timestamp, fw));

            await Common.WritePixel(context, fw);
        }

        private static async Task BackgroundProcess(Guid linkoutToken, DateTime timestamp, FrameworkWrapper fw)
        {
            try
            {
                var (found, context) = await Cache.TryGet(linkoutToken);
                if (!found)
                {
                    await fw.Error("ActionPixel", $"Unable to find data for linkoutToken: {linkoutToken}");
                    return;
                }

                var rsIds = await Common.GetRsIds(context);

                var openToActionSeconds = -1;
                var clickToActionSeconds = -1;

                if (DateTime.TryParse(context.GetS("openTimestamp"), out var openTimestamp))
                {
                    openToActionSeconds = (int)(timestamp - openTimestamp).TotalSeconds;
                }
                if (DateTime.TryParse(context.GetS("clickTimestamp"), out var clickTimestamp))
                {
                    clickToActionSeconds = (int)(timestamp - clickTimestamp).TotalSeconds;
                }

                context.Set("actionTimestamp", timestamp);

                await Cache.Set(linkoutToken, context);
                await Cache.Set(rsIds, context);

                var payload = PL.O(new
                {
                    et = "Action",
                    openToActionSeconds,
                    clickToActionSeconds,
                    linkoutToken
                });

                await Common.DropEvent(payload, rsIds, timestamp, fw);
            }
            catch (Exception ex)
            {
                await fw.Error("Action.Process", $"Exception: {ex}");
            }
        }
    }
}