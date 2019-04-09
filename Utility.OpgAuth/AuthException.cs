using System;

namespace Utility.OpgAuth
{
    public class AuthException : Exception
    {
        public AuthException(string msg) : base(msg)
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