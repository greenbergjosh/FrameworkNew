using BusinessLogic.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MailApplication.Models
{
    public class SeedBucketModelView
    {
        public SeedBucket SeedBucket { get; set; }
        public Guid[] SeedsInBucket { get; set; }
        public Dictionary<Seed, Boolean> AvalibleSeeds { get; set; }

        public SeedBucketModelView()
        {
            AvalibleSeeds = new Dictionary<Seed, Boolean>();
        }

    }


}