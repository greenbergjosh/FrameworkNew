using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Text;
using System.Collections.ObjectModel;

namespace BusinessLogic.Model
{
    public class Header
    {
        [Key]
        public Guid Id { get; set; }

        public string Field { get; set; }

        public byte[] RawField { get; set; }

        public byte[] RawValue { get; set; }

        public string Value { get; set; }

        public virtual ICollection<MailHeader> MailHeaders { get; set; }

        public Header()
        { }

        public Header(MimeKit.Header mailHeader)
        {
            Field = mailHeader.Field;
            Id = Guid.NewGuid();
            RawField = mailHeader.RawField;
            RawValue = mailHeader.RawValue;
            Value = mailHeader.Value;
            MailHeaders = new Collection<MailHeader>();
        }
    }
}
