using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataManager
{
    // Data that only lives for this request
    public class DataLifespanRequest<T> : GenericEntityBase where T : IGenericEntity, new()
    {
        private T _data;

        public DataLifespanRequest() { }

        public override void InitializeEntity(object configuration, object data)
        {
            T entity = new T();
            entity.InitializeEntity(null, data);
        }

        public override object this[string path]
        {
            get
            {
                return _data[path];
            }
        }

        public override IEnumerable<IGenericEntity> GetL(string path)
        {
            foreach (var item in _data.GetL(path))
            {
                yield return item;
            }
        }

        public override IGenericEntity GetE(string path)
        {
            return _data.GetE(path);
        }
    }
}
