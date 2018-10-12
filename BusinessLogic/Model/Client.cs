using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel;

namespace BusinessLogic.Model
{
    public class Client
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public String Name { get; set; }

        [Required]
        public String Description { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }

        [Required]
        public string ApiKey { get; set; }

    }
}
