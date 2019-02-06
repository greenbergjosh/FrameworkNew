using System.Collections.Generic;

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
        public const int Warn = 750;
        public const int Error = 1000;
        public const int Fatal = 3000;
    }

    public static class ErrorDescriptor
    {
        public const string Fatal = "Fatal";
        public const string Exception = "Exception";
        public const string Log = "Log";
        public const string Trace = "Trace";
        public const string EmailAlert = "EmailAlert";
    }

    public class EmailAlertPayload
    {
        public EmailAlertPayload(IEnumerable<EmailAlertPayloadItem> alerts)
        {
            Alerts = alerts;
        }

        public IEnumerable<EmailAlertPayloadItem> Alerts { get; }
    }

    public class EmailAlertPayloadItem
    {
        public EmailAlertPayloadItem(string label, string errorMsg)
        {
            Label = label;
            ErrorMsg = errorMsg;
        }

        public string Label { get; }
        public string ErrorMsg { get; }
    }
}
