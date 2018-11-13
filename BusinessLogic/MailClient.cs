using System;
using MailKit;
using MailKit.Net.Imap;
using System.Threading.Tasks;
using System.Collections.Generic;
using BusinessLogic.Model;
using SharpRaven.Data;
using MimeKit;
using SharpRaven;
using System.Net.Mail;
using System.Linq;
using NLog;
using System.Threading;

namespace BusinessLogic
{
    public class MailClient
    {
        public const String replys = "replys";
        public async Task GetMessagesAsync(Seed seed, String folderName, String systemFolder)
        {

            List<MailAdapter> emailList = new List<MailAdapter>();
            try
            {
                var client = BuildIMAPClient(seed);
                
                if (client != null)
                {
                    IMailFolder folder;
                    try
                    {
                        folder = client.GetFolder(folderName);
                    }
                    catch (Exception ex)
                    {
                        //Exception for the old AOL accouts
                        folder = client.GetFolder("Spam");
                    }

                    folder.Open(FolderAccess.ReadWrite);

                    //Get the last message on the database
                    MailStorage storage = new MailStorage();
                    String mailIdMaxDate = storage.GetLastMailId(seed, systemFolder);

                    //Number of replys
                    var numReplys = storage.GetRemainingsReplysOrForwards(seed, replys);
                    var totalReplys = 50;

                    if (seed.SeedBucket != null)
                        totalReplys = seed.SeedBucket.ReplyLimit;

                    for (int i = folder.Count - 1; i >= 0; i--)
                    {
                        MimeMessage message = folder.GetMessage(i);

                        //Create a new MailAdapter
                        MailAdapter newMail = new MailAdapter(systemFolder, message);

                        //check if the mail is in the database
                        if (mailIdMaxDate != newMail.MessageId)
                        {
                            numReplys = await ProcessMessage(newMail, systemFolder, message, mailIdMaxDate, seed, numReplys, totalReplys, folder, i, client);
                        }
                        else
                        {
                            Logger logger = LogManager.GetCurrentClassLogger();
                            logger.Info("***All Mails Load!!. Seed: " + seed.UserName + " Folder: " + systemFolder);

                            MailStorage runLog = new MailStorage();
                            runLog.CreateRunLogEntry("Running", "End Load Seed: " + seed.UserName + " Folder: " + systemFolder);

                            break;
                        }
                    }

                    //Crete a log register
                    await storage.CreateSeedLogEntry(seed.Id, numReplys, numReplys);
                }
            }
            catch (Exception ex)
            {
                var exeption = "Error Seed: " + seed.UserName + " Exeption: " + ex;
                RavenClient ravenClient = Sentry.Instance;
                ravenClient.Capture(new SentryEvent(exeption));

            }
        }

        public ImapClient BuildIMAPClient(Seed seed)
        {
            var client = new ImapClient();
            String server = seed.Provider.Server;
            Int32 port = seed.Provider.Port;

            client.Connect(server, port, true);

            try
            {
                client.AuthenticationMechanisms.Remove("XOAUTH2");
                String user = seed.UserName;
                String password = seed.Password;
                client.Authenticate(user, password);

                return client;
            }
            catch (Exception ex)
            {
                Logger badSeeds = LogManager.GetLogger("BadSeeds");
                badSeeds.Info(seed.UserName);

                var exeption = "Error Seed Auth: " + seed.UserName + " Exeption: " + ex;

                //RavenClient ravenClient = Sentry.Instance;
                //ravenClient.Capture(new SentryEvent(exeption));

                return null;
            }

        }

        public async Task<int> ProcessMessage(MailAdapter newMail, String systemFolder, MimeMessage message, String mialIdMaxDate, Seed seed, int numReplys, int totalReplys, IMailFolder folder, int i, ImapClient client)
        {
            MailStorage storage = new MailStorage();

            //just load the mails with MessageID
            if (message.MessageId != null)
            {
                //if not a reply, save the message
                if (seed.UserName != newMail.From)
                {
                    //check if a seed have actions
                    if (seed.SeedBucket != null)
                    {
                        numReplys = MailActions(seed, folder, i, systemFolder, client, newMail, message, numReplys, totalReplys);
                    }

                    //Console LOG
                    Logger logger = LogManager.GetCurrentClassLogger();
                    logger.Info("Start Load Mail: " + i + " Seed: " + seed.UserName + " Folder: " + systemFolder);

                    //SAVE THE MESSAGE
                    await storage.SaveMessageAsync(newMail, seed.Id);

                }
            }

            return numReplys;
        }

        public void SendSmtpMessage(String email, MailMessage msg)
        {

            var smtpClient = new SmtpClient();
            smtpClient.Send(msg);

        }

        public int MakeAReplay(Seed seed, MimeMessage message, int numReplys, int totalReplys, MailAdapter newMail)
        {
            try
            {
                Random rng = new Random();
                bool boolReply = rng.Next(0, 2) > 0;
                if (seed.SeedBucket.ReplyMail && boolReply && numReplys <= totalReplys)
                {
                    ReplyMail(message, seed, null);

                    //log
                    Logger logger = LogManager.GetCurrentClassLogger();
                    logger.Info("Reply Mail - Seed: " + seed.UserName + " Num of Replays: " + numReplys);

                    newMail.ReplyMail = true;

                    numReplys++;
                }


            }
            catch (Exception ex)
            {
                var exeption = "ERROR IN REPLY - Error Seed: " + seed.UserName + " Exeption: " + ex;
                RavenClient ravenClient = Sentry.Instance;
                ravenClient.Capture(new SentryEvent(exeption));
                numReplys = totalReplys + 1;
            }

            return numReplys;
        }

