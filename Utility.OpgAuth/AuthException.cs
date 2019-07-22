using System;

namespace Utility.OpgAuth
{
    public class AuthException : Exception
    {
        public AuthException(string msg) : base(msg)
        {

        }

        public AuthException(string msg, Exception e) : base(msg, e)
        {

        }
    }

    public class AuthFrameworkNotFoundException : Exception
    {
        public AuthFrameworkNotFoundException(string msg) : base(msg)
        {

        }
    }
}