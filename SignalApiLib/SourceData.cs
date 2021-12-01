using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Utility;
using Utility.Entity;

namespace SignalApiLib
{
    public class SourceData
    {
        private static readonly PropertyInfo[] Props = typeof(SourceData).GetProperties(BindingFlags.Public | BindingFlags.Instance).Where(p => p.PropertyType == typeof(string)).ToArray();

        private SourceData()
        {
        }

        public static async Task<SourceData> Create(Entity s, Dictionary<string, string[]> mutationConfig)
        {
            var sourceData = new SourceData();

            var propsUsed = new List<string>();

            foreach (var pi in Props)
            {
                string[] jprops = null;

                // THIS IF ELSE ORDER IS IMPORTANT!!!!! If property needs to explicitly not be mutated then set config value to null and this if order will enforce that
                if (mutationConfig.ContainsKey(pi.Name))
                {
                    jprops = mutationConfig[pi.Name];
                }
                else
                {
                    var (found, _) = await s.TryEvalS(pi.Name);
                    if (found)
                    {
                        jprops = new[] { pi.Name };
                    }
                }

                foreach (var jprop in jprops)
                {
                    var (found, value) = await s.TryEvalS(jprop);
                    if (found)
                    {
                        propsUsed.Add(jprop);
                        pi.SetValue(sourceData, value);
                        break;
                    }
                }
            }

            var extraData = new Dictionary<string, Entity>();
            foreach (var kvp in await s.EvalD("@"))
            {
                if (!propsUsed.Contains(kvp.Key))
                {
                    extraData[kvp.Key] = kvp.Value;
                }
            }

            if (extraData.Count > 0)
            {
                sourceData.o = extraData;
            }

            if (sourceData.@ref.IsNullOrWhitespace())
            {
                sourceData.@ref = Guid.NewGuid().ToString();
            }

            return sourceData;
        }

        // ReSharper disable InconsistentNaming
#pragma warning disable IDE1006 // Naming Styles
        public string @ref { get; private set; } = Guid.NewGuid().ToString();

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
        public Entity o { get; set; }
        // ReSharper restore InconsistentNaming
#pragma warning restore IDE1006 // Naming Styles
    }
}
