using System.Collections.Generic;

namespace Utility
{
    public class Globals
    {
        public Stack<StackFrame> st = new Stack<StackFrame>(); // Parms;
        public dynamic p => st.Peek();
        public dynamic s; // StateWrapper
        public dynamic f; // RoslynWrapper
    }
}
