using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility;
using Utility.GenericEntity;

namespace TrackingDataLib
{
    internal class OpenPixel
    {
        internal static async Task Process(IGenericEntity parameters, HttpContext context, FrameworkWrapper fw)
        {
            var timestamp = DateTime.UtcNow;

            // We do this in the HTTP thread because it could throw if input is not correct
            var rsIds = await Common.GetRsIds(parameters);

            _ = Task.Run(async () => await BackgroundProcess(timestamp, rsIds, fw));

            await Common.WritePixel(context, fw);
        }

        private static async Task BackgroundProcess(DateTime timestamp, Dictionary<string, object> rsIds, FrameworkWrapper fw)
        {
            try
            {
                await Cache.Set(rsIds, GenericEntityJson.CreateFromObject(new
                {
                    openTimestamp = timestamp
                }));

                var payload = PL.O(new
                {
                    et = "OpenPixel"
                });

                await Common.DropEvent(payload, rsIds, timestamp, fw);
            }
            catch (Exception ex)
            {
                await fw.Error("OpenPixel.Process", $"Exception: {ex}");
            }
        }
    }
}