using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace BusinessLogic.Model
{
    public class Provider
    {
        [Key]
        public Guid Id { get; set; }

        public String Name { get; set; }

        public String Server { get; set; }

        public int Port { get; set; }

        public String SMTPServer { get; set; }

        public int SMTPport { get; set; }

        public String Type { get; set; }

    }
}
