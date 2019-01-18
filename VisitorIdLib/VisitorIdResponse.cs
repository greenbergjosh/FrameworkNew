﻿using System;
using System.Collections.Generic;
using System.Text;

namespace VisitorIdLib
{
    public class VisitorIdResponse
    {
        public VisitorIdResponse(string result, string md5, string email, string sid)
        {
            Result = result;
            Md5 = md5;
            Email = email;
            Sid = sid;
        }

        public string Result { get; }
        public string Md5 { get; }
        public string Email { get; }
        public string Sid { get; }
    }
}