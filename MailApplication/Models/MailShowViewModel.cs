using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BusinessLogic.Model;


namespace MailApplication.Models
{
    public class MailShowViewModel
    {
        public Mail Messages { get; set; }
        public ICollection<Header> Headers { get; set; }
        public byte[] Image { get; set; }
    }
}