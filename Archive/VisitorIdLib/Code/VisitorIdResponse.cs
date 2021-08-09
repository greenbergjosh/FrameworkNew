using System;
using System.Collections.Generic;
using System.Text;

namespace VisitorIdLib
{
    public class VisitorIdResponse
    {
        public VisitorIdResponse(string result, string md5, string md5pid, string md5date, string email, CookieData cookieData)
        {
            Result = result;
            Md5 = md5;
            Md5Pid = md5pid;
            Md5Date = md5date;
            Email = email;
            CookieData = cookieData;
        }

        public string Result { get; }
        public string Md5 { get; }
        public string Md5Pid { get; }
        public string Md5Date { get; }
        public string Email { get; }
        public CookieData CookieData { get; }
    }
}
