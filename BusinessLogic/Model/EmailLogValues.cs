using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.Model
{
    public class EmailLogValues
    {
        public string tracking_id { get; set; }
        public string lead_code { get; set; }
        public string domain_id { get; set; }
        public string email { get; set; }
        public int campaign_id { get; set; }
        public int html_id { get; set; }
    }
}
