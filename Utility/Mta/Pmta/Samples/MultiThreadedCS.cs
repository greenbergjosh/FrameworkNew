// $Id: MultiThreadedCS.cs 14230 2012-10-24 20:30:36Z juan $
// Example program showing how to user PowerMTA's .NET API in a
// multi-threaded way for submitting messages.
// Copyright 2007 - 2012, Port25 Solutions, Inc.
// All rights reserved.


using System;
using System.Collections;
using System.IO;
using System.Threading;
using port25.pmta.api.submitter;


public class ExampleMultiThreaded {
    public static void Main() {
        ThreadCoordinator coord = new ThreadCoordinator("trip-reminder@example.port25.com");
        // Add servers here, either by IP address or host name.
        // Provide the port number where PowerMTA is listening.
        // By default, this is 25.
        coord.AddServer(new Mailhost("127.0.0.1", 25));
        coord.AddServer(new Mailhost("localhost", 25));
        // Use this instead to connect with user name and password,
        // according to your PowerMTA configuration:
        // coord.AddServer(new Mailhost("localhost", 25, "username", "password"));
        coord.ConnectionsPerServer = 3;
        coord.ThreadsPerConnection = 5;
        coord.RecipientProvider = new RecipientProvider();
        coord.RunThreads();
    }
}


internal class Mailhost {
    private readonly string _host;
    private readonly int _port;
    private readonly string _username;
    private readonly string _password;


    public Mailhost(string host, int port) : this (host, port, null, null) {}


    public Mailhost(string host, int port, string username, string password) {
        _host = host;
        _port = port;
        _username = username;
        _password = password;
    }


    public string Host => _host;


    public int Port => _port;


    public string Username => _username;


    public string Password => _password;
}


// This is a sample recipient provider.
// In real life, such a class would read the recipients from your data base.
internal class RecipientProvider {
    private int _left;


    public RecipientProvider() => _left = 100; // how many dummy emails to generate


    public Recipient GetNext() {
        lock(this) {
            if (_left-- > 0) {
                // Creates a fake recipient for demonstration purposes.
                // Change to use your email address, so that you receive the
                // example messages.
                // Defines mail merge fields for the recipient to personalize
                // the message.
                Recipient r = new Recipient("joe.doe@example.port25.com");
                r["firstname"] = "Joe";
                r["lastname"] = "Doe";
                r["airportShort"] = "BWI";
                r["airportLong"] = "Baltimore/Washington International Airport";
                r["travelDate"] = "next Tuesday";
                r["travelTime"] = "10:00 am";
                r["*parts"] = "1";
                return r;
            }
            return null;
        }
    }
}


internal class ThreadCoordinator {
    private readonly ArrayList _servers;
    private int _connectionsPerServer;
    private int _threadsPerConnection;
    private readonly string _mailfrom;
    private readonly ArrayList _threads;
    private readonly ArrayList _connections;
    private RecipientProvider _recipientProvider;


    public ThreadCoordinator(string mailfrom) {
        _mailfrom = mailfrom;
        _servers = new ArrayList();
        _threads = new ArrayList();
        _connections = new ArrayList();
        _threadsPerConnection = 1;
        _connectionsPerServer = 1;
    }


    public void AddServer(Mailhost host) => _servers.Add(host);


    public int ConnectionsPerServer
    {
        get => _connectionsPerServer;
        set
        {
            if (value < 1)
            {
                throw new ArgumentOutOfRangeException(
                    "Must have at least one connection per server");
            }
            _connectionsPerServer = value;
        }
    }


    public int ThreadsPerConnection
    {
        get => _threadsPerConnection;
        set
        {
            if (value < 1)
            {
                throw new ArgumentOutOfRangeException(
                    "Must have at least one thread per connection");
            }
            _threadsPerConnection = value;
        }
    }


    public RecipientProvider RecipientProvider {
        set => _recipientProvider = value;
        get => _recipientProvider;
    }


    public void RunThreads() {
        try {
            StartThreads();
        }
        finally {
            WaitForAllThreads();
            CloseAllConnections();
        }
    }


    private void StartThreads() {
        foreach (Mailhost m in _servers) {
            for (int c = 0; c < _connectionsPerServer; c++) {
                Connection con = new Connection(m.Host, m.Port, m.Username, m.Password);
                _connections.Add(con);
                for (int t = 0; t < _threadsPerConnection; t++) {
                    SendThread st = new SendThread(_mailfrom, con, "vmta" + t,
                        _recipientProvider);
                    Thread thread = new Thread(new ThreadStart(st.Run));
                    _threads.Add(thread);
                    thread.Start();
                }
            }
        }
    }


    private void WaitForAllThreads() {
        foreach (Thread t in _threads) {
            t.Join();
        }
    }


    private void CloseAllConnections() {
        foreach (Connection c in _connections) {
            c.Close();
        }
    }
}



