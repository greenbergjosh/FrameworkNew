using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Framework.Core.EntityStoreProviders
{
    internal class JsonEntityStoreProvider : IEntityStoreProvider
    {
        private static ConcurrentDictionary<Guid, Entity> _entities = new ConcurrentDictionary<Guid, Entity>();

        public async Task<Entity> GetEntity(Guid entityId)
        {
            Entity entity;
            _entities.TryGetValue(entityId, out entity);
            return await Task.FromResult(entity);
        }

        static JsonEntityStoreProvider()
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

            var entities = JObjectToDictionary(entitiesJObject);

            foreach (var entity in (List<IDictionary<string, object>>)entities["ConfigurationEntities"])
            {
                _entities.TryAdd((Guid)entity["EntityId"], new Entity(entity));
            }
        }

        private static IDictionary<string, object> JObjectToDictionary(JObject value)
        {
            var dictionary = (IDictionary<string, object>)ToObject(value);
            TransformEntityIds(dictionary);
            return dictionary;
        }

        private static object ToObject(JToken token)
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

        private static void TransformEntityIds(IDictionary<string, object> entity)
        {
            var keysToTransform = new List<string>();

            foreach (var kvp in entity)
            {
                if (kvp.Key.EndsWith("EntityId"))
                {
                    keysToTransform.Add(kvp.Key);
                }
                else if (kvp.Key == "Name" && kvp.Value is string && kvp.Value.ToString().EndsWith("EntityId"))
                {
                    keysToTransform.Add("Value");
                }

                if (kvp.Value is IDictionary<string, object>)
                {
                    TransformEntityIds((IDictionary<string, object>)kvp.Value);
                }
                else if (kvp.Value is IList)
                {
                    foreach (var item in (IList)kvp.Value)
                    {
                        if (item is IDictionary<string, object>)
                        {
                            TransformEntityIds((IDictionary<string, object>)item);
                        }
                    }
                }
            }

            foreach (var key in keysToTransform)
            {
                try
                {
                    entity[key] = GuidHelper.FromInt((int)(long)entity[key]);
                }
                catch { }
            }
        }
    }
}
