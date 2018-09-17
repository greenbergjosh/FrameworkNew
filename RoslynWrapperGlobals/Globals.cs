using System;
using System.Collections.Generic;
using System.Text;

namespace RoslynWrapperGlobals
{
    public class Globals
    {
        public Stack<StackFrame> st = new Stack<StackFrame>(); // Parms;
        public dynamic p { get { return st.Peek(); } }
        public dynamic s; // StateWrapper
        public dynamic f; // RoslynWrapper
    }
}
