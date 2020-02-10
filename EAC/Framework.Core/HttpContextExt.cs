using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace Framework.Core
{
    public static class HttpContextExt
    {
        public static T Get<T>(this HttpContext context, string name, T defVal, Func<string, T> trans,
             bool throwIfNotFound = true, bool throwExc = true)
        {
            try
            {
                string s = context.Request.Query[name];
                if (string.IsNullOrEmpty(s))
                {
                    if (s == null && throwIfNotFound)
                        throw new KeyNotFoundException(name + " not found in querystring.");
                    return defVal;
                }
                else return trans(s);
            }
            catch (Exception ex)
            {
                if (throwExc) throw ex;
                return defVal;
            }
        }

        public static string Get(this HttpContext context, string name, string defVal,
            bool throwIfNotFound = true, bool throwExc = true)
        {
            return Get(context, name, defVal, x => x, throwIfNotFound, throwExc);
        }


        public static void SetCookie(this HttpContext ctx, string key, string value, int expiresInMinsFromNow)
        {
            SetCookie(ctx, key, value, DateTime.UtcNow + TimeSpan.FromMinutes(expiresInMinsFromNow));
        }

        public static void SetCookie(this HttpContext ctx, string key, string value, DateTime? expireTime = null)
        {
            CookieOptions option = new CookieOptions();
            option.Path = "/";
            option.SameSite = SameSiteMode.None;
            option.HttpOnly = false;

            if (expireTime.HasValue)
                option.Expires = expireTime.Value;
            else
                option.Expires = DateTime.Now.AddMilliseconds(10);

            ctx.Response.Cookies.Append(key, value, option);
        }

        public static void DeleteCookie(this HttpContext ctx, string key)
        {
            ctx.Response.Cookies.Delete(key);
        }

        public static string Ip(this HttpContext ctx)
        {
            return ctx.Connection.RemoteIpAddress?.ToString() ?? string.Empty;
        }

        public static string UserAgent(this HttpContext ctx)
        {
            return (!StringValues.IsNullOrEmpty(ctx.Request.Headers["User-Agent"])) ?
                ctx.Request.Headers["User-Agent"].ToString() :
                string.Empty;
        }

        // Slightly modified versions of:
        // https://weblog.west-wind.com/posts/2017/Sep/14/Accepting-Raw-Request-Body-Content-in-ASPNET-Core-API-Controllers
        public static async Task<string> GetRawBodyStringAsync(this HttpContext ctx, Encoding encoding = null)
        {
            if (encoding == null)
                encoding = Encoding.UTF8;

            using (StreamReader reader = new StreamReader(ctx.Request.Body, encoding))
                return await reader.ReadToEndAsync();
        }

        public static async Task<byte[]> GetRawBodyBytesAsync(this HttpContext ctx)
        {
            using (var ms = new MemoryStream(2048))
            {
                await ctx.Request.Body.CopyToAsync(ms);
                return ms.ToArray();
            }
        }

        public static async Task WriteSuccessRespAsync(this HttpContext ctx, string response, Encoding enc = null, string contentType = "application/json")
        {
            ctx.Response.StatusCode = 200;
            ctx.Response.ContentType = contentType;
            ctx.Response.ContentLength = enc != null ? Encoding.UTF8.GetBytes(response ?? string.Empty).Length : response?.Length ?? 0;
            await ctx.Response.WriteAsync(response ?? string.Empty);
        }

        public static async Task WriteFailureRespAsync(this HttpContext ctx, string response, Encoding enc = null, string contentType = "application/json")
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.ContentType = contentType;
            ctx.Response.ContentLength = enc != null ? Encoding.UTF8.GetBytes(response ?? string.Empty).Length : response?.Length ?? 0;
            await ctx.Response.WriteAsync(response ?? string.Empty);
        }

        public static void AddCorsAccessForOriginHost(this HttpContext ctx, IGenericEntity ge)
        {
            // https://docs.microsoft.com/en-us/aspnet/core/migration/21-to-22?view=aspnetcore-2.2&tabs=visual-studio
            // .netcore 2.2 makes this process more explicit (domains should be specified), so let's just echo the
            // requesting origin back, circumventing the problem. Feel free to add other methods as necessary below.

            // Nothing to do if we don't have an "Origin:" header or if our config is missing
            // the "allow-origin" directive
            if (!ctx.Request.Headers.TryGetValue("Origin", out StringValues originHost) ||
                ge.GetS("allow-origin") == null
                ) return;

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
            if (ge.GetS("allow-origin[0]") == "*")
            {
                ctx.Response.Headers.Add("Access-Control-Allow-Origin", originHost);
            }
            else if (ge.GetL("allow-origin").Select(x => x.GetS(string.Empty) == originHost).Count() == 1)
            {
                ctx.Response.Headers.Add("Access-Control-Allow-Origin", originHost);
            }
            // "allow-headers": [ "origin", "x-requested-with", "access-control-request-headers", "content-type", "access-control-request-method", "accept" ],
            //
            // Comma-separates a list of values into the "Access-Control-Allow-Headers" response header
            if (ge.GetS("allow-headers") != null)
            {
                ctx.Response.Headers.Add("Access-Control-Allow-Headers", string.Join(",", ge.GetL("allow-headers").Select(x => x.GetS(string.Empty))));
            }
            // "allow-methods": [ "PUT", "POST", "GET", "PATCH", "HEAD" ],
            //
            // Comma-separates a list of values into the "Access-Control-Allow-Methods" response header
            if (ge.GetS("allow-methods") != null)
            {
                ctx.Response.Headers.Add("Access-Control-Allow-Methods", string.Join(",", ge.GetL("allow-methods").Select(x => x.GetS(string.Empty))));
            }

            // "allow-credentials": "true"
            //
            // Sets the "Access-Control-Allow-Credentials" response value to a bool to indicate cross-site cookie policy
            if (ge.GetS("allow-credentials") != null)
            {
                ctx.Response.Headers.Add("Access-Control-Allow-Credentials", ge.GetS("allow-credentials"));
            }
        }

        // based off of: https://referencesource.microsoft.com/#System.Web/WorkerRequest.cs,ab8517882440da8b
        public static bool IsLocal(this HttpContext ctx)
        {
            var connection = ctx.Connection;

            var remoteAddress = connection.RemoteIpAddress.ToString();

            // if unknown, assume not local
            if (String.IsNullOrEmpty(remoteAddress))
                return false;

            // check if localhost
            if (remoteAddress == "127.0.0.1" || remoteAddress == "::1")
                return true;

            // compare with local address
            if (remoteAddress == connection.LocalIpAddress.ToString())
                return true;

            return false;
        }

        public static IDictionary<string, object> ToRequest(this HttpContext httpContext)
        {
            var request = new Dictionary<string, object>();
            var queryString = httpContext.Request.Query;
            request["QueryString"] = queryString;
            foreach (string key in queryString.Keys)
                request[key] = queryString[key].ToString();
            return request;
        }
    }
}
