using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility;
using Utility.Crypto;
using Utility.EDW.Reporting;
using Utility.GenericEntity;

namespace TrackingDataLib
{
    internal static class Common
    {
        internal static readonly string LinkoutTokenCookie = "lot";

        internal static Task DropEvent(PL payload, Dictionary<string, object> rsIds, DateTime timestamp, FrameworkWrapper fw)
        {
            var edwEvent = new EdwBulkEvent();
            var eventId = Guid.NewGuid();
#if DEBUG
            System.Diagnostics.Debug.WriteLine($"Writing event: {eventId}");
#endif
            //edwEvent.AddEvent(eventId, timestamp, rsIds, null, payload);
            return fw.EdwWriter.Write(edwEvent);
        }

        internal static IGenericEntity GetParameters(HttpContext context, FrameworkWrapper fw)
        {
            if (!context.Request.QueryString.HasValue)
            {
                throw new HttpException(400, "Invalid input");
            }

            var queryString = context.Request.QueryString.Value.Substring(1);
            var cryptoKey = fw.StartupConfiguration.GetS("/cryptoKey");
            var authKey = fw.StartupConfiguration.GetS("/authKey");

            var json = SimpleEncryption.SimpleDecrypt(queryString, cryptoKey, authKey);

            return JsonWrapper.JsonToGenericEntity(json);
        }

        internal static Task<Dictionary<string, object>> GetRsIds(IGenericEntity parameters)
        {
            var rsIds = parameters.GetD("/rsIds").ToDictionary(t => t.Item1, t => (object)t.Item2);
            if (rsIds.Count() == 0)
            {
                throw new HttpException(400, "No reporting session ID's specified.");
            }

            return Task.FromResult(rsIds);
        }

        internal static Task WritePixel(HttpContext context, FrameworkWrapper fw)
        {
            context.Response.ContentType = fw.StartupConfiguration.GetS("/pixel/contentType");
            var pixel = Convert.FromBase64String(fw.StartupConfiguration.GetS("/pixel/body"));
            return context.Response.Body.WriteAsync(pixel, 0, pixel.Length);
        }
    }
}
