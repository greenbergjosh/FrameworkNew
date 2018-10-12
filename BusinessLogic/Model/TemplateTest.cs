using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.Model
{
    public class TemplateTest
    {
        [Key]
        public Guid Id { get; set; }

        public String Name { get; set; }

        public DateTime CreatedAt { get; set; }

        public String CampaignId { get; set; }

        public String Subject { get; set; }

        public String BodyText { get; set; }

        public String Result { get; set; }

        public String HTML { get; set; }

        public String To { get; set; }

        public virtual Mail Mail { get; set; }
    }
}
