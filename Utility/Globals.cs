using System.Collections.Generic;

namespace Utility
{
    public class Globals
    {
        public Stack<StackFrame> st = new(); // Parms;
#pragma warning disable IDE1006 // Naming Styles
        public dynamic p => st.Peek();
#pragma warning restore IDE1006 // Naming Styles
    }
}
