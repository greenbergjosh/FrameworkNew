using System;
using System.Collections.Generic;
using System.Linq;

namespace Utility.GenericEntity
{
    public class GenericEntityStack : IGenericEntity
    {
        private readonly Stack<IGenericEntity> _stack = new();

        public void Push(IGenericEntity genericEntity) => _stack.Push(genericEntity);

        public object this[string path] => GetValue(path, g => g[path]);

        public Dictionary<string, object> State => throw new NotImplementedException();

        public object Cb(string callbackName, string args) => throw new NotImplementedException();
        public object Ext(string extensionClassName, string extensionMethodName, string args) => throw new NotImplementedException();
        public object Get(string path) => GetValue(path, g => g.Get(path));
        public object Get(string path, string fname) => GetValue(path, g => g.Get(path, fname));
        public T Get<T>(string path) => GetValue(path, g => g.Get<T>(path));
        public T Get<T>(string path, string fname) => GetValue(path, g => g.Get<T>(path, fname));
        public bool GetB(string path) => GetValue(path, g => g.GetB(path));
        public bool GetB(string path, string fname) => GetValue(path, g => g.GetB(path, fname));
        public IEnumerable<Tuple<string, string>> GetD(string path) => GetValue(path, g => g.GetD(path));
        public IEnumerable<(string key, IGenericEntity entity)> GetDe(string path) => GetValue(path, g => g.GetDe(path));
        public IGenericEntity GetE(string path) => GetValue(path, g => g.GetE(path));
        public IEnumerable<IGenericEntity> GetEs(string path) => GetValue(path, g => g.GetEs(path));
        public IEnumerable<IGenericEntity> GetL(string path) => GetValue(path, g => g.GetL(path));
        public IEnumerable<string> GetLS(string path, bool quoteStrings = false) => GetValue(path, g => g.GetLS(path));
        public string GetS(string path, char? quoteChar = null) => GetValue(path, g => g.GetS(path, quoteChar));
        public string GetS(string path, string fname) => GetValue(path, g => g.GetS(path, fname));
        public bool HasPath(string path) => _stack.Select(g => g.HasPath(path)).Any();
        public void InitializeEntity(RoslynWrapper rw, object configuration, object data) => throw new NotImplementedException();
        public void RegisterNamedCallback(string callbackName, Func<IGenericEntity, Dictionary<string, object>, string, object> callback) => throw new NotImplementedException();
        public object Run(string fname) => throw new NotImplementedException();
        public T Run<T>(string fname) => throw new NotImplementedException();
        public bool RunB(string fname) => throw new NotImplementedException();
        public string RunS(string fname) => throw new NotImplementedException();
        public void Set(string path, object value) => throw new NotImplementedException();

        private T GetValue<T>(string path, Func<IGenericEntity, T> selector)
        {
            var firstValueHolder = _stack.FirstOrDefault(ge => ge.HasPath(path));
            if (firstValueHolder == null)
            {
                return default;
            }

            return selector(firstValueHolder);
        }
    }
}
