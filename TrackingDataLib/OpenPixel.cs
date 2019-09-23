using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility;
using Utility.EDW.Reporting;

namespace TrackingDataLib
{
    internal class OpenPixel
    {
        internal static async Task Process(HttpContext context, FrameworkWrapper fw)
        {
            // 1. Get rsIds from request
            var rsIds = await Common.GetRsIds(context);

            // 2. Write to cache using RS Id's as key
            var timestamp = DateTime.UtcNow;
            await Cache.Set(string.Join(',', rsIds), new
            {
                timestamp
            });

            // 3. Drop OpenPixel event
            var payload = PL.O(new
            {
                et = "OpenPixel"
            });

            await Common.DropEvent(payload, rsIds, timestamp, fw);
        }
    }
}