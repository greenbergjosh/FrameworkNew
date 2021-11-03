using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Utility
{
    public static class JsonWrapper
    {
        public const string Empty = "{}";

        public static string Serialize(object value, bool pretty = false) => JsonConvert.SerializeObject(value, pretty ? Formatting.Indented : Formatting.None);

        public static async Task<T> FromFile<T>(string path) where T : JToken => JToken.Parse(await new FileInfo(path).ReadAllTextAsync()) as T;

        public static JToken TryParse(string str)
        {
            try
            {
                return JToken.Parse(str);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public static JObject TryParseObject(string str)
        {
            try
            {
                return JObject.Parse(str);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public static JArray TryParseArray(string str)
        {
            try
            {
                return JArray.Parse(str);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public static (string path, string propName) GetPropertyPathParts(string fullPath)
        {
            if (fullPath.IsNullOrWhitespace())
            {
                return (null, null);
            }

            var parts = fullPath.Split('.', StringSplitOptions.RemoveEmptyEntries);

            return ($"{parts.Take(parts.Length - 1).Join(".")}", parts.Last());
        }

        public static string Json(object o, params bool[] quote)
        {
            if (o == null)
            {
                return "{}";
            }

            var t = o.GetType();
            StringBuilder sb = new("{");
            var i = 0;
            foreach (var pi in t.GetProperties())
            {
                var val = pi.GetValue(o);
                _ = val == null
                    ? sb.Append("\"" + pi.Name + "\": null,")
                    : (quote.Length <= i) || (quote.Length > i && quote[i])
                        ? sb.Append("\"" + pi.Name + "\": \"" + val.ToString() + "\",")
                        : sb.Append("\"" + pi.Name + "\": " + val.ToString() + ",");

                i++;
            }

            _ = sb.Remove(sb.Length - 1, 1);
            _ = sb.Append('}');
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
            if (o == null || o.Count == 0)
            {
                return "[]";
            }

            StringBuilder sb = new("[");
            foreach (var le in o)
            {
                var t = le.GetType();
                _ = sb.Append('{');
                for (var i = 0; i < names.Count; i++)
                {
                    var pv = t.GetProperty("Item" + (i + 1).ToString()).GetValue(le).ToString();
                    _ = (quote.Length <= i) || (quote.Length > i && quote[i])
                        ? sb.Append("\"" + names[i] + "\": \"" + pv + "\",")
                        : sb.Append("\"" + names[i] + "\": " + pv + ",");
                }

                _ = sb.Remove(sb.Length - 1, 1);
                _ = sb.Append("},");
            }

            _ = sb.Remove(sb.Length - 1, 1);
            _ = sb.Append(']');

            return sb.ToString();
        }

        public static string Json(string keyName, string valName, IDictionary<string, string> d)
        {
            StringBuilder sb = new("");
            if (d.Count > 0)
            {
                _ = sb.Append('[');
                foreach (var e in d)
                {
                    _ = sb.Append("{\"" + keyName + "\": \"" + e.Key + "\",");
                    _ = sb.Append("\"" + valName + "\": \"" + e.Value + "\"},");
                }

                _ = sb.Remove(sb.Length - 1, 1);
                _ = sb.Append(']');
            }
            else
            {
                _ = sb.Append("[]");
            }

            return sb.ToString();
        }

        public static string Json(string name, IDictionary<string, string> d, bool wrap)
        {
            var sb = string.IsNullOrEmpty(name)
                ? new StringBuilder(wrap ? "{" : "")
                : new StringBuilder((wrap ? "{" : "") + "\"" + name + "\": {");
            if (d.Count > 0)
            {
                foreach (var e in d)
                {
                    _ = sb.Append("\"" + e.Key + "\": \"" + e.Value + "\",");
                }

                _ = sb.Remove(sb.Length - 1, 1);
            }

            sb = string.IsNullOrEmpty(name) ? sb.Append(wrap ? '}' : "") : sb.Append("}" + (wrap ? '}' : ""));

            return sb.ToString();
        }

        public static string Json(string keyName, List<string> data, bool wrap = true, bool quote = true)
        {
            if (data == null || data.Count == 0)
            {
                return (wrap ? '{' : "") + "\"" + keyName + "\": " + "[]" + (wrap ? '}' : "");
            }

            StringBuilder sb = new((wrap ? '{' : "") + "\"" + keyName + "\": ");
            _ = sb.Append('[');
            foreach (var e in data)
            {
                sb = quote ? sb.Append("\"" + data + "\",") : sb.Append(data + ",");
            }

            _ = sb.Remove(sb.Length - 1, 1);
            _ = sb.Append("]" + (wrap ? '}' : ""));
            return sb.ToString();
        }

        public static string Json(List<string> data, bool quote = true)
        {
            if (data == null || data.Count == 0)
            {
                return "[]";
            }

            StringBuilder sb = new("[");
            foreach (var e in data)
            {
                sb = quote ? sb.Append("\"" + e + "\",") : sb.Append(e + ",");
            }

            _ = sb.Remove(sb.Length - 1, 1);
            _ = sb.Append(']');
            return sb.ToString();
        }

        public static string ConvertCsvToJson(string csv, IList<string> names, bool excludeHeader = false)
        {
            var jArray = new JArray();

            using (var reader = new StringReader(csv))
            {
                using var csvReader = new CsvHelper.CsvReader(reader, CultureInfo.CurrentCulture);
                while (csvReader.Read())
                {
                    if (excludeHeader)
                    {
                        excludeHeader = false;
                        continue;
                    }

                    var jObject = new JObject();

                    for (var i = 0; i < names.Count; i++)
                    {
                        if (csvReader.TryGetField(i, out string value))
                        {
                            jObject.Add(names[i], value);
                        }
                    }

                    jArray.Add(jObject);
                }
            }

            return Serialize(jArray);
        }
    }

    // https://stackoverflow.com/questions/17584701/json-net-serialize-json-string-property-into-json-object
    public class RawJsonConverter : JsonConverter
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer) => writer.WriteRawValue(value.ToString());

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer) => throw new NotImplementedException();

        public override bool CanConvert(Type objectType) => typeof(string).IsAssignableFrom(objectType);

        public override bool CanRead => false;
    }
}
