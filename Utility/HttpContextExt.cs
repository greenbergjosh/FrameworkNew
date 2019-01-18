﻿using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Web;

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
                if (String.IsNullOrEmpty(s))
                {
                    if (s == null && throwIfNotFound) throw new Exception(name + " not found in querystring.");
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


        public static void SetCookie(this HttpContext ctx, string key, string value, int? expireTime)
        {
            CookieOptions option = new CookieOptions();
            option.Path = "/";
            option.SameSite = SameSiteMode.None;
            option.HttpOnly = false;

            if (expireTime.HasValue)
                option.Expires = DateTime.Now.AddMinutes(expireTime.Value);
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
            return (ctx.Connection.RemoteIpAddress != null) ?
                ctx.Connection.RemoteIpAddress.ToString() :
                "";
        }

        public static string UserAgent(this HttpContext ctx)
        {
            return (!StringValues.IsNullOrEmpty(ctx.Request.Headers["User-Agent"])) ?
                ctx.Request.Headers["User-Agent"].ToString() :
                "";
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

    }
}
