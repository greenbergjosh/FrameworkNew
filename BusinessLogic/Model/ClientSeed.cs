using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.Model
{
    public class ClientSeed
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public virtual Seed Seed { get; set; }

        [Required]
        public virtual Client Client { get; set; }

        public DateTime CreatedAt { get; set; }

        public SeedBucket SeedBucket { get; set; }

    }
}
