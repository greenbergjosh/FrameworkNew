using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;

namespace Utility.GenericEntity
{
    public class GenericEntityJson : GenericEntityBase
    {
        public JToken _root;

        public GenericEntityJson() { }

        public override void InitializeEntity(RoslynWrapper rw, object configuration, object data)
        {
            this.rw = rw;
            if (data is JObject || data is JToken || data is JArray) _root = (data as JToken);
            else _root = JToken.FromObject(data);
        }

        private string ConvertPath(string path)
        {
            if (path == "") path = "$";
            else
            {
                path = "$." + path;
                path = path.Replace('/', '.');
            }
            return path;
        }

        private (string path, string propName)? SplitPropertyPath(string fullPath)
        {
            if (fullPath.IsNullOrWhitespace()) return null;

            fullPath = $"$/{fullPath}";

            var parts = fullPath.Split('/', StringSplitOptions.RemoveEmptyEntries);

            return ($"{parts.Take(parts.Length - 1).Join(".")}", parts.Last());
        }

        public override object this[string path] => _root.SelectToken(ConvertPath(path));

        public override void Set(string path, object value)
        {
            var cpath = SplitPropertyPath(path);

            if (cpath != null && _root.SelectToken(cpath?.path) is JObject parent)
            {
                JToken tok = null;

                if (value is string vStr && !vStr.IsNullOrWhitespace())
                {
                    try { tok = JToken.Parse(vStr); }
                    catch (Exception) { tok = vStr; }
                }
                else tok = JToken.FromObject(value);

                var prop = parent.Property(cpath.Value.propName);

                if (prop == null) parent.Add(cpath.Value.propName, tok);
                else prop.Value = tok;
            }
        }

        public override IEnumerable<IGenericEntity> GetL(string path)
        {
            foreach (JToken item in _root.SelectTokens(ConvertPath(path)).Children())
            {
                GenericEntityJson entity = new GenericEntityJson();
                entity.InitializeEntity(this.rw, null, item);
                yield return entity;
            }
        }

        public override IGenericEntity GetE(string path)
        {
            GenericEntityJson entity = new GenericEntityJson();
            var data = _root.SelectToken(ConvertPath(path));

            if (data == null) return null;

            entity.InitializeEntity(this.rw, null, data);
            return entity;
        }

        public override IEnumerable<Tuple<string, string>> GetD(string path)
        {
            // 
            // THIS IS NOT NULL SAFE
            //
            GenericEntityJson entity = new GenericEntityJson();
            entity.InitializeEntity(this.rw, null, _root.SelectToken(ConvertPath(path)));
            foreach (var je in entity._root.AsJEnumerable())
            {
                yield return new Tuple<string, string>(((JProperty)je).Name,
                    ((JProperty)je).Value.ToString());
            }
        }

        //public override IEnumerable<Tuple<string, string>> GetArrTuples(string path)
        //{
        //    GenericEntityJson entity = new GenericEntityJson();
        //    entity.InitializeEntity(this.rw, null, _root.SelectToken(ConvertPath(path)));
        //    foreach (var je in entity._root.AsJEnumerable())
        //    {
        //        yield return new Tuple<string, string>(((JProperty)((JObject)je).First).Name,
        //            ((JProperty)((JObject)je).First).Value.ToString());
        //    }
        //}
    }
}
