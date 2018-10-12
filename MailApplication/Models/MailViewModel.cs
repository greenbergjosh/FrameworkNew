using System.Collections.Generic;
using BusinessLogic.Model;
using PagedList;

namespace MailApplication.Models
{
    public class MailViewModel
    {
        public IPagedList<Mail> Messages { get; set; }
        public ICollection<Seed> Accounts { get; set; }

    }
}