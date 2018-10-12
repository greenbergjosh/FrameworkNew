using System;
using MimeKit;
using System.Collections.Generic;
using BusinessLogic.Model;
using System.Linq;
using SharpRaven.Data;
using SharpRaven;
using Newtonsoft.Json.Linq;
using NpgsqlTypes;

namespace BusinessLogic
{
    public class MailAdapter
    {


        public MimeMessage MimeMessage;
        public String FolderName;
        public Guid Id;
        public String MessageId;
        public DateTime Date;
        public MessageImportance Importance;
        public String InReplyTo;
        public DateTime ResentDate;
        public String ResentMessageId;
        public String Subject;
        public XMessagePriority XPriority;
        public String HtmlBody;
        public String TextBody;
        public String From;
        public MessagePriority Priority;
        public HeaderList Headers;
        public String TrackingId;
        public String SenderDomain;
        public String CampaignName;
        public String TemplateName;
        public String IPS;
        public Boolean MarkMailAsRead;
        public Boolean MoveMailToInbox;
        public Boolean ReplyMail;
        public Boolean ForwardMail;
        public Boolean ClickMail;
        public Boolean FromSeeder;
        public String TemplateTestID;

        public readonly static Dictionary<String, Dictionary<String, String>> Dictionary = new Dictionary<String, Dictionary<String, String>>()
            {
            { "gmail", new Dictionary<String, String>{{"Inbox","Inbox" },{"Spam", "[Gmail]/Spam" } }},
            { "aol", new Dictionary<String, String>{{ "Inbox", "Inbox" },{"Spam", "Bulk Mail" } }},
            { "yahoo", new Dictionary<String, String>{{ "Inbox", "Inbox" },{"Spam", "Bulk Mail" } }},
            { "yahoo!", new Dictionary<String, String>{{ "Inbox", "Inbox" },{"Spam", "Bulk Mail" } }},
            { "outlook", new Dictionary<String, String>{{ "Inbox", "Inbox" },{"Spam", "Junk" } }},

            };
        public MailAdapter(String folderName, MimeMessage mimeMessage)
        {
            MimeMessage = mimeMessage;
            FolderName = folderName;
            Id = Guid.NewGuid();

            MessageId = mimeMessage.MessageId;

            //Set EST as timezone
            TimeZoneInfo easternTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");
            DateTime easternDateTime = TimeZoneInfo.ConvertTimeFromUtc(mimeMessage.Date.UtcDateTime, easternTimeZone);

            Date = easternDateTime;
            Importance = mimeMessage.Importance;
            InReplyTo = mimeMessage.InReplyTo;
            ResentDate = mimeMessage.ResentDate.DateTime;
            ResentMessageId = mimeMessage.ResentMessageId;
            Subject = mimeMessage.Subject;
            XPriority = mimeMessage.XPriority;
            HtmlBody = mimeMessage.HtmlBody;
            TextBody = mimeMessage.TextBody;
            MarkMailAsRead = false;
            MoveMailToInbox = false;
            ReplyMail = false;
            ForwardMail = false;
            ClickMail = false;
            FromSeeder = false;

            foreach (var mailbox in mimeMessage.From.Mailboxes)
            {
                From = mailbox.Address;
                var senderDomain = From.Split('@');
                SenderDomain = senderDomain[1];
                break;
            }

            Priority = mimeMessage.Priority;
            Headers = mimeMessage.Headers;

            TrackingId = "";

            foreach (var header in mimeMessage.Headers)
            {
                if (header.Field == "X-SMTPAPI")
                {
                    var trakingHeader = header.Value.Split('"');

                    if (trakingHeader[1] == "trackingid")
                        TrackingId = trakingHeader[3];

                }

                if (header.Field == "X-250ok-CID")
                {
                    var trakingHeader = header.Value.Split(';');
                    if (trakingHeader.Count() > 0)
                    {
                        if (trakingHeader[0] == "Sent-from-Seeder")
                        {
                            FromSeeder = true;
                            TemplateTestID = trakingHeader[1];

                        }
                    }

                }
            }

            //Load data from external databases
            try
            {

                if (TrackingId != null && TrackingId != "")
                {
                    var pTrakid = TrackingId.ToString().Split(new char[] { '-' }, 2);
                    var campaignid = pTrakid[0].ToString(); //401
                    var trackingid = pTrakid[1].ToString(); //f9bd98d2-2297-46aa-a9f4-75f706357ff0us

                    var trackingIdCountry = TrackingId.Substring(TrackingId.Length - 2);

                    if (trackingIdCountry == "us")
                    {
                        EmailLogValues emaillog = MailStorage.searchEmailLog(trackingid);

                        if (!string.IsNullOrEmpty(emaillog.domain_id))
                        {
                            EditorEntities db = new EditorEntities();
                            //Campaign objCamp = db.Campaigns.Where(c => c.id == emaillog.campaign_id).FirstOrDefault();
                            CampaingTemplate objTemplate = db.CampaingTemplates.Where(t => t.id == emaillog.html_id).FirstOrDefault();

                            if (!string.IsNullOrEmpty(objTemplate.Campaign.name)) //(objCamp != null)
                                CampaignName = objTemplate.Campaign.name; // objCamp.name; delete line 104
                            else
                                CampaignName = "";

                            if (objTemplate != null)
                                TemplateName = objTemplate.name;
                            else
                                TemplateName = "";
                        }
                    }
                    else
                    {
                        CampaignName = "";
                        TemplateName = "";
                    }
                }

            }
            catch (Exception ex)
            {
                String stringExeption = ex.ToString();

                if (!stringExeption.Contains("timeout"))
                {
                    var exeption = "Error TrakingID: " + TrackingId + " Exeption: " + ex;
                    RavenClient ravenClient = Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(exeption));

                }

                CampaignName = "";
                TemplateName = "";
            }


        }
    }
}
