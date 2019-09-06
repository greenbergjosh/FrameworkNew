using System;

namespace TheGreatWallOfDataLib
{
    public class FunctionException : Exception
    {
        public FunctionException(int resultCode, string message, bool httpFail = false, bool haltExecution = false) : base(message)
        {
            ResultCode = resultCode;
            HaltExecution = haltExecution;
            HttpFail = httpFail;
        }

        public FunctionException(int resultCode, string message, Exception innerException, bool httpFail = false, bool haltExecution = false) : base(message, innerException)
        {
            ResultCode = resultCode;
            HaltExecution = haltExecution;
            HttpFail = httpFail;
        }

        public int ResultCode { get; }

        public bool HaltExecution { get; }

        public bool HttpFail { get; }
    }
}