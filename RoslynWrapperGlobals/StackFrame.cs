using System;
using System.Collections;
using System.Collections.Generic;
using System.Dynamic;
using System.Reflection;

namespace RoslynWrapperGlobals
{
    public class StackFrame : System.Dynamic.DynamicObject, IEnumerable<KeyValuePair<string, object>>
    {
        ExpandoObject sf = new ExpandoObject();

        public void Add(string s, object o)
        {
            ((IDictionary<String, Object>)sf).Add(s, o);
        }

        IEnumerator<KeyValuePair<string, object>> IEnumerable<KeyValuePair<string, object>>.GetEnumerator()
        {
            return ((IDictionary<String, Object>)sf).GetEnumerator();
        }

        public IEnumerator GetEnumerator()
        {
            return GetEnumerator();
        }

        public static StackFrame CreateStackFrame(object o)
        {
            StackFrame sf = new StackFrame();
            if (o == null)
            {
                throw new ArgumentNullException();
            }
            var t = o.GetType();
            foreach (PropertyInfo pi in t.GetProperties())
            {
                sf.Add(pi.Name, pi.GetValue(o));
            }
            return sf;
        }

        public override bool TryGetMember(GetMemberBinder binder, out object result)
        {
            if (((IDictionary<String, Object>)sf).ContainsKey(binder.Name))
            {
                result = ((IDictionary<String, Object>)sf)[binder.Name];
                return true;
            }
            return base.TryGetMember(binder, out result);
        }
    }
}
