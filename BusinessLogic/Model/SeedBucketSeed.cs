using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.Model
{
    public class SeedBucketSeed
    {
        [Key]
        public Guid Id { get; set; }
        
        public DateTime CreatedAt { get; set; }

        public virtual Seed Seed { get; set; }

        public virtual SeedBucket SeedBucket { get; set; }
    }
}
