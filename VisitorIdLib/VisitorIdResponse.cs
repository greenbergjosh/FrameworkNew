using System;
using System.Collections.Generic;
using System.Text;

namespace VisitorIdLib
{
    public class VisitorIdResponse
    {
        public VisitorIdResponse(string result, string md5, string email, CookieData cookieData)
        {
            Result = result;
            Md5 = md5;
            Email = email;
            CookieData = cookieData;
        }

        public string Result { get; }
        public string Md5 { get; }
        public string Email { get; }
        public CookieData CookieData { get; }
    }
}
