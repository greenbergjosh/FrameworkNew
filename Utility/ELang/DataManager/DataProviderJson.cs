using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace DataManager
{
    public class DataProviderJson : GenericEntityBase
    {
        private JToken _root;

        public DataProviderJson() { }

        public override void InitializeEntity(object configuration, object data)
        {
            if (data is JObject)
            {
                _root = (data as JObject).Root;
            }
            else if (data is JToken)
            {
                _root = (data as JToken);
            }
            else
            {
                _root = JObject.Parse(@"{}");
            }
        }

        private string ConvertPath(string path)
        {
            path = "$." + path;
            path = path.Replace('/', '.');
            return path;
        }

        public override object this[string path] => _root.SelectToken(ConvertPath(path));

        public override IEnumerable<IGenericEntity> GetL(string path)
        {
            foreach (var item in _root.SelectTokens(ConvertPath(path)).Children())
            {
                var entity = new DataProviderJson();
                entity.InitializeEntity(null, item);
                yield return entity;
            }
        }

        public override IGenericEntity GetE(string path)
        {
            var entity = new DataProviderJson();
            entity.InitializeEntity(null, _root.SelectToken(ConvertPath(path)));
            return entity;
        }

    }
}
