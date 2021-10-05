using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text.Json;
using Json.Path;
using Newtonsoft.Json.Linq;

namespace Utility.GenericEntity
{
    class GenericEntityJsonInclude : GenericEntityBase
    {
        public static PathEvaluationOptions options = new PathEvaluationOptions
        {
            ExperimentalFeatures =
                {
                    ProcessDataReferences = true,
                    DataReferenceDownload = async uri =>
                        uri.OriginalString == "http://example.com/11"
                            ? JsonDocument.Parse("{ \"c\": { \"d\": \"Hello\" } }")
                            : null
                }
        };

        public JsonElement _root;

        public GenericEntityJsonInclude() { }

        public static IGenericEntity CreateFromObject(object data, RoslynWrapper rw = null)
        {
            var entity = new GenericEntityJsonInclude();
            entity.InitializeEntity(rw, null, data);
            return entity;
        }

        public static IGenericEntity Parse(string data, RoslynWrapper rw = null)
        {
            var entity = new GenericEntityJsonInclude();
            entity.InitializeEntity(rw, null, JsonDocument.Parse(data);
            return entity;
        }

        public override void InitializeEntity(RoslynWrapper rw, object configuration, object data)
        {
            this.rw = rw;
            if (data is JsonDocument)
            {
                _root = ((JsonDocument)data).RootElement;
            }
        }

        private static string ConvertPath(string path)
        {
            if (path == "")
            {
                path = "$";
            }
            else if (!path.StartsWith("$"))
            { 
                path = "$." + path;
                path = path.Replace('/', '.');
            }
            return path;
        }

        public override object this[string path] => JsonPath.Parse(ConvertPath(path)).Evaluate(_root).Matches[0].Value;

        public override bool HasPath(string path) => JsonPath.Parse(ConvertPath(path)).Evaluate(_root).Matches.Count != 0;

        public override string GetS(string path, char? quoteChar = null)
        {
            var s = JsonPath.Parse(ConvertPath(path)).Evaluate(_root).Matches[0].Value;
            if (s.ValueKind == JsonValueKind.String && quoteChar.HasValue) return $"{quoteChar}{s}{quoteChar}";
            else return s.ToString();
        }

        public override void Set(string path, object value)
        {
            throw new NotImplementedException();
        }

        public override IEnumerable<IGenericEntity> GetL(string path)
        {
            foreach (var item in JsonPath.Parse(ConvertPath(path)).Evaluate(_root).Matches[0].Value.EnumerateArray())
            {
                var entity = new GenericEntityJsonInclude();
                entity.InitializeEntity(rw, null, item);
                yield return entity;
            }
        }

        public override IEnumerable<string> GetLS(string path, bool quoteStrings = false)
        {
            foreach (var item in JsonPath.Parse(ConvertPath(path)).Evaluate(_root).Matches[0].Value.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.String && quoteStrings) yield return $"\"{item}\"";
                else yield return item.ToString();
            }
        }

        public override IGenericEntity GetE(string path)
        {
            var entity = new GenericEntityJson();
            var data = JsonPath.Parse(ConvertPath(path)).Evaluate(_root).Matches[0].Value;

            entity.InitializeEntity(rw, null, data);
            return entity;
        }

        public override IEnumerable<IGenericEntity> GetEs(string path)
        {
            throw new NotImplementedException();
        }

        public override IEnumerable<Tuple<string, string>> GetD(string path)
        {
            throw new NotImplementedException();
        }

        public override IEnumerable<(string key, IGenericEntity entity)> GetDe(string path)
        {
            throw new NotImplementedException();
        }

        
        
    }
}
