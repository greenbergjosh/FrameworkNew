using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility;
using Utility.EDW.Reporting;

namespace TrackingDataLib
{
    internal static class Common
    {
        internal static Task<IEnumerable<string>> GetRsIds(HttpContext context)
        {
            var rsIds = context.Request.Query["rsid"];
            if (rsIds.Count == 0)
            {
                throw new HttpException(400, "No reporting session ID's specified.");
            }

            return Task.FromResult((IEnumerable<string>)rsIds.ToArray());
        }

        internal static Task DropEvent(PL payload, IEnumerable<string> rsIds, DateTime timestamp, FrameworkWrapper fw)
        {
            var rsidDict = new Dictionary<string, object>();
            rsidDict.AddRange(rsIds.Select(rsid => (rsid, (object)rsid)));

            var openPixelEvent = new EdwBulkEvent();
            openPixelEvent.AddEvent(Guid.NewGuid(), timestamp, rsidDict, null, payload);
            return fw.EdwWriter.Write(openPixelEvent);
        }
    }
}
