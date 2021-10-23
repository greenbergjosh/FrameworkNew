using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;

namespace Framework.Core.CodeProviders
{
    internal class CSharpCodeProvider : ICodeProvider
    {
        private static readonly ConcurrentDictionary<string, Func<Request, DictionaryStack, Task<IDictionary<string, object>>>> _cache = new ConcurrentDictionary<string, Func<Request, DictionaryStack, Task<IDictionary<string, object>>>>();

        public Func<Request, DictionaryStack, Task<IDictionary<string, object>>> GetEvaluate(IDictionary<string, object> evaluateConfiguration) => _cache.GetOrAdd(evaluateConfiguration.Get<string>("Implementation"), _ =>
                                                                                                                                                             {
                                                                                                                                                                 var implementation = evaluateConfiguration.Get<string>("Implementation");
                                                                                                                                                                 string[] values = implementation.Split(',').Select(s => s.Trim()).ToArray();

                                                                                                                                                                 Type functionContainerType = Type.GetType(values[0]);
                                                                                                                                                                 if (functionContainerType == null)
                                                                                                                                                                     throw new ArgumentException(string.Format("Can not find type [{0}]", values[0]));

                                                                                                                                                                 MethodInfo methodInfo = functionContainerType.GetMethod(values[1], BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic);
                                                                                                                                                                 if (methodInfo == null)
                                                                                                                                                                     throw new ArgumentException(string.Format("Can not find method [{0}] on type [{1}]", values[1], values[0]));

                                                                                                                                                                 var request = Expression.Parameter(typeof(Request), "request");
                                                                                                                                                                 var parameters = Expression.Parameter(typeof(DictionaryStack), "parameters");

                                                                                                                                                                 var expression = Expression.Lambda<Func<Request, DictionaryStack, Task<IDictionary<string, object>>>>(Expression.Call(methodInfo, request, parameters), request, parameters);

                                                                                                                                                                 var result = expression.Compile();
                                                                                                                                                                 return result;
                                                                                                                                                             });
    }
}
