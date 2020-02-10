using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Framework.Core.GenericEntity;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Framework.Core.EntityStoreProviders
{
    internal class JsonEntityStoreProvider : IEntityStoreProvider
    {
        private static ConcurrentDictionary<Guid, IGenericEntity> _entities = 
            new ConcurrentDictionary<Guid, IGenericEntity>();
        private static ConcurrentDictionary<Guid, IGenericEntity> _contracts = 
            new ConcurrentDictionary<Guid, IGenericEntity>();
        private static ConcurrentDictionary<string, ConcurrentBag<Guid>> _relations = 
            new ConcurrentDictionary<string, ConcurrentBag<Guid>>();

        public async Task<IGenericEntity> GetEntity(Guid entityId)
        {
            _entities.TryGetValue(entityId, out IGenericEntity entity);
            return await Task.FromResult(entity);
        }

        public async Task<IGenericEntity> GetContract(Guid contractId)
        {
            _contracts.TryGetValue(contractId, out IGenericEntity contract);
            return await Task.FromResult(contract);
        }

        public Task<Guid> GetRelation(Guid entityId, string relation)
        {
            _relations.TryGetValue(entityId + relation, out var rEntityentities);
            if (rEntityentities != null)
                return Task.FromResult(rEntityentities.FirstOrDefault());

            return Task.FromResult(Guid.Empty);
        }

        public Task<IEnumerable<Guid>> GetRelations(Guid entityId, string relation)
        {
            _relations.TryGetValue(entityId + relation, out var rEntityIds);
            return Task.FromResult(rEntityIds ?? Enumerable.Empty<Guid>());
        }

        static JsonEntityStoreProvider()
        {
            string entitiesJson;
            using (var stream = typeof(JsonEntityStoreProvider).Assembly.GetManifestResourceStream(
                "Framework.Core.EntityStoreProviders.Entities.json"))
            {
                using (var sr = new StreamReader(stream))
                {
                    entitiesJson = sr.ReadToEnd();
                }
            }

            var entitiesJObject = (JObject)JsonConvert.DeserializeObject(entitiesJson);

            var dict = JObjectToDictionary(entitiesJObject);
            var entities = new GenericEntityCollection();
            entities.InitializeEntity(null, dict);

            foreach (var relation in entities.GetL("Relations"))
            {
                var left = (string)relation["LEntityId"];
                var name = relation["Name"];
                var right = Guid.Parse(relation["REntityId"].ToString());
                var relationName = left + name;

                if (_relations.TryGetValue(relationName, out ConcurrentBag<Guid> rEntities))
                    rEntities.Add(right);
                else
                    _relations.TryAdd(left + name, new ConcurrentBag<Guid>() { right });
            }

            foreach (var contract in entities.GetL("Contracts"))
            {
                _contracts.TryAdd(Guid.Parse(contract["Id"].ToString()), contract);
            }

            foreach (var entity in entities.GetL("Nodes"))
            {
                _entities.TryAdd(Guid.Parse(entity["Id"].ToString()), entity);
            }
        }

        private static IDictionary<string, object> JObjectToDictionary(JObject value)
        {
            var dictionary = (IDictionary<string, object>)ToObject(value);
            return dictionary;
        }

        public static object ToObject(JToken token)
        {
            switch (token.Type)
            {
                case JTokenType.Object:
                    return token.Children<JProperty>()
                                .ToDictionary(prop => prop.Name,
                                              prop => ToObject(prop.Value));

                case JTokenType.Array:
                    var items = token.Select(ToObject).ToList();
                    IList list;
                    var types = items.Select(item => item.GetType()).Distinct();
                    if (types.Count() == 1)
                    {
                        var genericList = typeof(List<>);
                        var genericType = types.First();
                        if (genericType.GetInterface(typeof(IDictionary<string, object>).Name) != null)
                        {
                            list = new List<IDictionary<string, object>>();
                        }
                        else
                        {
                            var typedList = genericList.MakeGenericType(genericType);
                            list = (IList)Activator.CreateInstance(typedList);
                        }
                        foreach (var item in items)
                        {
                            list.Add(item);
                        }
                    }
                    else
                    {
                        list = new List<object>(items);
                    }
                    return list;

                default:
                    return ((JValue)token).Value;
            }
        }
    }
}