        public Boolean IsValidSeed(Seed seed)
        {
            using (var client = new ImapClient())
            {
                try
                {
                    String server = seed.Provider.Server;
                    Int32 port = seed.Provider.Port;

                    client.Connect(server, port, true);

                    client.AuthenticationMechanisms.Remove("XOAUTH2");

                    String user = seed.UserName;
                    String password = seed.Password;
                    client.Authenticate(user, password);

                    return true;
                }
                catch (Exception ex)
                {
                    return false;
                }
            }

        }

        public void ReplyMail(MimeMessage message, Seed seed, String mailTo)
        {
            using (var client = new MailKit.Net.Smtp.SmtpClient())
            {
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                client.Connect(seed.Provider.SMTPServer, seed.Provider.SMTPport, false);

                client.AuthenticationMechanisms.Remove("XOAUTH2");

                client.Authenticate(seed.UserName, seed.Password);

                var reply = new MimeMessage();

                //if 'mailTo' is null reply the message, else: forward the message
                if (mailTo == null)
                {
                    // reply to the sender of the message
                    if (message.ReplyTo.Count > 0)
                    {
                        reply.To.AddRange(message.ReplyTo);
                    }
                    else if (message.From.Count > 0)
                    {
                        reply.To.AddRange(message.From);
                    }
                    else if (message.Sender != null)
                    {
                        reply.To.Add(message.Sender);
                    }

                    //add body to de mail 
                    reply.Body = new TextPart("plain")
                    {
                        Text = "Thanks for the info."
                    };

                }
                else
                {
                    MailboxAddress to = new MailboxAddress(mailTo);
                    reply.Body = message.Body;
                    reply.To.Add(to);
                }

                // set the reply subject
                if (!message.Subject.StartsWith("Re:", StringComparison.OrdinalIgnoreCase))
                    reply.Subject = "Re:" + message.Subject;
                else
                    reply.Subject = message.Subject;

                // construct the In-Reply-To and References headers
                if (!string.IsNullOrEmpty(message.MessageId))
                {
                    reply.InReplyTo = message.MessageId;
                    foreach (var id in message.References)
                        reply.References.Add(id);
                    reply.References.Add(message.MessageId);
                }

                //add the sender of the mail
                reply.Sender = new MailboxAddress(seed.UserName);


                //wait to send messages
                Random r = new Random();
                int rInt = r.Next(1000, 2000);
                Thread.Sleep(rInt);

                //Send the message
                client.Send(reply);
                client.Disconnect(true);

            }
        }

        public int ForwardMail(MimeMessage message, Seed seed, int numReplys, int totalReplys, MailAdapter newMail)
        {
            Random forward = new Random();
            bool boolReply = forward.Next(0, 2) > 0;

            if (numReplys <= totalReplys && boolReply)
            {
                using (var db = new DatabaseContext())
                {
                    var seeds = db.Seed.Select(s => s.UserName).ToList();

                    var selectSeed = forward.Next(0, seeds.Count() - 1);

                    var forwardTo = seeds[selectSeed];

                    try
                    {
                        ReplyMail(message, seed, forwardTo);

                        newMail.ForwardMail = true;
                    }
                    catch (Exception ex)
                    {
                        var exeption = "ERROR IN FORWARD - Error Seed: " + seed.UserName + " Exeption: " + ex;
                        RavenClient ravenClient = Sentry.Instance;
                        ravenClient.Capture(new SentryEvent(exeption));
                        numReplys = totalReplys + 1;
                    }

                    Logger logger = LogManager.GetCurrentClassLogger();
                    logger.Info("Forward Mail - Seed: " + seed.UserName + " Num of Forwards: " + numReplys);

                    numReplys++;
                }
            }

            return numReplys;
        }

        public int MailActions(Seed seed, IMailFolder folder, int i, String systemFolder, ImapClient client, MailAdapter newMail, MimeMessage message, int numReplys, int totalReplys)
        {
            //marks mail as read
            if (seed.SeedBucket.MarkMailAsRead)
            {
                folder.AddFlags(i, MessageFlags.Seen, true);
                newMail.MarkMailAsRead = true;
            }

            //move mail from Spam to Inbox
            if (systemFolder == "Spam" && seed.SeedBucket.MoveMailToInbox)
            {
                folder.MoveTo(i, client.Inbox);
                newMail.MoveMailToInbox = true;
            }

            //replay mail
            var senderDomainsToReplay = seed.SeedBucket.ReplySenderDomain;
            List<String> replaySenderDomains = null;
            if (senderDomainsToReplay != null && senderDomainsToReplay != "")
            {
                replaySenderDomains = senderDomainsToReplay.Split(',').ToList();
                if (replaySenderDomains.Contains(newMail.SenderDomain))
                {
                    numReplys = MakeAReplay(seed, message, numReplys, totalReplys, newMail);
                }
            }
            else
            {
                numReplys = MakeAReplay(seed, message, numReplys, totalReplys, newMail);

            }

            //forward mail
            if (seed.SeedBucket.ForwardMail)
            {
                numReplys = ForwardMail(message, seed, numReplys, totalReplys, newMail);
            }

            return numReplys;
        }

    }
}
