﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Framework.Core.GenericEntity;

namespace Framework.Core
{
    public static class JsonWrapper
    {
        public const string Empty = "{}";

        public static string Serialize(object value, bool pretty = false) => JsonConvert.SerializeObject(value, pretty ? Formatting.Indented : Formatting.None);

        public static async Task<IGenericEntity> GenericEntityFromFile<TEntity>(string path)
            where TEntity : class, IGenericEntity, new()
        {
            return JsonToGenericEntity(await new FileInfo(path).ReadAllTextAsync());
        }

        public static async Task<T> FromFile<T>(string path) where T : JToken
        {
            return JToken.Parse(await new FileInfo(path).ReadAllTextAsync()) as T;
        }

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

        public static IGenericEntity ToGenericEntity(object obj, object config = null)
        {
            if (obj is string s) return JsonToGenericEntity(s, config);
            var gp = new GenericEntityJson();

            gp.InitializeEntity(config, obj);
            return gp;
        }

        public static IGenericEntity JsonToGenericEntity(string json, object config = null)
        {
            var gp = new GenericEntityJson();
            var gpstate = JsonConvert.DeserializeObject(json);

            gp.InitializeEntity(config, gpstate);
            return gp;
        }

        public static (string path, string propName) GetPropertyPathParts(string fullPath)
        {
            if (fullPath.IsNullOrWhitespace()) return (null, null);

            var parts = fullPath.Split(new[] { '.' }, StringSplitOptions.RemoveEmptyEntries);

            return ($"{parts.Take(parts.Length - 1).Join(".")}", parts.Last());
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
                else if (quote.Length <= i || quote.Length > i && quote[i])
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
                    if (quote.Length <= i || quote.Length > i && quote[i])
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
            var sb = new StringBuilder();
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
            var sb = string.IsNullOrEmpty(name)
                ? new StringBuilder(wrap ? "{" : string.Empty)
                : new StringBuilder((wrap ? "{" : string.Empty) + "\"" + name + "\": {");
            if (d.Count > 0)
            {
                foreach (var e in d)
                {
                    sb.Append("\"" + e.Key + "\": \"" + e.Value + "\",");
                }
                sb.Remove(sb.Length - 1, 1);
            }
            sb = string.IsNullOrEmpty(name) ? sb.Append(wrap ? "}" : string.Empty) : sb.Append("}" + (wrap ? "}" : string.Empty));

            return sb.ToString();
        }

        public static string Json(string keyName, List<string> data, bool wrap = true, bool quote = true)
        {
            if (data == null || data.Count == 0)
                return (wrap ? "{" : string.Empty) + "\"" + keyName + "\": " + "[]" + (wrap ? "}" : string.Empty);

            var sb = new StringBuilder((wrap ? "{" : string.Empty) + "\"" + keyName + "\": ");
            sb.Append("[");
            foreach (var e in data)
            {
                sb = quote ? sb.Append("\"" + data + "\",") : sb.Append(data + ",");
            }
            sb.Remove(sb.Length - 1, 1);
            sb.Append("]" + (wrap ? "}" : string.Empty));
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

    // https://stackoverflow.com/questions/17584701/json-net-serialize-json-string-property-into-json-object
    public class RawJsonConverter : JsonConverter
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            writer.WriteRawValue(value.ToString());
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        public override bool CanConvert(Type objectType)
        {
            return typeof(string).IsAssignableFrom(objectType);
        }

        public override bool CanRead
        {
            get { return false; }
        }
    }
}
