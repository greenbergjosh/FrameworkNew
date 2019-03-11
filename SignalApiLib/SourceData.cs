using System;
using System.Collections.Generic;
using System.Text;

namespace SignalApiLib
{
    public class SourceData
    {
        public string @ref { get; } = Guid.NewGuid().ToString();

        // Email
        public string em { get; set; }

        // First Name
        public string fn { get; set; }

        // Last Name
        public string ln { get; set; }

        // Source
        public string src { get; set; }
    }
}
