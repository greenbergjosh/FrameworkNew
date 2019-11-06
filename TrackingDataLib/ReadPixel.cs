using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Utility;
using Utility.GenericEntity;

namespace TrackingDataLib
{
    internal class ReadPixel
    {
        internal static async Task Process(IGenericEntity parameters, HttpContext context, FrameworkWrapper fw)
        {
            var timestamp = DateTime.UtcNow;

            var rsIds = await Common.GetRsIds(parameters);

            var pixelDurationSeconds = int.Parse(fw.StartupConfiguration.GetS("/readPixelDurationSeconds"));

            context.RequestAborted.Register(async () => await DropEvent(timestamp, rsIds, true, fw));

            await Task.Delay(pixelDurationSeconds * 1000);

            if (!context.RequestAborted.IsCancellationRequested)
            {
                _ = Task.Run(async () => await DropEvent(timestamp, rsIds, false, fw));

                await Common.WritePixel(context, fw);
            }
        }

        private static Task DropEvent(DateTime startTimestamp, Dictionary<string, object> rsIds, bool aborted, FrameworkWrapper fw)
        {
            var timestamp = DateTime.UtcNow;

            var duration = aborted ? (timestamp - startTimestamp).TotalMilliseconds : -1;

            var payload = PL.O(new
            {
                et = "ReadPixel",
                duration
            });

            return Common.DropEvent(payload, rsIds, timestamp, fw);
        }
    }
}