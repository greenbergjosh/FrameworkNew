using System;
using Utility.GenericEntity;

namespace GetGotLib
{
    public class FunctionException : Exception
    {
        public FunctionException(int resultCode, string message, IGenericEntity ge = null, bool logAndReturnSuccess = false) : base(message)
        {
            ResultCode = resultCode;
            Ge = ge;
            LogAndReturnSuccess = logAndReturnSuccess;
        }

        public FunctionException(int resultCode, string message, Exception innerException, IGenericEntity ge = null, bool logAndReturnSuccess = false) : base(message, innerException)
        {
            ResultCode = resultCode;
            LogAndReturnSuccess = logAndReturnSuccess;
        }

        public int ResultCode { get; }
        public IGenericEntity Ge { get; }
        public bool HaltExecution { get; }
        public bool LogAndReturnSuccess { get; set; }
    }
}