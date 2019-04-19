using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using System.Reflection;
using Utility;

namespace SignalApiLib
{
    public class SourceData
    {
        private static readonly PropertyInfo[] Props = typeof(SourceData).GetProperties(BindingFlags.Public | BindingFlags.Instance).Where(p => p.PropertyType == typeof(string)).ToArray();

        public SourceData(JObject s, Dictionary<string, string[]> mutationConfig)
        {
            var propsUsed = new List<string>();

            foreach (var pi in Props)
            {
                string[] jprops = null;

                // THIS IF ELSE ORDER IS IMPORTANT!!!!! If property needs to explicitly not be mutated then set config value to null and this if order will enforce that
                if (mutationConfig.ContainsKey(pi.Name)) jprops = mutationConfig[pi.Name];
                else if (s.ContainsKey(pi.Name)) jprops = new[] { pi.Name };

                if (jprops?.Any() == true)
                {
                    var jprop = jprops.First(s.ContainsKey);

                    if (!jprop.IsNullOrWhitespace())
                    {
                        propsUsed.Add(jprop);
                        pi.SetValue(this, s[jprop].Value<string>());
                    }
                }
            }

            o = new JObject();

            foreach (var p in s.Properties())
            {
                if (!propsUsed.Contains(p.Name)) o[p.Name] = p.Value;
            }

            if (!o.Properties().Any()) o = null;

            if (@ref.IsNullOrWhitespace()) @ref = Guid.NewGuid().ToString();
        }

        // ReSharper disable InconsistentNaming
        public string @ref { get; } = Guid.NewGuid().ToString();
        
        // Email
        public string em { get; set; }

        // First Name
        public string fn { get; set; }

        // Last Name
        public string ln { get; set; }

        //Zip
        public string zip { get; set; }

        //Date of Birth
        public string dob { get; set; }

        //Gender
        public string g { get; set; }

        // Source Url
        public string su { get; set; }

        // IP
        public string ip { get; set; }

        // Date Acquired
        public string daq { get; set; }

        // Other data
        public JObject o { get; set; }
        // ReSharper restore InconsistentNaming

    }
}
