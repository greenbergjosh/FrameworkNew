using System;
using System.Collections;
using System.Collections.Generic;
using System.Dynamic;

namespace Utility
{
    public class StackFrame : System.Dynamic.DynamicObject, IEnumerable<KeyValuePair<string, object>>
    {
        private readonly ExpandoObject sf = new();

        public void Add(string s, object o) => ((IDictionary<string, object>)sf).Add(s, o);

        IEnumerator<KeyValuePair<string, object>> IEnumerable<KeyValuePair<string, object>>.GetEnumerator() => ((IDictionary<string, object>)sf).GetEnumerator();

        public IEnumerator GetEnumerator() => GetEnumerator();

        public static StackFrame CreateStackFrame(object o)
        {
            var sf = new StackFrame();
            if (o == null)
            {
                throw new ArgumentNullException(nameof(o));
            }

            if (o is IDictionary<string, object> d)
            {
                foreach (var (key, value) in d)
                {
                    sf.Add(key, value);
                }
            }
            else
            {
                var t = o.GetType();
                foreach (var pi in t.GetProperties())
                {
                    sf.Add(pi.Name, pi.GetValue(o));
                }
            }
            
            return sf;
        }

        public override bool TryGetMember(GetMemberBinder binder, out object result)
        {
            if (((IDictionary<string, object>)sf).ContainsKey(binder.Name))
            {
                result = ((IDictionary<string, object>)sf)[binder.Name];
                return true;
            }

            return base.TryGetMember(binder, out result);
        }
    }
}
