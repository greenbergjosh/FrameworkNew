using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using HPair = System.Collections.Generic.KeyValuePair<string, string>;

namespace Utility.Mta.Pmta
{
    public class PmtaSmtpClient : IDisposable
    {
        private static readonly string[] RemoveChars = {"\\", "&", "="};
        private TcpClient _tcp;
        private NetworkStream _networkStream;
        private const int DefaultPort = 25;

        public string PmtaAddress { get; }
        public int Port { get; set; }
        public string User { get; set; }
        public string Password { get; set; }
        public bool IsConnected => Buffer != null && _tcp.Connected && _networkStream != null;
        public Func<string, Task> SmtpTrace { get; set; }

        private PmtaException PmtaException(string message = null, StreamBuffer buffer = null, Exception innerException = null) =>
            new PmtaException(PmtaAddress, Port, message, buffer.ResultCode, buffer.Raw, innerException);

        private StreamBuffer Buffer { get; set; }

        private Task WriteSmtpTrace(string log) => SmtpTrace?.Invoke(log) ?? Task.CompletedTask;

        public PmtaSmtpClient(string pmtaAddress, int port = DefaultPort, Func<string, Task> smtpTrace = null)
        {
            if (Port < DefaultPort) throw new ArgumentException($"Invalid {nameof(Port)} value {Port}");
            if (PmtaAddress.IsNullOrWhitespace()) throw new ArgumentException($"Invalid {nameof(PmtaAddress)} value {PmtaAddress ?? "[null]"}");

            Port = port;
            PmtaAddress = pmtaAddress;
            SmtpTrace = smtpTrace;
        }

        public async Task Open()
        {
            if(Buffer!= null) throw new Exception($"Tried opening an active {typeof(PmtaSmtpClient).FullName}");
            
            try
            {
                _tcp = new TcpClient(PmtaAddress, Port);
            }
            catch (SocketException e)
            {
                throw PmtaException($"TCP connection failed with error {e.Message}", innerException: e);
            }
            catch (Exception e)
            {
                throw PmtaException("Unhandled exception establishing TCP connection", innerException: e);
            }

            _networkStream = _tcp.GetStream();

            Buffer = new StreamBuffer(_networkStream, WriteSmtpTrace, m => PmtaException(m));

            if (Buffer.ResultCode == 421) throw PmtaException("Connection attempt responded with error code", Buffer);

            if (Buffer.ResultCode != 220) throw PmtaException("Error connecting to Smtp server", Buffer);

            await Buffer.Write("EHLO");
            
            if (Buffer.ResultCode != 250) throw PmtaException("Error initiating communication with Smtp server", Buffer);

            if (!User.IsNullOrWhitespace() && !Password.IsNullOrWhitespace() && Buffer.Raw.Contains("AUTH=LOGIN"))
            {
                await Buffer.Write("AUTH LOGIN");
                
                if (Buffer.ResultCode != 334) throw PmtaException("Error initiating Auth=Login", Buffer);

                await Buffer.Write(Convert.ToBase64String(Encoding.ASCII.GetBytes(User)));

                if (Buffer.ResultCode != 334) throw PmtaException("Error setting Auth user name", Buffer);

                await Buffer.Write(Convert.ToBase64String(Encoding.ASCII.GetBytes(Password)));

                if (Buffer.ResultCode != 235) throw PmtaException("Error setting Auth password", Buffer);
            }
        }

        public async Task Close()
        {
            if (IsConnected) await Buffer.Write("QUIT");

            Buffer = null;

            _networkStream.Dispose();

            if (_tcp.Connected) _tcp.Close();
        }

        public async Task SendMessage(Sender sender, Recipient recipient, ICollection<HPair> headers, string subject, string htmlBody, IEmailEncoder emailEncoder)
        {
            await Buffer.Write($"MAIL FROM: <{sender.Address}>");

            if (Buffer.ResultCode == 451) throw PmtaException("Remote spool is full", Buffer);
            if (Buffer.ResultCode != 250) throw PmtaException("Error setting MAIL FROM", Buffer);

            await Buffer.Write($"RCPT TO: <{recipient.Address}>");

            if (Buffer.ResultCode != 250) throw PmtaException("Error setting RCPT TO", Buffer);

            await Buffer.Write("DATA");

            if (Buffer.ResultCode != 354) throw PmtaException("Error starting DATA", Buffer);

            var data = new StringBuilder();

            data.AppendLine($"Content-Type: text/html; charset={emailEncoder.GetCharSet()}");

            if (emailEncoder.HasTransferEncoding()) data.AppendLine($"Content-Transfer-Encoding: {emailEncoder.GetTransferEncodingHeaderValue()}");

            headers?.ForEach(h => data.AppendLine($"{h.Key}: {h.Value}"));

            data.AppendLine();
            data.AppendLine(emailEncoder.Encode(htmlBody));

            using (var reader = new StringReader(data.ToString()))
            {
                while (true)
                {
                    var line = reader.ReadLine();

                    if (line != null) Buffer.Write(line);
                    else break;
                }

                // ends DATA transmission
                await Buffer.Write(".");
            }

            if (Buffer.ResultCode != 250) throw PmtaException("Error sending DATA", Buffer);
        }

        public void Dispose()
        {
            Close();
        }

        private class StreamBuffer
        {
            private NetworkStream _networkStream;
            private const int Timeout = 120000;

            public StreamBuffer(NetworkStream networkStream, Func<string, Task> smtpTrace, Func<string, PmtaException> pmtaException)
            {
                _networkStream = networkStream;
                SmtpTrace = smtpTrace;
                PmtaException = pmtaException;
                Read().GetAwaiter().GetResult();
            }

            private Func<string, Task> SmtpTrace { get; }
            private Func<string, PmtaException> PmtaException { get; }

            public string Raw { get; private set; }

            public int ResultCode
            {
                get
                {
                    int? resultCode = null;
                    var spaceIndex = Raw.IndexOf(" ");
                    var dashIndex = Raw.IndexOf("-");

                    if (dashIndex > 0 && dashIndex < spaceIndex) spaceIndex = Raw.IndexOf("-");

                    if (spaceIndex > 0) resultCode = Raw.Substring(0, spaceIndex).ParseInt();

                    return resultCode ?? 0;
                }
            }

            public async Task Write(string msg)
            {
                byte[] buffer;

                try
                {
                    if (!msg.EndsWith("\r\n")) msg += "\r\n";

                    SmtpTrace(msg);

                    buffer = Encoding.ASCII.GetBytes(msg);

                    _networkStream.Write(buffer, 0, buffer.Length);
                }
                catch (IOException)
                {
                    throw PmtaException($"Error sending data to Smtp server. Message: {msg}");
                }

                Raw = null;
                await Read();
            }

            private async Task Read()
            {
                var buffer = new byte[1024];

                var i = 0;
                int b;
                var timeout = Environment.TickCount;

                try
                {
                    // wait for data to show up on the stream
                    while (!_networkStream.DataAvailable && ((Environment.TickCount - timeout) < Timeout)) System.Threading.Thread.Sleep(100);

                    if (!_networkStream.DataAvailable) throw PmtaException("No response received from Smtp server.");

                    await _networkStream.ReadAsync(buffer);
                }
                catch (IOException)
                {
                    throw PmtaException("Error receiving data from Smtp server.");
                }

                // convert the buffer to as string, then replace all the null characters w/ nothing and return the value
                Raw = Encoding.ASCII.GetString(buffer).Replace("\0", string.Empty);
            }
        }

    }
}