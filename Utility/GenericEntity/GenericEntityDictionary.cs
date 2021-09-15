using System;
using System.Collections.Generic;

namespace Utility.GenericEntity
{
    public class GenericEntityDictionary : GenericEntityBase
    {
        public readonly IDictionary<string, object> _root;

        public GenericEntityDictionary(IDictionary<string, object> data)
        {
            _root = data;
        }

        public override object this[string path]
        {
            get
            {
                var pathParts = path.Split('/');

                var current = _root;

                for (var i = 0; i < pathParts.Length - 1; i++)
                {
                    if (!_root.ContainsKey(pathParts[i]))
                    {
                        return null;
                    }

                    current = (IDictionary<string, object>)_root[pathParts[i]];
                    if (current == null)
                    {
                        return null;
                    }
                }

                return current[pathParts[^1]];
            }
        }

        public override bool HasPath(string path)
        {
            var pathParts = path.Split('/');

            var current = _root;

            for (var i = 0; i < pathParts.Length - 1; i++)
            {
                if (!current.ContainsKey(pathParts[i]))
                {
                    return false;
                }

                current = (IDictionary<string, object>)_root[pathParts[i]];
                if (current == null)
                {
                    return false;
                }
            }

            return current.ContainsKey(pathParts[^1]);
        }

        public override IEnumerable<IGenericEntity> GetL(string path) => (IEnumerable<IGenericEntity>)Get(path);


        public override IEnumerable<string> GetLS(string path, bool quoteStrings = false) => (IEnumerable<string>)Get(path);

        public override IGenericEntity GetE(string path) => (IGenericEntity)Get(path);

        public override IEnumerable<IGenericEntity> GetEs(string path) => (IEnumerable<IGenericEntity>)Get(path);

        public override IEnumerable<Tuple<string, string>> GetD(string path) => (IEnumerable<Tuple<string, string>>)Get(path);

        public override IEnumerable<(string key, IGenericEntity entity)> GetDe(string path) => (IEnumerable<(string key, IGenericEntity entity)>)Get(path);
    }
}
