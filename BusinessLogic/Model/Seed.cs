using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity;
using System.Collections.ObjectModel;
using NpgsqlTypes;

namespace BusinessLogic.Model
{
    public class Seed
    {
        [Key]
        public Guid Id { get; set; }

        public String Name { get; set; }

        public String LastName { get; set; }

        public String UserName { get; set; }

        public String Password { get; set; }

        public virtual Provider Provider { get; set; }

        public virtual ICollection<SeedBucketSeed> SeedBucketSeed { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public virtual SeedBucket SeedBucket { get; set; }

        public Seed()
        {
            SeedBucketSeed = new Collection<SeedBucketSeed>();
        }
    }

    
}
