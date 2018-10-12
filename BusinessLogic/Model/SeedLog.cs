using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessLogic.Model
{
    public class SeedLog
    {
        [Key]
        public Guid Id { get; set; }

        [Index("LastRun&Seed", 2)]
        public DateTime LastRun { get; set; }

        [Index("LastRun&Seed", 1)]
        public Guid Seed_Id { get; set; }

        [Required]
        public Int32 NumReplys { get; set; }

        [Required]
        public Int32 NumForwards { get; set; }

        public SeedLog()
        { }

        public SeedLog(DateTime lastRun, Guid seed_id, Int32 remainingReplys, Int32 remainingForwrds)
        {
            Id = Guid.NewGuid();
            LastRun = lastRun;
            Seed_Id = seed_id;
            NumReplys = remainingReplys;
            NumForwards = remainingForwrds;

        }

    }
}
