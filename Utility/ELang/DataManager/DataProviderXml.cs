using System.Collections.Generic;
using System.Xml;

namespace DataManager
{
    public class DataProviderXml : GenericEntityBase
    {
        private XmlNode _root;

        public DataProviderXml() { }

        public override void InitializeEntity(object configuration, object data)
        {
            if (data is XmlNode) _root = (data as XmlNode);
        }

        public override object this[string path] => _root.SelectSingleNode(path).InnerText;

        public override IEnumerable<IGenericEntity> GetL(string path)
        {
            foreach (XmlNode item in _root.SelectNodes(path))
            {
                DataProviderXml entity = new DataProviderXml();
                entity.InitializeEntity(null, item);
                yield return entity;
            }
        }

        public override IGenericEntity GetE(string path)
        {
            DataProviderXml entity = new DataProviderXml();
            entity.InitializeEntity(null, _root.SelectSingleNode(path));
            return entity;
        }
    }
}
