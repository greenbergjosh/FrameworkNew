using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility;
using Utility.GenericEntity;

namespace TrackingDataLib
{
    internal class Click
    {
        internal static async Task Process(IGenericEntity parameters, HttpContext context, FrameworkWrapper fw)
        {
            var timestamp = DateTime.UtcNow;

            var rsIds = await Common.GetRsIds(parameters);

            var linkoutToken = Guid.NewGuid();

            context.Response.Cookies.Append(Common.LinkoutTokenCookie, linkoutToken.ToString());

            _ = Task.Run(async () => await BackgroundProcess(linkoutToken, timestamp, rsIds, fw));

            var redirectUrl = parameters.GetS("redirectUrl");

            redirectUrl = redirectUrl.Replace("[=linkoutToken=]", linkoutToken.ToString());

            context.Response.Redirect(redirectUrl);
        }

        private static async Task BackgroundProcess(Guid linkoutToken, DateTime timestamp, Dictionary<string, object> rsIds, FrameworkWrapper fw)
        {
            try
            {
                var openToClickSeconds = -1;

                var (found, context) = await Cache.TryGet(rsIds);
                if (found)
                {
                    if (DateTime.TryParse(context.GetS("openTimestamp"), out var openTimestamp))
                    {
                        openToClickSeconds = (int)(timestamp - openTimestamp).TotalSeconds;
                    }

                    context.Set("rsIds", rsIds);
                    context.Set("clickTimestamp", timestamp);
                }
                else
                {
                    context = GenericEntityJson.CreateFromObject(new
                    {
                        rsIds,
                        clickTimestamp = timestamp
                    });
                }

                await Cache.Set(linkoutToken, context);
                await Cache.Set(rsIds, context);

                var payload = PL.O(new
                {
                    et = "Click",
                    openToClickSeconds,
                    linkoutToken,
                });

                await Common.DropEvent(payload, rsIds, timestamp, fw);
            }
            catch (Exception ex)
            {
                await fw.Error("Click.Process", $"Exception: {ex}");
            }
        }
    }
}