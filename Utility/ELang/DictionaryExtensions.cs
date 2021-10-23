using System;
using System.Collections.Generic;
using System.Reflection;

namespace Framework.Core
{
    public static class DictionaryExtensions
    {
        public static IDictionary<string, object> Get(this IDictionary<string, object> dictionary, string key) => dictionary.Get<IDictionary<string, object>>(key);

        public static IDictionary<string, object> Get(this IDictionary<string, object> dictionary, string key, IDictionary<string, object> defaultValue = null) => dictionary.Get<IDictionary<string, object>>(key, defaultValue);

        public static IList<IDictionary<string, object>> GetList(this IDictionary<string, object> dictionary, string key, IList<IDictionary<string, object>> defaultValue = null) => dictionary.Get(key, defaultValue);

        public static TOutput Get<TOutput>(this IDictionary<string, object> dictionary, string key) => dictionary.Get<object, TOutput>(key);

        public static TOutput Get<TOutput>(this IDictionary<string, object> dictionary, string key, TOutput defaultValue) => dictionary.Get<object, TOutput>(key, defaultValue);

        public static TOutput Get<TValue, TOutput>(this IDictionary<string, TValue> dictionary, string key)
        {
            if (!TryGetValue(dictionary, key, out TOutput value))
                throw new KeyNotFoundException("Key [" + key + "] not found.");
            return value;
        }

        public static TOutput Get<TValue, TOutput>(this IDictionary<string, TValue> dictionary, string key, TOutput defaultValue)
        {
            TryGetValue(dictionary, key, out TOutput value, defaultValue);
            return value;
        }

        private static bool TryGetValue<TValue, TOutput>(IDictionary<string, TValue> dictionary, string key, out TOutput value, TOutput defaultValue = default(TOutput))
        {
            value = defaultValue;
            if (dictionary == null)
                return false;

            if (dictionary.TryGetValue(key, out TValue o))
            {
                value = (TOutput)Get(typeof(TOutput), o);
                return true;
            }

            return false;
        }

        public static TOutput Get<TOutput>(this IReadOnlyDictionary<string, object> dictionary, string key)
        {
            if (!TryGetValue(dictionary, key, out TOutput value))
                throw new KeyNotFoundException("Key [" + key + "] not found.");
            return value;
        }

        public static TOutput Get<TOutput>(this IReadOnlyDictionary<string, object> dictionary, string key, TOutput defaultValue)
        {
            TryGetValue(dictionary, key, out TOutput value, defaultValue);
            return value;
        }

        public static bool TryGetValue<TOutput>(this IReadOnlyDictionary<string, object> dictionary, string key, out TOutput value, TOutput defaultValue = default(TOutput))
        {
            value = defaultValue;
            if (dictionary == null)
                return false;

            if (dictionary.TryGetValue(key, out object o))
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
    }
}
