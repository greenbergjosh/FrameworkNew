using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.CodeProviders
{
    internal interface ICodeProvider
    {
        Func<Request, DictionaryStack, Task<IDictionary<string, object>>> GetEvaluate(IDictionary<string, object> evaluateConfiguration);
    }
}
