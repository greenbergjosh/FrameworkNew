using System;

namespace UnsubLib
{
    public class HaltingException : Exception
    {
        public HaltingException(string message, Exception e) : base(message, e) { }
    }
}