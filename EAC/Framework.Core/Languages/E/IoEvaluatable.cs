using System;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    public static class IoEvaluatable
    {
        public static async Task<object> Evaluate(IGenericEntity s)
        {
            var method = s.GetS(Keywords.Method);

            var readMemoryLocation = s.Get(Keywords.ReadLocation, Guid.Empty);
            var writeMemoryLocation = s.Get(Keywords.WriteLocation, Guid.Empty);

            var indent = (int)await s.Run(Keywords.MemoryGet, readMemoryLocation, Keywords.Indent, 0);

            if (method == Keywords.Write)
            {
                var message = string.Concat(Enumerable.Repeat(" ", indent * 2)) + 
                    s.Get(Keywords.Message, string.Empty);
                // TODO: Pass dependency to deal with different outputs. i.e: LogStash, NLog
                //await context.Response.WriteAsync(message);
                Debug.Write(message);
            }
            else if (method == Keywords.WriteLine)
            {
                var message = string.Concat(Enumerable.Repeat(" ", indent * 2)) + 
                    s.Get(Keywords.Message, string.Empty) + 
                    Environment.NewLine;
                // TODO: Pass dependency to deal with different outputs and formats. i.e: LogStash, NLog
                //await context.Response.WriteAsync(message);
                Debug.Write(message);
            }
            else if (method == Keywords.Indent)
            {
                indent++;
                await s.Run(Keywords.MemorySet, writeMemoryLocation, Keywords.Indent, indent);
            }
            else if (method == Keywords.Unindent)
            {
                indent--;
                await s.Run(Keywords.MemorySet, writeMemoryLocation, Keywords.Indent, indent);
            }

            return null;
        }
    }
}
