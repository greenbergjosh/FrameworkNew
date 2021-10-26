using System;
using System.Collections.Generic;
using System.Reflection;
using System.Threading.Tasks;
using Framework.Core.EntityStoreProviders;

namespace Framework.Core
{
    public sealed class Entity
    {
        #region Private Static Fields
        private static readonly IEntityStoreProvider _entityStore = new JsonEntityStoreProvider();

        #endregion

        #region Public Static Methods
        public static async Task<Entity> GetEntity(Guid entityId) => await _entityStore.GetEntity(entityId);
        #endregion

        #region Private Instance Fields
        private readonly IDictionary<string, object> _data;
        #endregion

        #region Constructor
        internal Entity(IDictionary<string, object> data) => _data = data;
        #endregion

        #region Public Instance Methods
        public IDictionary<string, object> Get(string key) => Get<IDictionary<string, object>>(key);

        public IDictionary<string, object> Get(string key, IDictionary<string, object> defaultValue = null) => Get<IDictionary<string, object>>(key, defaultValue);

        public TOutput Get<TOutput>(string key)
        {
            if (!TryGetValue(key, out TOutput value))
                throw new KeyNotFoundException("Key [" + key + "] not found.");
            return value;
        }

        public TOutput Get<TOutput>(string key, TOutput defaultValue)
        {
            if (!TryGetValue(key, out TOutput value))
            {
                value = defaultValue;
            }
            return value;
        }
        #endregion

        #region Private Instance Methods
        private bool TryGetValue<TOutput>(string key, out TOutput value, TOutput defaultValue = default(TOutput))
        {
            value = defaultValue;

            if (_data.TryGetValue(key, out object o))
            {
                value = (TOutput)Get(typeof(TOutput), o);
                return true;
            }

            return false;
        }

        private static object Get(Type type, object value)
        {
            if (value == null)
            {
                if (!type.IsValueType)
                {
                    return null;
                }

                return Activator.CreateInstance(type);
            }

            if (type == typeof(string))
            {
                return value.ToString();
            }

            if (value.GetType() == type || type.IsInstanceOfType(value))
            {
                return value;
            }

            try
            {
                MethodInfo tryParseMethod = type.GetMethod("TryParse", new Type[] { typeof(string), type.MakeByRefType() });
                if (tryParseMethod != null)
                {
                    object[] parameters = { value, null };
                    tryParseMethod.Invoke(null, parameters);
                    return parameters[1];
                }

                return Convert.ChangeType(value, type);
            }
            catch (Exception ex)
            {
                throw new Exception("Couldn't convert [" + value + "] to type: " + type.AssemblyQualifiedName + Environment.NewLine + ex.Message);
            }
        }
        #endregion
    }
}
