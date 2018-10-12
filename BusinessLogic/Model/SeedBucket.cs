using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.Model
{
    public class SeedBucket
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public String Name { get; set; }

        [Required]
        public String Description { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public virtual ICollection<SeedBucketSeed> SeedBucketSeed { get; set; }

        [Required]
        public Guid UUID { get; set; }

        public Boolean MarkMailAsRead { get; set; }

        public Boolean MoveMailToInbox { get; set; }

        public Boolean ReplyMail { get; set; }

        public Boolean ForwardMail { get; set; }

        public Boolean ClickMail { get; set; }

        public Int32 ReplyLimit { get; set; }

        public String ReplySenderDomain { get; set; }

        public SeedBucket()
        {
            SeedBucketSeed = new Collection<SeedBucketSeed>();
            ReplyLimit = 50;
        }
    }
}
