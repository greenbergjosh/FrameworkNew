using Newtonsoft.Json.Linq;
using System.Collections.Generic;

namespace GenericEntity
{
    public class GenericEntityJson : GenericEntityBase
    {
        public JToken _root;

        public GenericEntityJson() { }

        public override void InitializeEntity(RoslynWrapper.RoslynWrapper rw, object configuration, object data)
        {
            this.rw = rw;
            if (data is JObject || data is JToken || data is JArray) _root = (data as JToken);
            else _root = JObject.Parse(@"{}");
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

        public override object this[string path]
        {
            get
            {
                return _root.SelectToken(ConvertPath(path));
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
            entity.InitializeEntity(this.rw, null, _root.SelectToken(ConvertPath(path)));
            return entity;
        }

    }
}
