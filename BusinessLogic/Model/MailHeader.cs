using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Text;

namespace BusinessLogic.Model
{
    public class MailHeader
    {
        [Key]
        public Guid Id { get; set; }

        public virtual Mail Mail { get; set; }

        public int Seq { get; set; }

        public long Offset { get; set; }

        public MailHeader()
        { }

        public MailHeader(Mail newMail, MimeKit.Header mailClientHeader, int seq)
        {
            Id = Guid.NewGuid();
            Mail = newMail;
            Seq = seq;
            Offset = (long)mailClientHeader.Offset;
        }
    }
}
