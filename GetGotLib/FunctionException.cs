using System;

namespace GetGotLib
{
    public class FunctionException : Exception
    {
        public FunctionException(int resultCode, string message, bool logAndReturnSuccess = false) : base(message)
        {
            ResultCode = resultCode;
            LogAndReturnSuccess = logAndReturnSuccess;
        }

        public FunctionException(int resultCode, string message, Exception innerException, bool logAndReturnSuccess = false) : base(message, innerException)
        {
            ResultCode = resultCode;
            LogAndReturnSuccess = logAndReturnSuccess;
        }

        public int ResultCode { get; }

        public bool HaltExecution { get; }

        public bool LogAndReturnSuccess { get; set; }
    }
}