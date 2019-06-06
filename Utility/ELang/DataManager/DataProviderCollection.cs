using System.Collections.Generic;

namespace DataManager
{
    public class DataProviderCollection : GenericEntityBase
    {
        private Dictionary<string, object> _root;

        public DataProviderCollection() { }

        public override void InitializeEntity(object configuration, object data) => _root = (data as Dictionary<string, object>);

        public override object this[string path]
        {
            get
            {
                object currentNode = _root;
                foreach (var node in path.Split('/'))
                {
                    currentNode = ((Dictionary<string, object>)currentNode)[node];
                }

                return currentNode;
            }
        }

        public override IEnumerable<IGenericEntity> GetL(string path)
        {
            foreach (var item in ((List<Dictionary<string, object>>)this[path]))
            {
                var entity = new DataProviderCollection();
                entity.InitializeEntity(null, item);
                yield return entity;
            }
        }

        public override IGenericEntity GetE(string path)
        {
            var entity = new DataProviderCollection();
            entity.InitializeEntity(null, (Dictionary<string, object>)this[path]);
            return entity;
        }
    }
}
