using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;
using System.Web;

namespace Utility
{
    public class HttpWrapper
    {
        public static void SetCookie(HttpContext ctx, string key, string value, int? expireTime)
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

        public static void DeleteCookie(HttpContext ctx, string key)
        {
            ctx.Response.Cookies.Delete(key);
        }
    }
}
