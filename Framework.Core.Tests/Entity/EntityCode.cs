using Framework.Core.Entity;
using Framework.Core.Evaluatable;

namespace Framework.Core.Tests.Entity
{
    internal static class EntityCode
    {
        public static Task<EvaluateResponse> Return42(EvaluateRequest evaluateRequest)
        {
            return Task.FromResult(new EvaluateResponse(true, evaluateRequest.Parameters.Create(42)));
        }

        public static async Task<EvaluateResponse> PlusOne(EvaluateRequest evaluateRequest)
        {
            var param1 = await evaluateRequest.Parameters.GetRequiredProperty("param1", evaluateRequest.Parameters);
            return new EvaluateResponse(true, param1.Value<int>() + 1);
        }

        public static async Task<EvaluateResponse> ApplyParam1ToParam2(EvaluateRequest evaluateRequest)
        {
            var param1 = await evaluateRequest.Parameters.GetRequiredProperty("param1", evaluateRequest.Parameters);

            var param2 = await evaluateRequest.Parameters.GetRequiredProperty("param2", evaluateRequest.Parameters.Create(new
            {
                param1
            }));

            return new EvaluateResponse(true, param2);
        }

        public static async Task<EvaluateResponse> ApplyParam1ToQuotedParam2(EvaluateRequest evaluateRequest)
        {
            var param1 = await evaluateRequest.Parameters.GetRequiredProperty("param1", evaluateRequest.Parameters);

            var param2 = await evaluateRequest.Parameters.GetRequiredProperty("param2", evaluateRequest.Parameters);

            var result = await param2.Evaluate(param1.Create(new
            {
                param1
            }));

            return result;
        }

        public static async Task<EvaluateResponse> Sum(EvaluateRequest evaluateRequest)
        {
            var left = await evaluateRequest.Parameters.GetRequired<int>("left", evaluateRequest.Parameters);
            var right = await evaluateRequest.Parameters.GetRequired<int>("right", evaluateRequest.Parameters);

            var sum = left + right;

            return new EvaluateResponse(true, evaluateRequest.Parameters.Create(sum));
        }

        public static async Task<EvaluateResponse> LinearEquation(EvaluateRequest evaluateRequest)
        {
            var m = await evaluateRequest.Parameters.GetRequired<int>("m", evaluateRequest.Parameters);
            var x = await evaluateRequest.Parameters.GetRequired<int>("x", evaluateRequest.Parameters);
            var b = await evaluateRequest.Parameters.GetRequired<int>("b", evaluateRequest.Parameters);

            var y = (m * x) + b;

            return new EvaluateResponse(true, evaluateRequest.Parameters.Create(y));
        }
    }
}
