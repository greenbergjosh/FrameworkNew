namespace Utility
{
    public class ErrorLogError
    {
        public int Severity;
        public string Process;
        public string Method;
        public string Descriptor;
        public string Message;

        public ErrorLogError(int severity, string process, string method, string descriptor, string message)
        {
            Severity = severity;
            Process = process;
            Method = method;
            Descriptor = descriptor;
            Message = message;
        }

        public override string ToString()
        {
            return JsonWrapper.Json(new
            {
                s = Severity,
                p = Process,
                m = Method,
                d = Utility.Hashing.EncodeTo64(Descriptor),
                g = Utility.Hashing.EncodeTo64(Message)
            });
        }

    }

    public static class ErrorSeverity
    {
        public const int Log = 0;
        public const int Error = 1000;
    }

    public static class ErrorDescriptor
    {
        public const string Exception = "Exception";
        public const string Log = "Log";
    }

}
