using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Utility
{
    public class Globals
    {
        public Stack<StackFrame> st = new Stack<StackFrame>(); // Parms;
        public dynamic p { get { return st.Peek(); } }
        public dynamic s; // StateWrapper
        public dynamic f; // RoslynWrapper
    }
}
