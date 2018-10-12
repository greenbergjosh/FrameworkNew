using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NpgsqlTypes;
namespace BusinessLogic.Model
{
    [Table("RunLogs", Schema = "public")]
    public class RunLog
    {
        [Key]
        public Guid Id { get; set; }

        [Index]
        public DateTime RunTime { get; set; }

        [Required]
        [Index]
        [MaxLength(50)]
        public String Status { get; set; }

        [Required]
        [MaxLength(250)]
        public String Description { get; set; }

        public RunLog()
        { }

    }
}
