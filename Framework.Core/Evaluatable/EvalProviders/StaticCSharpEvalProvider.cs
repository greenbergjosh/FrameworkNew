using Framework.Core.Entity;
using System.Reflection;

namespace Framework.Core.Evaluatable.EvalProviders
{
    public static class StaticCSharpEvalProvider
    {
        public static string Name => "StaticCSharp";

        public static async Task<EvaluateResponse> Evaluate(Entity.Entity providerParameters, EvaluateRequest request)
        {
            var typeName = await providerParameters.GetRequiredString("typeName");
            var methodName = await providerParameters.GetRequiredString("methodName");

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

            if (method.Invoke(null, new[] { request }) is not Task<EvaluateResponse> result)
            {
                throw new InvalidOperationException($"Method must return an {nameof(EvaluateResponse)}");
            }

            return await result;
        }
    }
}
