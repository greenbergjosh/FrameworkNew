using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.GenericEntity
{
    public class GenericEntityCollection : GenericEntityBase
    {
        private IDictionary<string, object> _root;

        public override void InitializeEntity(object configuration, object data)
        {
            _root = data as IDictionary<string, object>;
        }

        public override dynamic this[string path]
        {
            get
            {
                object currentNode = _root;
                foreach (string node in path.Split('/'))
                    currentNode = ((Dictionary<string, object>)currentNode)[node];

                return currentNode;
            }
        }

        public override bool TryGetValue<T>(string path, out T value, T defaultValue = default)
        {
            object currentNode = _root;
            foreach (string node in path.Split('/'))
            {
                if (!((IDictionary<string, object>)currentNode).TryGetValue(node, out currentNode))
                {
                    value = defaultValue;
                    return false;
                }
            }

            value = (T)DictionaryExtensions.Get(typeof(T), currentNode);
            return true;
        }

        public override void Set(string path, object value)
        {
            throw new NotImplementedException();
        }

        public override IGenericEntity GetE(string path)
        {
            GenericEntityCollection entity = new GenericEntityCollection();
            entity.InitializeEntity(null, this[path]);
            return entity;
        }

        public override IGenericEntity GetE(string path, IGenericEntity defaultValue)
        {
            if (!TryGetValue(path, out object e))
                return defaultValue;

            GenericEntityCollection entity = new GenericEntityCollection();
            entity.InitializeEntity(null, e);
            return entity;
        }

        public override IEnumerable<IGenericEntity> GetL(string path)
        {
            if (TryGetValue<IEnumerable<object>>(path, out var enumerable))
            {
                foreach (var item in enumerable)
                {
                    var entity = new GenericEntityCollection();
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
