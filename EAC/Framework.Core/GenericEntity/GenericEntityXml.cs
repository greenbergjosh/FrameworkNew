using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Xml;

namespace Framework.Core.GenericEntity
{
    public class GenericEntityXml : GenericEntityBase
    {
        private XmlNode _root;

        public override void InitializeEntity(object configuration, object data)
        {
            if (data is XmlNode) _root = data as XmlNode;
        }

        public override dynamic this[string path]
        {
            get
            {
                return _root.SelectSingleNode(path).InnerText;
            }
        }

        public override bool TryGetValue<T>(string path, out T value, T defaultValue = default)
        {
            var node = _root.SelectSingleNode(path);
            if (node == null)
            {
                value = defaultValue;
                return false;
            }

            value = (T)DictionaryExtensions.Get(typeof(T), node.InnerText);
            return true;
        }

        public override void Set(string path, object value)
        {
            throw new NotImplementedException();
        }

        public override IGenericEntity GetE(string path)
        {
            var entity = new GenericEntityXml();
            entity.InitializeEntity(null, _root.SelectSingleNode(path));
            return entity;
        }

        public override IGenericEntity GetE(string path, IGenericEntity defaultValue)
        {
            if (!TryGetValue(path, out object e))
                return defaultValue;

            var entity = new GenericEntityXml();
            entity.InitializeEntity(null, e);
            return entity;
        }

        public override IEnumerable<IGenericEntity> GetL(string path)
        {
            if (TryGetValue<IEnumerable>(path, out var enumerable))
            {
                foreach (var item in enumerable)
                {
                    var entity = new GenericEntityXml();
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
