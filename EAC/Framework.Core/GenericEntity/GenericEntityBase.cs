using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.GenericEntity
{
    public abstract class GenericEntityBase : IGenericEntity
    {
        public abstract void InitializeEntity(object configuration, object data);
        public abstract object this[string path] { get; }
        public abstract bool TryGetValue<T>(string path, out T value, T defaultValue = default);
        public abstract void Set(string path, object value);
        public abstract IGenericEntity GetE(string path);
        public abstract IGenericEntity GetE(string path, IGenericEntity defaultValue);
        public abstract IEnumerable<IGenericEntity> GetL(string path);
        public abstract Task<object> Run(string path, params object[] args);

        public virtual dynamic Get(string path)
        {
            return this[path];
        }

        public virtual T Get<T>(string path)
        {
            return DictionaryExtensions.Get(typeof(T), Get(path));
        }

        public virtual T Get<T>(string path, T defaultValue)
        {
            TryGetValue(path, out var value, defaultValue);
            return value;
        }

        public virtual IEnumerable<dynamic> GetA(string path)
        {
            var enumerable = Get<IEnumerable>(path, null);
            if (enumerable == null)
                yield break;

            foreach (var value in enumerable)
                yield return value;
        }

        public virtual bool GetB(string path)
        {
            var s = Get(path);
            if (s == null)
                return false;

            if (s is bool b)
                return b;

            return s.ToString().ParseBool() == true;
        }

        public IEnumerable<KeyValuePair<string, dynamic>> GetD(string path)
        {
            if (!TryGetValue<IDictionary<string, object>>(path, out var d))
                yield break;

            foreach (var kv in d)
                yield return kv;
        }

        public virtual string GetS(string path)
        {
            var s = Get(path);
            return s?.ToString();
        }
    }
}
