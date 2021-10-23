using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;
using System.Xml.Schema;
using System.Xml.XPath;

namespace Framework.Core.EntityStoreProviders
{
    public class XmlEntityStoreProvider : IEntityStoreProvider
    {
        private static readonly ConcurrentDictionary<Guid, Entity> _entities = new ConcurrentDictionary<Guid, Entity>();

        public async Task<Entity> GetEntity(Guid entityId)
        {
            _entities.TryGetValue(entityId, out Entity entity);
            return await Task.FromResult(entity);
        }

        public XElement SerializeEntity(IDictionary<string, object> entity) => SerializeValue(entity);

        public void AddEntity(IDictionary<string, object> entityData)
        {
            var entityId = entityData.Get<Guid>("EntityId");
            var entity = new Entity(entityData);

            if (!_entities.TryAdd(entityId, entity))
            {
                throw new ArgumentException("Entity with ID [" + entityId + "] already exists");
            }
        }

        public void UpdateEntity(IDictionary<string, object> entityData)
        {
            var entityId = entityData.Get<Guid>("EntityId");
            var entity = new Entity(entityData);
            _entities.TryGetValue(entityId, out Entity existing);
            if (!_entities.TryUpdate(entityId, entity, existing))
            {
                throw new ArgumentException("No entity with ID [" + entityId + "]");
            }
        }

        public void DeleteEntity(Guid entityId) => _entities.TryRemove(entityId, out Entity entity);

        public void Save()
        {
            var entities = _entities.Select(kvp => kvp.Value).OrderBy(d => GuidHelper.ToInt(d.Get<Guid>("EntityId"))).ToList();
            XElement xml = SerializeValue(entities);

            foreach (var node in xml.XPathSelectElements("//name[substring(text(), string-length(text()) - 7) = 'EntityId']/following-sibling::value"))
            {
                var entityIdGuid = node.Value<Guid>();
                var entityIdInt = GuidHelper.ToInt(entityIdGuid);
                node.Value = entityIdInt.ToString();
            }

            XNamespace ns = "http://tempuri.org/XMLSchema.xsd";

            foreach (var element in xml.DescendantsAndSelf())
            {
                element.Name = ns.GetName(element.Name.LocalName);
            }

            XmlWriterSettings settings = new XmlWriterSettings();
            settings.Indent = true;
            using (var writer = XmlWriter.Create("C:\\Framework\\Projects\\Framework.Core\\EntityStoreProviders\\Entity.xml", settings))
            {
                xml.WriteTo(writer);
            }
        }

        private XElement SerializeValue(object value)
        {
            var valueNode = new XElement("value");

            if (value is IDictionary<string, object>)
            {
                XElement dictionary = new XElement("dict");
                valueNode.Add(dictionary);
                foreach (var kvp in value as IDictionary<string, object>)
                {
                    var pair = new XElement("pair");
                    dictionary.Add(pair);
                    pair.Add(new XElement("name", kvp.Key));
                    pair.Add(SerializeValue(kvp.Value));
                }
            }
            else if (value is IList)
            {
                XElement list = new XElement("list");
                valueNode.Add(list);
                foreach (var item in value as IList)
                {
                    var listItem = new XElement("item");
                    list.Add(listItem);
                    listItem.Add(SerializeValue(item));
                }
            }
            else
            {
                valueNode.SetValue(value);
            }

            return valueNode;
        }

        static XmlEntityStoreProvider()
        {
            string entitiesXml;
            using (var stream = typeof(Configuration).Assembly.GetManifestResourceStream("Framework.Core.EntityStoreProviders.Entity.xml"))
            {
                using (var sr = new StreamReader(stream))
                {
                    entitiesXml = sr.ReadToEnd();
                }
            }

            XElement entities = XElement.Parse(entitiesXml);

            using (var stream = typeof(Configuration).Assembly.GetManifestResourceStream("Framework.Core.EntityStoreProviders.Entity.xsd"))
            {
                XmlSchemaSet schemas = new XmlSchemaSet();
                schemas.Add(null, XmlReader.Create(stream));
                XDocument validated = new XDocument(entities);
                validated.Validate(schemas, null);
            }

            foreach (var element in entities.DescendantsAndSelf())
            {
                element.Name = element.Name.LocalName;
            }

            // Transform INT to GUID, this will go away once our config is Guid-based.
            // It is just easier to read the INTs during development.
            foreach (var node in entities.XPathSelectElements("//name[substring(text(), string-length(text()) - 7) = 'EntityId']/following-sibling::value"))
            {
                var entityIdInt = node.Value<int>();
                Guid entityIdGuid = GuidHelper.FromInt(entityIdInt);
                node.Value = entityIdGuid.ToString();
            }

            foreach (var entityData in (IList<IDictionary<string, object>>)GetValue(entities))
            {
                var entityId = entityData.Get<Guid>("EntityId");
                var entity = new Entity(entityData);
                if (!_entities.TryAdd(entityId, entity))
                    throw new InvalidOperationException("There is already an entity with ID: [" + entityId + "]");
            }
        }

