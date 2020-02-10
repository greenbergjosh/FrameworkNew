using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace Framework.Core
{
    public class DictionaryStack : IDictionary<string, object>
    {
        #region Fields
        private Stack<IDictionary<string, object>> _data = new Stack<IDictionary<string, object>>();
        #endregion

        #region Properties
        private IDictionary<string, object> Current { get { return _data.Peek(); } }
        #endregion

        #region Constructors
        public DictionaryStack()
        {
        }

        public DictionaryStack(IDictionary<string, object> values)
        {
            Push(values);
        }
        #endregion

        #region Public Methods
        public override string ToString()
        {
            return Print(this, string.Empty, new List<object>());
        }

        public string Print(DictionaryStack ds, string spaces, List<object> done)
        {
            System.Text.StringBuilder sb = new System.Text.StringBuilder();
            done.Add(ds);

            int i = 0;
            foreach (var dictionary in ds._data)
            {
                if (!done.Contains(dictionary))
                {
                    sb.AppendLine(spaces + "Dictionary[" + i + "]"); i++;
                    sb.AppendLine("<br>");
                    if (dictionary is DictionaryStack)
                    {
                        sb.AppendLine(Print((DictionaryStack)dictionary, spaces + "&nbsp;&nbsp;", done));
                        sb.AppendLine("<br>");
                    }
                    else if (dictionary.GetType().IsGenericType && dictionary.GetType().GetGenericTypeDefinition() == typeof(Dictionary<,>))
                    {
                        sb.AppendLine(PrintDictionary(dictionary, spaces + "&nbsp;&nbsp;", done));
                        sb.AppendLine("<br>");
                    }
                }
                else
                {
                    sb.AppendLine("Loop Found");
                    sb.AppendLine("<br>");
                }
            }
            return sb.ToString();
        }

        public string PrintDictionary(IDictionary<string, object> d, string spaces, List<object> done)
        {
            System.Text.StringBuilder sb = new System.Text.StringBuilder();
            done.Add(d);
            foreach (KeyValuePair<string, object> de in d)
            {
                if (!done.Contains(de.Value))
                {
                    if (de.Value is DictionaryStack)
                    {
                        sb.AppendLine(Print((DictionaryStack)de.Value, spaces + "&nbsp;&nbsp;", done));
                        sb.AppendLine("<br>");
                    }
                    else if (de.Value.GetType().IsGenericType && de.Value.GetType().GetGenericTypeDefinition() == typeof(Dictionary<,>))
                    {
                        sb.AppendLine(PrintDictionary((Dictionary<string, object>)de.Value, spaces + "&nbsp;&nbsp;", done));
                        sb.AppendLine("<br>");
                    }
                    else
                    {
                        sb.AppendLine(spaces + "Key: " + de.Key + "   Value: " + de.Value);
                        sb.AppendLine("<br>");
                    }
                }
                else
                {
                    sb.AppendLine("Loop Found, key=" + de.Key);
                    sb.AppendLine("<br>");
                }
            }

            return sb.ToString();
        }

        internal void Push()
        {
            _data.Push(new Dictionary<string, object>());
        }

        internal void Push(IDictionary<string, object> values)
        {
            if (values != this && values != null)
                _data.Push(values ?? new Dictionary<string, object>());
        }

        internal void Pop()
        {
            _data.Pop();
        }
        #endregion

        #region IDictionary<string, object> Implemenation
        public object this[string key]
        {
            get
            {
                foreach (var dictionary in _data)
                {
                    if (dictionary.ContainsKey(key)) return dictionary[key];
                }
                return null;
            }
            set
            {
                Current[key] = value;
            }
        }

        public void Add(string key, object value)
        {
            Current.Add(key, value);
        }

        public bool ContainsKey(string key)
        {
            foreach (var dictionary in _data)
            {
                if (dictionary.ContainsKey(key)) return true;
            }
            return false;
        }

        public ICollection<string> Keys
        {
            get { return _data.SelectMany(d => d.Keys).Distinct().ToList(); }
        }

        public bool Remove(string key)
        {
            throw new NotImplementedException();
        }

        public bool TryGetValue(string key, out object value)
        {
            value = null;

            foreach (var dictionary in _data)
            {
                if (dictionary.TryGetValue(key, out value)) return true;
            }
            return false;
        }

        public ICollection<object> Values
        {
            get { return _data.SelectMany(d => d.Values).Distinct().ToList(); }
        }

        public void Add(KeyValuePair<string, object> item)
        {
            Current.Add(item);
        }

        public void Clear()
        {
            throw new NotImplementedException();
        }

        public bool Contains(KeyValuePair<string, object> item)
        {
            foreach (var dictionary in _data)
            {
                if (dictionary.Contains(item)) return true;
            }
            return false;
        }

        public void CopyTo(KeyValuePair<string, object>[] array, int arrayIndex)
        {
            throw new NotImplementedException();
        }

        public int Count
        {
            get { return _data.SelectMany(d => d.Keys).Distinct().Count(); }
        }

        public bool IsReadOnly
        {
            get { return false; }
        }

        public bool Remove(KeyValuePair<string, object> item)
        {
            throw new NotImplementedException();
        }

        public IEnumerator<KeyValuePair<string, object>> GetEnumerator()
        {
            var keys = Keys;
            foreach (var key in keys)
            {
                yield return new KeyValuePair<string, object>(key, this[key]);
            }
        }

        public IDictionary<string, object> Peek()
        {
            if (_data.Count < 1)
                return null;
            return _data.Peek();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
        #endregion
    }
}