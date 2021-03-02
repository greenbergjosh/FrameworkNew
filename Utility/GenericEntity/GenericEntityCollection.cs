using System.Collections.Generic;

namespace Utility.GenericEntity
{
    public class GenericEntityCollection : GenericEntityBase
    {
        private Dictionary<string, object> _root;

        public GenericEntityCollection() { }

        public override void InitializeEntity(RoslynWrapper rw, object configuration, object data)
        {
            this.rw = rw;
            _root = (data as Dictionary<string, object>);
        }

        public override object this[string path]
        {
            get
            {
                object currentNode = _root;
                foreach (string node in path.Split('/'))
                {
                    currentNode = ((Dictionary<string, object>)currentNode)[node];
                }

                return currentNode;
            }
        }

        public override bool HasPath(string path) => throw new System.NotImplementedException();

        public override IEnumerable<IGenericEntity> GetL(string path)
        {
            foreach (Dictionary<string, object> item in ((List<Dictionary<string, object>>)this[path]))
            {
                GenericEntityCollection entity = new GenericEntityCollection();
                entity.InitializeEntity(this.rw, null, item);
                yield return entity;
            }
        }

        public override IGenericEntity GetE(string path)
        {
            GenericEntityCollection entity = new GenericEntityCollection();
            entity.InitializeEntity(this.rw, null, (Dictionary<string, object>)this[path]);
            return entity;
        }
    }
}
