using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Primitives;

namespace Utility
{
    public static class HttpContextExt
    {
        public static string Ip(this HttpContext ctx) => ctx.Connection.RemoteIpAddress?.ToString() ?? "";

        public static string UserAgent(this HttpContext ctx) => !StringValues.IsNullOrEmpty(ctx.Request.Headers["User-Agent"]) ? ctx.Request.Headers["User-Agent"].ToString() : "";

        // Slightly modified versions of:
        // https://weblog.west-wind.com/posts/2017/Sep/14/Accepting-Raw-Request-Body-Content-in-ASPNET-Core-API-Controllers
        public static async Task<string> GetRawBodyStringAsync(this HttpContext ctx, Encoding encoding = null)
        {
            if (encoding == null)
            {
                encoding = Encoding.UTF8;
            }

            using var reader = new StreamReader(ctx.Request.Body, encoding);
            return await reader.ReadToEndAsync();
        }

        public static async Task WriteSuccessRespAsync(this HttpContext ctx, string response, Encoding enc = null, string contentType = "application/json")
        {
            ctx.Response.StatusCode = 200;
            ctx.Response.ContentType = contentType;
            await ctx.Response.WriteAsync(response, enc ?? Encoding.UTF8);
        }

        public static async Task WriteFailureRespAsync(this HttpContext ctx, string response, Encoding enc = null, string contentType = "application/json")
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.ContentType = contentType;
            await ctx.Response.WriteAsync(response, enc ?? Encoding.UTF8);
        }

        // based off of: https://referencesource.microsoft.com/#System.Web/WorkerRequest.cs,ab8517882440da8b
        public static bool IsLocal(this HttpContext ctx)
        {
            var connection = ctx.Connection;

            var remoteAddress = connection.RemoteIpAddress.ToString();

            // if unknown, assume not local
            if (string.IsNullOrEmpty(remoteAddress))
            {
                return false;
            }

            // check if localhost
            if (remoteAddress is "127.0.0.1" or "::1")
            {
                return true;
            }

            // compare with local address
            return remoteAddress == connection.LocalIpAddress.ToString();
        }
    }
}