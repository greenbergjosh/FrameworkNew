using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Utility.Mta.Pmta
{
    public class PmtaException : ApplicationException
    {
        // Modified the ones we expect with more context, original from https://serversmtp.com/smtp-error/
        private static readonly Dictionary<int, string> ResultCodes = new Dictionary<int, string>
        {
            {0, "Unknown"},
            {101, "The server is unable to connect"},
            {111, "Connection refused or inability to open an SMTP stream"},
            {211, "System status message or help reply"},
            {214, "A response to the HELP command"},
            {220, "The server is ready"},
            {221, "The server is closing its transmission channel"},
            {250, "Requested mail action completed"},
            {251, "User not local will forward"},
            {252, "The server cannot verify the user, but it will try to deliver the message anyway"},
            {354, "Ready for body"},
            {420, "Timeout"},
            {421, "The service is unavailable"},
            {422, "The recipient’s mailbox has exceeded its storage limit"},
            {431, "Out of memory"},
            {432, "The recipient’s Exchange Server incoming mail queue has been stopped"},
            {441, "The recipient’s server is not responding"},
            {442, "The connection was dropped during the transmission"},
            {446, "The maximum hop count was exceeded for the message: an internal loop has occurred"},
            {447, "Outgoing message timed out because of issues concerning the incoming server"},
            {449, "Exchange Server routing error"},
            {450, "Requested action not taken – The user’s mailbox is unavailable"},
            {451, "Requested action aborted – Local error in processing"},
            {452, "Too many emails sent, too many recipients, or a server storage limit has been exceeded"},
            {471, "An error of your mail server, often due to an issue of the local anti-spam filter"},
            {500, "The server couldn’t recognize the command"},
            {501, "The server couldn’t recognize the command parameters"},
            {502, "The command is not implemented"},
            {503, "The server has encountered a bad sequence of commands, possibly requires authentication"},
            {504, "A command parameter is not implemented"},
            {510, "Bad email address"},
            {511, "Bad email address"},
            {512, "The host server for the recipient’s domain name cannot be found"},
            {513, "Address type is incorrect"},
            {523, "The total size of your mailing exceeds the recipient server’s limits"},
            {530, "Authentication failed, IP blacklisted, or invalid recipient"},
            {541, "The recipient address rejected your message: normally, it’s an error caused by an anti-spam filter"},
            {550, "Recipient address does not exist or message has been blocked"},
            {551, "User not local or invalid address – Relay denied"},
            {552, "Requested mail actions aborted – Exceeded storage allocation"},
            {553, "Requested action not taken – Mailbox name invalid"},
            {554, "Send failed - No retry"}
        };

        private const string EmptyAddress = "[null]";
        private const int UndefinedPort = -1;

        // Don't add constructors, extend this one
        public PmtaException(string pmtaAddress = EmptyAddress, int port = UndefinedPort, string message = null, int? resultCode = null, string buffer = null, Exception innerException = null)
            : base(CompoundMessage(message, resultCode, pmtaAddress.IfNullOrWhitespace(EmptyAddress), port, buffer))
        {
            if (!message.IsNullOrWhitespace()) Payload["message"] = message;
            if (resultCode.HasValue) Payload["resultCode"] = $" SMTP Result: {resultCode} {GetDesc(resultCode.Value)}";
            if (!buffer.IsNullOrWhitespace()) Payload["buffer"] = $" Buffer: {buffer}";
            if (innerException != null) Payload["innerException"] = innerException.UnwrapForLog();

            Payload["pmtaAddress"] = pmtaAddress;
            Payload["port"] = port;
        }

        public JObject Payload { get; private set; } = new JObject();

        private static string GetDesc(int resultCode) => ResultCodes.GetValueOrDefault(resultCode, "Unknown");

        private static string CompoundMessage(string message, int? resultCode, string pmtaAddress, int port, string buffer = null)
        {
            var msg = $"{message} {pmtaAddress}:{port}";

            if (resultCode.HasValue) msg += $" SMTP Result: {resultCode} {GetDesc(resultCode.Value)}";
            if (!buffer.IsNullOrWhitespace()) msg += $" Buffer: {buffer}";

            return msg;
        }
    }
}