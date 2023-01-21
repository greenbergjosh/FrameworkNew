using Framework.Core.Entity;
using System.Reflection;
using System.Xml.Linq;

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

            // Trying to inject arguments into typed method declarations
            var parameters = new object[method.GetParameters().Length];
            parameters[method.GetParameters().Length - 1] = request;
            if (method.GetParameters().Length > 1)
            {
                for (int i = 0; i < method.GetParameters().Length-1; i++)
                {
                    dynamic p = request[method.GetParameters()[i].Name];

                    MethodInfo[]? methods = p.GetType().GetMethods();
                    var gmethod = methods.Single(mi => mi.Name == "Value" && mi.GetParameters().Count() == 0);

                    var x = gmethod.MakeGenericMethod(new Type[] { method.GetParameters()[i].ParameterType })
                          .Invoke(p, new object[] { });

                    parameters[i] = x;
                }
            }

            // End injection

            if (method.Invoke(null, parameters) is not Task<EvaluateResponse> result)
            {
                throw new InvalidOperationException($"Method must return an {nameof(EvaluateResponse)}");
            }

            return await result;
        }
    }
}
