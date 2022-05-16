using System;
using System.Reflection;
using System.Threading.Tasks;

namespace Utility.Evaluatable.CodeProviders
{
    internal class StaticCSharpEvalProvider : IEvalProvider
    {
        public async Task<EvaluateResponse> Evaluate(EvaluateRequest request)
        {
            var typeName = await request.Entity.EvalS("$evaluate.typeName");
            var methodName = await request.Entity.EvalS("$evaluate.methodName");

            var type = Type.GetType(typeName);
            if (type == null)
            {
                throw new InvalidOperationException($"Can not find type `{typeName}`");
            }

            var method = type.GetMethod(methodName, BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic);
            if (method == null)
            {
                throw new InvalidOperationException($"Can not find method `{methodName}` on type `{typeName}`");
            }

            return await (Task<EvaluateResponse>)method.Invoke(null, new[] { request });
        }
    }
}
