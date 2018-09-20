using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Framework.Core.Languages.E
{
    // This will get moved to dynamic code once it is available
    internal static class IoEvaluatable
    {
        private static async Task<IDictionary<string, object>> Evaluate(Request request, DictionaryStack parameters)
        {
            var context = (HttpContextBase)request["HttpContext"];

            var method = parameters.Get<string>("Method");

            var readMemoryLocation = parameters.Get<Guid>("ReadLocation");
            var writeMemoryLocation = parameters.Get<Guid>("WriteLocation");

            var calls = parameters.Get<dynamic>("Calls");

            var indent = await calls.MemoryGet(readMemoryLocation, "Indent", 0);

            if (method == "Write")
            {
                string message = string.Concat(Enumerable.Repeat("&nbsp;", indent * 2)) + parameters.Get("Message", "");
                var bytes = Encoding.Default.GetBytes(message);
                await context.Response.OutputStream.WriteAsync(bytes, 0, bytes.Length);
                Debug.Write(message);
            }
            else if (method == "WriteLine")
            {
                string message = string.Concat(Enumerable.Repeat("&nbsp;", indent * 2)) + parameters.Get("Message", "") + "<br/>" + Environment.NewLine;
                var bytes = Encoding.Default.GetBytes(message);
                await context.Response.OutputStream.WriteAsync(bytes, 0, bytes.Length);
                Debug.Write(message);
            }
            else if (method == "Indent")
            {
                indent++;
                await calls.MemorySet(writeMemoryLocation, "Indent", indent);
            }
            else if (method == "Unindent")
            {
                indent--;
                await calls.MemorySet(writeMemoryLocation, "Indent", indent);
            }

            return null;
        }
    }
}
