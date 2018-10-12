using BusinessLogic.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MailApplication.Models
{
    public class TemplateTestShowViewModel
    {
        public TemplateTest Template { get; set; }
        public ICollection<Header> MailHeaders { get; set; }
    }
}