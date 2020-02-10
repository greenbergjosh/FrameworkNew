using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace Framework.Core.GenericEntity
{
    public class GenericEntityJson : GenericEntityBase
    {
        private JToken _root;

        public override void InitializeEntity(object configuration, object data)
        {
            if (data is JObject || data is JToken || data is JArray) _root = data as JToken;
            else _root = JToken.FromObject(data);
        }
                private string ConvertPath(string path)
        {
            if (path == string.Empty) path = "$";
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

            var parts = fullPath.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);

            return ($"{parts.Take(parts.Length - 1).Join(".")}", parts.Last());
        }

        public override object this[string path] => _root.SelectToken(ConvertPath(path));

        public override bool TryGetValue<T>(string path, out T value, T defaultValue = default)
        {
            var tmpValue = _root.SelectToken(ConvertPath(path));
            if (tmpValue == null)
            {
                value = defaultValue;
                return false;
            }

            value = (T)DictionaryExtensions.Get(typeof(T), tmpValue);
            return true;
        }

        public override void Set(string path, object value)
        {
            var cpath = SplitPropertyPath(path);

            if (cpath != null && _root.SelectToken(cpath?.path) is JObject parent)
            {
                JToken tok;
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

        public override IGenericEntity GetE(string path)
        {
            var entity = new GenericEntityJson();
            var data = _root.SelectToken(ConvertPath(path));

            if (data == null) return null;

            entity.InitializeEntity(null, data);
            return entity;
        }

        public override IGenericEntity GetE(string path, IGenericEntity defaultValue)
        {
            if (!TryGetValue(path, out object e))
                return defaultValue;

            var entity = new GenericEntityJson();
            entity.InitializeEntity(null, e);
            return entity;
        }

        public override IEnumerable<IGenericEntity> GetL(string path)
        {
            if (TryGetValue<IEnumerable>(path, out var enumerable))
            {
                foreach (var item in enumerable)
                {
                    var entity = new GenericEntityJson();
                    entity.InitializeEntity(null, item);
                    yield return entity;
                }
            }
        }

        public override Task<object> Run(string path, params object[] args)
        {
            throw new NotImplementedException();
        }
    }
}
