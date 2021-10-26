using System.Collections.Generic;
using System.Xml;

namespace Utility.GenericEntity
{
    public class GenericEntityXml : GenericEntityBase
    {
        private XmlNode _root;

        public GenericEntityXml() { }

        public override void InitializeEntity(RoslynWrapper rw, object configuration, object data)
        {
            if (data is XmlNode) _root = (data as XmlNode);
        }

        public override bool HasPath(string path) => _root.SelectSingleNode(path) != null;

        public override object this[string path] => _root.SelectSingleNode(path).InnerText;

        public override IEnumerable<IGenericEntity> GetL(string path)
        {
            foreach (XmlNode item in _root.SelectNodes(path))
            {
                GenericEntityXml entity = new GenericEntityXml();
                entity.InitializeEntity(null, null, item);
                yield return entity;
            }
        }

        public override IGenericEntity GetE(string path)
        {
            GenericEntityXml entity = new GenericEntityXml();
            entity.InitializeEntity(null, null, _root.SelectSingleNode(path));
            return entity;
        }
    }
}