internal class SendThread {
    private readonly string _mailfrom;
    private readonly Connection _con;
    private readonly RecipientProvider _recipientProvider;
    private readonly string _vmta;

    
    public SendThread(string mailfrom, Connection con, string vmta,
            RecipientProvider provider) {
        _mailfrom = mailfrom;
        _con = con;
        _recipientProvider = provider;
        _vmta = vmta;
    }


    public void Run() {
        Recipient r;
        while ((r = _recipientProvider.GetNext()) != null) {
            Message msg = MakeMessage(r);
            _con.Submit(msg);
        }
    }


    // Composes a multi-part message with a plain text and an HTML part.
    // The HTML part comes with an attached picture.
    // Uses PowerMTA's mail merge feature to personalize the message.
    private Message MakeMessage(Recipient r) {
        Message msg = new Message(_mailfrom);
        msg.VirtualMTA = _vmta;
        msg.AddRecipient(r);

        string outerBoundary = "outerboundary";
        string innerBoundary = "innerboundary";

        string headers =
            "To: \"[firstname] [lastname]\" <[*to]>\n" +
            "From: \"Trip Reminder Service\" <" + _mailfrom + ">\n" +
            "Subject: Trip reminder\n" +
            "MIME-Version: 1.0\n" +
            "Content-Type: multipart/related; boundary=\"" +
            outerBoundary +
            "\"\n";
        msg.AddMergeData(headers);
        msg.AddDateHeader();

        // Optionally add a preamble for old mail clients that don't know
        // MIME:
        string preamble =
            "\n" +
            "This is a multi-part message in MIME format.\n" +
            "\n";
        AddData(msg, preamble);

        string innerPart =
            "--" + outerBoundary + "\n" +
            "Content-Type: multipart/alternative; boundary=\"" +
            innerBoundary + "\"\n" +
            "\n";
        AddData(msg, innerPart);

        string plainTextBody =
            "--" + innerBoundary + "\n" +
            "Content-Type: text/plain; charset=utf-8\n" +
            "\n" +
            "Dear [firstname],\n\n" +
            "here is your trip reminder.\n" +
            "You are leaving [airportLong] ([airportShort]) on " +
            "[travelDate] at [travelTime].\n" +
            "Please make sure you arrive an hour early.\n" +
            "\n" +
            "Thanks for your business and have a good trip!\n";
        msg.AddMergeData(plainTextBody);

        string logoId = "logo";
        string htmlBody = 
            "--" + innerBoundary + "\n" +
            "Content-Type: text/html; charset=utf-8\n" +
            "\n" +
            "<html>\n" +
            "<body>\n" +
            // include an image on the web like this:
            // "<img src='http://www.port25.com/images/port25_LOGO.gif'" +
            // "   alt='logo' />" +
            // refer to an image sent with the email like this:
            "<img src='cid:" + logoId + "' alt='logo' />\n" +
            "<p>Dear <b>[firstname]</b>,\n\n" +
            "<p>here is your trip reminder.</p>\n" +
            "<p>You are leaving [airportLong] ([airportShort]) on " +
            "[travelDate] at [travelTime].</p>\n" +
            "<p>Please make sure you arrive an hour early.</p>\n" +
            "\n" +
            "<p>Thanks for your business and have a good trip!</p>\n" +
            "</body>\n" +
            "</html>\n";
        msg.AddMergeData(htmlBody);
        AddData(msg, "\n--" + innerBoundary + "--\n");

        string file = System.IO.Path.Combine("examples", "port25_LOGO.gif");
        InlineImage(msg, logoId, file, outerBoundary);
        return msg;
    }


    private void AddData(Message msg, string data) =>
        // PowerMTA encodes strings in UTF-8.  If you need a different encoding,
        // use something like this:
        //
        //      msg.AddData(System.Text.Encoding.X.GetBytes(headers));
        //
        // where X is the desired encoding.  You must also set the body part's
        // character set accordingly. 
        msg.AddData(data);


    private void InlineImage(Message msg, string id, string path, string boundary) {
        string imageHeader = 
            "\n--" + boundary + "\n" +
            "Content-ID: <" + id + ">\n" +
            "Content-Type: image/gif\n" + 
            "Content-Transfer-Encoding: base64\n" +
            "Content-Disposition: inline; filename=" + id + "\n" +
            "\n";
        AddData(msg, imageHeader);

        msg.Encoding = port25.pmta.api.submitter.Encoding.Base64;
        FileStream fs = null;
        try {
            fs = new FileStream(path, FileMode.Open, FileAccess.Read, 
                                                     FileShare.Read);
            byte[] imageData = new byte[fs.Length];
            fs.Read(imageData, 0, imageData.Length);
            msg.AddData(imageData);
        }
        finally {
            if (fs != null) {
                fs.Close();
            }
        }

        msg.Encoding = port25.pmta.api.submitter.Encoding.SevenBit;
        AddData(msg, "\n--" + boundary + "--\n");
    }
}
