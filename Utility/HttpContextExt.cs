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
        public static T Get<T>(this HttpContext context, string name, T defVal, Func<string, T> trans,
             bool throwIfNotFound = true, bool throwExc = true)
        {
            try
            {
                string s = context.Request.Query[name];
                return string.IsNullOrEmpty(s)
                    ? s == null && throwIfNotFound ? throw new Exception(name + " not found in querystring.") : defVal
                    : trans(s);
            }
            catch
            {
                if (throwExc)
                {
                    throw;
                }

                return defVal;
            }
        }

        public static string Get(this HttpContext context, string name, string defVal,
            bool throwIfNotFound = true, bool throwExc = true) => Get(context, name, defVal, x => x, throwIfNotFound, throwExc);

        public static void SetCookie(this HttpContext ctx, string key, string value, int expiresInMinsFromNow) => SetCookie(ctx, key, value, DateTime.UtcNow + TimeSpan.FromMinutes(expiresInMinsFromNow));

        public static void SetCookie(this HttpContext ctx, string key, string value, DateTime? expireTime = null)
        {
            CookieOptions option = new()
            {
                Path = "/",
                SameSite = SameSiteMode.None,
                HttpOnly = false
            };

            option.Expires = expireTime.HasValue ? expireTime.Value : (DateTimeOffset?)DateTime.Now.AddMilliseconds(10);

            ctx.Response.Cookies.Append(key, value, option);
        }

        public static void DeleteCookie(this HttpContext ctx, string key) => ctx.Response.Cookies.Delete(key);

        public static string Ip(this HttpContext ctx) => ctx.Connection.RemoteIpAddress?.ToString() ?? "";

        public static string UserAgent(this HttpContext ctx) => (!StringValues.IsNullOrEmpty(ctx.Request.Headers["User-Agent"])) ?
                ctx.Request.Headers["User-Agent"].ToString() :
                "";

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

        public static async Task<byte[]> GetRawBodyBytesAsync(this HttpContext ctx)
        {
            using var ms = new MemoryStream(2048);
            await ctx.Request.Body.CopyToAsync(ms);
            return ms.ToArray();
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

        public static async Task AddCorsAccessForOriginHost(this HttpContext ctx, Entity.Entity entity)
        {
            // https://docs.microsoft.com/en-us/aspnet/core/migration/21-to-22?view=aspnetcore-2.2&tabs=visual-studio
            // .netcore 2.2 makes this process more explicit (domains should be specified), so let's just echo the
            // requesting origin back, circumventing the problem. Feel free to add other methods as necessary below.

            // Nothing to do if we don't have an "Origin:" header or if our config is missing
            // the "allow-origin" directive
            if (!ctx.Request.Headers.TryGetValue("Origin", out var originHost) || await entity.GetS("allow-origin") == null)
            {
                return;
            }

            // "allow-origin": [ "*" ]
            //
            // "allow-origin": [ "https://example1.com","http://example2.com" ]
            //
            // When set to "*", add the request's "Origin:" header into the
            // response via the "Access-Control-Allow-Origin:" header
            //
            // Acts as a white-list when set to an explicit list of URLs, add
            // the the request's "Origin:" header into the response via the
            // "Access-Control-Allow-Origin:" header if the "Origin:" request
            // header matches a URL in the list.
            if (await entity.GetS("allow-origin[0]") == "*")
            {
                ctx.Response.Headers.Add("Access-Control-Allow-Origin", originHost);
            }
            else if ((await entity.GetL<string>("allow-origin")).Any(allowed => allowed == originHost))
            {
                ctx.Response.Headers.Add("Access-Control-Allow-Origin", originHost);
            }
            // "allow-headers": [ "origin", "x-requested-with", "access-control-request-headers", "content-type", "access-control-request-method", "accept" ],
            //
            // Comma-separates a list of values into the "Access-Control-Allow-Headers" response header
            if ((await entity.GetL("allow-headers")).Any())
            {
                ctx.Response.Headers.Add("Access-Control-Allow-Headers", string.Join(",", await entity.GetL<string>("allow-headers.*")));
            }
            // "allow-methods": [ "PUT", "POST", "GET", "PATCH", "HEAD" ],
            //
            // Comma-separates a list of values into the "Access-Control-Allow-Methods" response header
            if ((await entity.GetL("allow-methods")).Any())
            {
                ctx.Response.Headers.Add("Access-Control-Allow-Methods", string.Join(",", await entity.GetL<string>("allow-methods")));
            }

            // "allow-credentials": "true"
            //
            // Sets the "Access-Control-Allow-Credentials" response value to a bool to indicate cross-site cookie policy
            if (await entity.GetS("allow-credentials") != null)
            {
                ctx.Response.Headers.Add("Access-Control-Allow-Credentials", await entity.GetS("allow-credentials"));
            }
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