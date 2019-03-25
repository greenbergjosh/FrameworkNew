using DynamicCodeEngine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;



namespace DataManager
{
    public abstract class GenericEntityBase : IGenericEntity
    {
        public Dictionary<string, object> _state = new Dictionary<string, object>();

        public virtual void InitializeEntity(object configuration, object data) => throw new NotImplementedException();

        public virtual object this[string path] => throw new NotImplementedException();

        public virtual Dictionary<string, object> State => _state;

        private Dictionary<string, Func<IGenericEntity, Dictionary<string, object>, string, object>> _callbacks =
            new Dictionary<string, Func<IGenericEntity, Dictionary<string, object>, string, object>>();

        public void RegisterNamedCallback(string callbackName, Func<IGenericEntity, Dictionary<string, object>, string, object> callback)
        {
            if (!_callbacks.ContainsKey(callbackName))
            {
                _callbacks.Add(callbackName, callback);
            }
        }

        public object Cb(string callbackName, string args)
        {
            _callbacks.TryGetValue(callbackName, out var cf);
            if (cf != null)
            {
                return cf(this, _state, args);
            }
            return null;
        }

        public virtual IEnumerable<IGenericEntity> GetL(string path) => throw new NotImplementedException();

        public virtual IGenericEntity GetE(string path) => throw new NotImplementedException();

        public virtual object Get(string path) => this[path];

        public virtual object Run(string fname) => Get(null, fname);

        public virtual object Get(string path, string fname)
        {
            var val = (path == null || path.Length == 0) ? null : Get(path);
            var rw = new RoslynWrapper();
            return rw.RunFunction(fname, val, this).Result;
        }

        public virtual object Ext(string extensionClassName, string extensionMethodName, string args)
        {
            var query = from method in Type.GetType(extensionClassName).GetMethods(BindingFlags.Static
                            | BindingFlags.Public | BindingFlags.NonPublic)
                        where method.IsDefined(typeof(ExtensionAttribute), false)
                        where method.GetParameters()[0].ParameterType == typeof(IGenericEntity)
                        where method.Name == extensionMethodName
                        select method;

            var extensionMethod = query.First();
            if (extensionMethod != null)
            {
                return extensionMethod.Invoke(null, new object[] { this, _state, args });
            }
            return null;
        }

        public virtual T Get<T>(string path) => (T)Get(path);

        public virtual T Run<T>(string fname) => (T)Run(fname);

        public virtual T Get<T>(string path, string fname) => (T)Get(path, fname);

        public virtual string GetS(string path) => (string)Get(path);

        public virtual string RunS(string fname) => (string)Run(fname);

        public virtual string GetS(string path, string fname) => (string)Get(path, fname);

        public virtual bool GetB(string path) => (bool)Get(path);

        public virtual bool RunB(string fname) => (bool)Run(fname);

        public virtual bool GetB(string path, string fname) => (bool)Get(path, fname);
    }
}
