using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text;

namespace Utility
{
    public static class JsonWrapper
    {
        public static IGenericEntity JsonToGenericEntity(string json, RoslynWrapper rw = null, object config = null)
        {
            IGenericEntity gp = new GenericEntityJson();
            var gpstate = JsonConvert.DeserializeObject(json);
            gp.InitializeEntity(rw, config, gpstate);
            return gp;
        }

        public static string Json(object o, params bool[] quote)
        {
            if (o == null)
            {
                return "{ }";
            }
            var t = o.GetType();
            StringBuilder sb = new StringBuilder("{");
            int i = 0;
            foreach (PropertyInfo pi in t.GetProperties())
            {
                var val = pi.GetValue(o);
                if (val == null)
                {
                    sb.Append("\"" + pi.Name + "\": null,");
                }
                else if ((quote.Length <= i) || (quote.Length > i && quote[i]))
                    sb.Append("\"" + pi.Name + "\": \"" + val.ToString() + "\",");
                else
                    sb.Append("\"" + pi.Name + "\": " + val.ToString() + ",");
                i = i + 1;
            }
            sb.Remove(sb.Length - 1, 1);
            sb.Append("}");
            return sb.ToString();
        }

        //var x = new Tuple<string, int, string>("big", 1, "john");
        //var y = new Tuple<string, int, string>("small", 2, "tim");
        //List<Tuple<string, int, string>> lt = new List<Tuple<string, int, string>>();
        //lt.Add(x);
        //    lt.Add(y);
        //    string js = Utility.JsonWrapper.JsonTuple<Tuple<string, int, string>>
        //        (lt, new List<string>() { "size", "id", "name" },
        //        new bool[] { true, false, true });
        public static string JsonTuple<T>(List<T> o, List<string> names, params bool[] quote)
        {
            if (o == null || o.Count == 0) return "[]";
 
            StringBuilder sb = new StringBuilder("[");
            foreach (var le in o)
            {
                var t = le.GetType();
                sb.Append("{");
                for (int i = 0; i < names.Count; i++)
                {
                    string pv = t.GetProperty("Item" + (i + 1).ToString()).GetValue(le).ToString();
                    if ((quote.Length <= i) || (quote.Length > i && quote[i]))
                        sb.Append("\"" + names[i] + "\": \"" + pv + "\",");
                    else
                        sb.Append("\"" + names[i] + "\": " + pv + ",");
                }
                sb.Remove(sb.Length - 1, 1);
                sb.Append("},");
            }
            sb.Remove(sb.Length - 1, 1);
            sb.Append("]");

            return sb.ToString();
        }

        public static string Json(string keyName, string valName, IDictionary<string, string> d)
        {
            StringBuilder sb = new StringBuilder("");
            if (d.Count > 0)
            {
                sb.Append("[");
                foreach (var e in d)
                {
                    sb.Append("{\"" + keyName + "\": \"" + e.Key + "\",");
                    sb.Append("\"" + valName + "\": \"" + e.Value + "\"},");
                }
                sb.Remove(sb.Length - 1, 1);
                sb.Append("]");
            }
            else
            {
                sb.Append("[]");
            }
            
            return sb.ToString();
        }

        public static string Json(string name, IDictionary<string, string> d, bool wrap)
        {
            StringBuilder sb = String.IsNullOrEmpty(name)
                ? new StringBuilder((wrap ? "{" : ""))
                : new StringBuilder((wrap ? "{" : "") + "\"" + name + "\": {");
            if (d.Count > 0)
            {
                foreach (var e in d)
                {
                    sb.Append("\"" + e.Key + "\": \"" + e.Value + "\",");
                }
                sb.Remove(sb.Length - 1, 1);
            }
            sb = String.IsNullOrEmpty(name) ? sb.Append(wrap ? "}" : "") : sb.Append("}" + (wrap ? "}" : ""));            

            return sb.ToString();
        }

        public static string Json(string keyName, List<string> data, bool wrap = true, bool quote = true)
        {
            if (data == null || data.Count == 0)
                return (wrap ? "{" : "") + "\"" + keyName + "\": " + "[]" + (wrap ? "}" : "");

            StringBuilder sb = new StringBuilder((wrap ? "{" : "") + "\"" + keyName + "\": ");
            sb.Append("[");
            foreach (var e in data)
            {
               sb = quote ? sb.Append("\"" + data + "\",") : sb.Append(data + ",");
            }
            sb.Remove(sb.Length - 1, 1);
            sb.Append("]" + (wrap ? "}" : ""));
            return sb.ToString();
        }

        public static string Json(List<string> data, bool quote = true)
        {
            if (data == null || data.Count == 0) return "[]";

            StringBuilder sb = new StringBuilder("[");
            foreach (var e in data)
            {
                sb = quote ? sb.Append("\"" + e + "\",") : sb.Append(e + ",");
            }
            sb.Remove(sb.Length - 1, 1);
            sb.Append("]");
            return sb.ToString();
        }

        public static string ConvertCsvToJson(string csv, IList<string> names)
        {
            StringBuilder sb = new StringBuilder("[");
            using (StringReader reader = new StringReader(csv))
            {
                string line;
                while ((line = reader.ReadLine()) != null)
                {
                    string[] cols = line.Split(',');
                    sb.Append("{");
                    for (int i = 0; i < names.Count; i++)
                        sb.Append("\"" + names[i] + "\": \"" + cols[i] + "\",");
                    sb.Remove(sb.Length - 1, 1);
                    sb.Append("},");
                }
                if (sb.Length > 1) sb.Remove(sb.Length - 1, 1);
                sb.Append("]");
            }
            return sb.ToString();
        }
    }
}
