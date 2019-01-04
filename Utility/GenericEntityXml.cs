using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace Utility
{
    public class GenericEntityXml : GenericEntityBase
    {
        private XmlNode _root;

        public GenericEntityXml() { }

        public override void InitializeEntity(RoslynWrapper rw, object configuration, object data)
        {
            if (data is XmlNode) _root = (data as XmlNode);
        }
       
        public override object this[string path]
        {
            get
            {
                return _root.SelectSingleNode(path).InnerText;
            }
        }

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
