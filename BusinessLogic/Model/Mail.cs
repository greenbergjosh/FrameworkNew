using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Text;
using MimeKit;
using System.Collections.ObjectModel;
using NpgsqlTypes;

namespace BusinessLogic.Model
{
    public class Mail
    {
        [Key]
        public Guid Id { get; set; }

        public String TrackingId { get; set; }

        public String SenderDomain { get; set; }

        public String From { get; set; }

        public String Subject { get; set; }

        public String FolderName { get; set; }

        public String CampaignName { get; set; }

        public String TemplateName { get; set; }

        public virtual Seed Seed { get; set; }

        public String ISP { get; set; }

        public String MessageId { get; set; }

        public MessageImportance Importance { get; set; }

        public String InReplayTo { get; set; }

        public DateTime ResentDate { get; set; }

        public String ResentMessageId { get; set; }

        public XMessagePriority XPriority { get; set; }

        public String HtmlBody { get; set; }

        public String TextBody { get; set; }

        public MessagePriority Priority { get; set; }

        public virtual ICollection<MailHeader> MailHeaders { get; set; }

        public DateTime Date { get; set; }

        public Boolean MarkMailAsRead { get; set; }

        public Boolean MoveMailToInbox { get; set; }

        public Boolean ReplyMail { get; set; }

        public Boolean ForwardMail { get; set; }

        public Boolean ClickMail { get; set; }

        public Boolean FromSeeder { get; set; }

        public String TemplateTestID { get; set; }

        public Mail()
        {
        }

        public Mail(MailAdapter mail, Seed account)
        {
            Id = mail.Id;
            FolderName = mail.FolderName;
            Date = mail.Date;
            Importance = mail.Importance;
            InReplayTo = mail.InReplyTo;
            ResentDate = mail.ResentDate;
            ResentMessageId = mail.ResentMessageId;
            Subject = mail.Subject;
            XPriority = mail.XPriority;
            HtmlBody = mail.HtmlBody;
            TextBody = mail.TextBody;
            From = mail.From;
            Priority = mail.Priority;
            Seed = account;
            FolderName = mail.FolderName;
            MessageId = mail.MessageId;
            MailHeaders = new Collection<MailHeader>();
            TrackingId = mail.TrackingId;
            SenderDomain = mail.SenderDomain;
            CampaignName = mail.CampaignName;
            TemplateName = mail.TemplateName;
            var seedUserName = account.UserName.Split('@')[1];
            ISP = seedUserName.Substring(0, seedUserName.IndexOf('.')).Trim();
            MarkMailAsRead = mail.MarkMailAsRead;
            MoveMailToInbox = mail.MoveMailToInbox;
            ReplyMail = mail.ReplyMail;
            ForwardMail = mail.ForwardMail;
            ClickMail = mail.ClickMail;
            FromSeeder = mail.FromSeeder;
            TemplateTestID = mail.TemplateTestID;
        }
    }
}
