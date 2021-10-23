
using System.IO;
using Framework.Core;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DataManager //Framework.Core.DataManager ///Should switch to this namespace
{
    public class EntityManager
    {
        private EntityManager() { }

        public static IGenericEntity Data = new DataProviderJson();

        static EntityManager()
        {
            string entitiesJson;
            using (var stream = typeof(Configuration).Assembly.GetManifestResourceStream("Framework.Core.EntityStoreProviders.Entity.json"))
            {
                using (var sr = new StreamReader(stream))
                {
                    entitiesJson = sr.ReadToEnd();
                }
            }

            var entitiesJObject = (JObject)JsonConvert.DeserializeObject(entitiesJson);
            Data.InitializeEntity(null, entitiesJObject);
        }
    }
}
