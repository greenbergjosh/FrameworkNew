using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;

namespace Utility.GenericEntity
{
    public abstract class GenericEntityBase : IGenericEntity
    {
        public Dictionary<string, object> _state = new Dictionary<string, object>();
        public RoslynWrapper rw;

        public virtual void InitializeEntity(RoslynWrapper rw, object configuration, object data) => throw new NotImplementedException();

        public virtual object this[string path] => throw new NotImplementedException();

        public virtual Dictionary<string, object> State => _state;

        private readonly Dictionary<string, Func<IGenericEntity, Dictionary<string, object>, string, object>> _callbacks =
            new Dictionary<string, Func<IGenericEntity, Dictionary<string, object>, string, object>>();

        public void RegisterNamedCallback(string callbackName, Func<IGenericEntity, Dictionary<string, object>, string, object> callback)
        {
            if (!_callbacks.ContainsKey(callbackName)) _callbacks.Add(callbackName, callback);
        }

        public object Cb(string callbackName, string args)
        {
            _callbacks.TryGetValue(callbackName, out Func<IGenericEntity, Dictionary<string, object>, string, object> cf);
            if (cf != null)
            {
                return cf(this, _state, args);
            }
            return null;
        }

        public virtual IEnumerable<IGenericEntity> GetL(string path) => throw new NotImplementedException();

        public virtual IEnumerable<string> GetLS(string path, bool quoteStrings = false) => throw new NotImplementedException();

        public virtual IGenericEntity GetE(string path) => throw new NotImplementedException();

        public virtual IEnumerable<IGenericEntity> GetEs(string path) => throw new NotImplementedException();

        public virtual IEnumerable<Tuple<string, string>> GetD(string path) => throw new NotImplementedException();

        public virtual IEnumerable<(string key, IGenericEntity entity)> GetDe(string path) => throw new NotImplementedException();

        public abstract bool HasPath(string path);

        public virtual object Get(string path) => this[path];

        public virtual object Run(string fname) => Get(null, fname);

        public virtual object Get(string path, string fname)
        {
            object val = (path == null || path.Length == 0) ? null : Get(path);
            StateWrapper s = new StateWrapper();
            dynamic p = new ExpandoObject();
            p.val = val;
            s.r.geb = this;
            return rw[fname](p, s).Result;
        }

        public virtual object Ext(string extensionClassName, string extensionMethodName, string args)
        {
            var query = from method in Type.GetType(extensionClassName).GetMethods(BindingFlags.Static
                            | BindingFlags.Public | BindingFlags.NonPublic)
                        where method.IsDefined(typeof(ExtensionAttribute), false)
                        where method.GetParameters()[0].ParameterType == typeof(IGenericEntity)
                        where method.Name == extensionMethodName
                        select method;

            MethodInfo extensionMethod = query.First();
            if (extensionMethod != null)
            {
                return extensionMethod.Invoke(null, new object[] { this, _state, args });
            }
            return null;
        }

        public virtual T Get<T>(string path) => (T)Get(path);

        public virtual T Run<T>(string fname) => (T)Run(fname);

        public virtual T Get<T>(string path, string fname) => (T)Get(path, fname);

        public virtual void Set(string path, object value) => throw new NotImplementedException();

        public virtual string GetS(string path, char? quoteChar = null)
        {
            object s = Get(path);
            if (s == null) return null;
            else return $"{quoteChar}{s}{quoteChar}";
        }

        public virtual string RunS(string fname)
        {
            object s = Run(fname);
            if (s == null) return null;
            else return s.ToString();
        }

        public virtual string GetS(string path, string fname)
        {
            object s = Get(path, fname);
            if (s == null) return null;
            return s.ToString();
        }

        public virtual bool GetB(string path)
        {
            object s = Get(path);
            if (s == null) return false;
            if (s is bool b) return b;

            return s.ToString().ParseBool() == true;
        }

        public virtual bool RunB(string fname)
        {
            object s = Run(fname);
            if (s == null) return false;
            if (s.GetType() == typeof(bool)) return (bool)s;
            string sb = s.ToString().ToLower();
            if (sb == "true" || sb == "t" || sb == "y" || sb == "yes" || sb == "1") return true;
            else return false;
        }

        public virtual bool GetB(string path, string fname)
        {
            object s = Get(path, fname);
            if (s == null) return false;
            if (s.GetType() == typeof(bool)) return (bool)s;
            string sb = s.ToString().ToLower();
            if (sb == "true" || sb == "t" || sb == "y" || sb == "yes" || sb == "1") return true;
            else return false;
        }
    }
}
