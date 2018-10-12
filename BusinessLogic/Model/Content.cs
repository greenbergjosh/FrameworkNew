using BusinessLogic.Model;
using System;
using System.ComponentModel.DataAnnotations;


namespace BusinessLogic
{
    public class Content
    {
        [Key]
        public Guid Id { get; set; }

        public string HtmlBody { get; set; }

        public string TextBody { get; set; }

        public virtual Model.Mail Mail { get; set; }

        public Content()
        { }

        public Content(String htmlBody, String textBody, Mail newMail)
        {
            Id = Guid.NewGuid();
            HtmlBody = htmlBody;
            TextBody = textBody;
            Mail = newMail;
        }
    }
}
