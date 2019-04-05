using System;

namespace TheGreatWallOfDataLib
{
    public class FunctionException : Exception
    {
        public FunctionException(int resultCode, string message) : base(message)
        {
            ResultCode = resultCode;
        }

        public FunctionException(int resultCode, string message, Exception innerException) : base(message, innerException)
        {
            ResultCode = resultCode;
        }

        public int ResultCode { get; }

        public bool HaltExecution { get; }
    }
}