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

            var rsIds = await Common.GetRsIds(parameters);

            _ = Task.Run(async () => await BackgroundProcess(timestamp, rsIds, fw));

            await Common.WritePixel(context, fw);
        }

        private static async Task BackgroundProcess(DateTime timestamp, Dictionary<string, object> rsIds, FrameworkWrapper fw)
        {
            var key = string.Join(',', rsIds.Select(kvp => $"{kvp.Key}:{kvp.Value}"));
            await Cache.Set(key, new
            {
                timestamp
            });

            var payload = PL.O(new
            {
                et = "OpenPixel"
            });

            await Common.DropEvent(payload, rsIds, timestamp, fw);
        }
    }
}