        private static object GetValue(XElement element)
        {
            if (element.HasElements)
            {
                var isList = element.Element("list") != null;
                var isDictionary = element.Element("dict") != null;

                if (isList)
                {
                    var listItems = element.XPathSelectElements("list/item/value");

                    object[] items = new object[listItems.Count()];
                    int i = 0;
                    foreach (var listItem in listItems)
                    {
                        var value = GetValue(listItem);
                        items[i++] = value;
                    }

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
                }
                else if (isDictionary)
                {
                    var dictionaryValues = element.XPathSelectElements("dict/pair");
                    var dictionary = new Dictionary<string, object>();
                    foreach (var parameterValue in dictionaryValues)
                    {
                        var name = parameterValue.Element("name").Value;
                        var value = GetValue(parameterValue.Element("value"));
                        dictionary[name] = value;
                    }
                    return dictionary;
                }
                else
                {
                    throw new InvalidOperationException("Unknown value type: " + element.Elements().First().Name);
                }
            }
            else
            {
                return element.Value;
            }
        }

    }

    internal static class XElementExtensions
    {
        public static TValue Value<TValue>(this XElement element)
        {
            if (element == null)
                throw new ArgumentNullException("element");

            return (TValue)GetValue(typeof(TValue), element);
        }

        public static TValue Value<TValue>(this XElement element, TValue defaultValue)
        {
            if (element == null)
                return defaultValue;

            return (TValue)GetValue(typeof(TValue), element);
        }

        public static TValue Value<TValue>(this XAttribute attribute)
        {
            if (attribute == null)
                return default(TValue);

            return (TValue)GetValue(typeof(TValue), attribute);
        }

        private static object GetValue(Type type, XElement element)
        {
            if (type == typeof(string))
            {
                if (element.HasElements && element.Elements().Count() == 1)
                    return element.Elements().Single().ToString();

                return element.Value;
            }

            if (string.IsNullOrWhiteSpace(element.Value))
            {
                if (!type.IsValueType)
                    return null;

                return Activator.CreateInstance(type);
            }

            try
            {
                MethodInfo tryParseMethod = type.GetMethod("TryParse", new Type[] { typeof(string), type.MakeByRefType() });
                if (tryParseMethod != null)
                {
                    object[] parameters = { element.Value, null };
                    tryParseMethod.Invoke(null, parameters);
                    return parameters[1];
                }

                var value = Convert.ChangeType(element.Value, type);
                return value;
            }
            catch (Exception ex)
            {
                throw new Exception("Couldn't convert [" + element.Value + "] to type: " + type.AssemblyQualifiedName + Environment.NewLine + ex.Message);
            }
        }

        private static object GetValue(Type type, XAttribute attribute)
        {
            if (type == typeof(string))
            {
                return attribute.Value;
            }

            if (string.IsNullOrWhiteSpace(attribute.Value))
            {
                if (!type.IsValueType)
                    return null;

                return Activator.CreateInstance(type);
            }

            try
            {
                MethodInfo tryParseMethod = type.GetMethod("TryParse", new Type[] { typeof(string), type.MakeByRefType() });
                if (tryParseMethod != null)
                {
                    object[] parameters = { attribute.Value, null };
                    tryParseMethod.Invoke(null, parameters);
                    return parameters[1];
                }

                var value = Convert.ChangeType(attribute.Value, type);
                return value;
            }
            catch (Exception ex)
            {
                throw new Exception("Couldn't convert [" + attribute.Value + "] to type: " + type.AssemblyQualifiedName + Environment.NewLine + ex.Message);
            }
        }
    }
}
