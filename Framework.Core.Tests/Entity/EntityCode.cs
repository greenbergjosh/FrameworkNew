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
            var (found, param1) = await evaluateRequest.Parameters.TryGetProperty("param1", evaluateRequest.Parameters);
            if (found)
            {
                return new EvaluateResponse(true, param1.Value<int>() + 1);
            }
            else
            {
                return new EvaluateResponse(false, Core.Entity.Entity.Undefined);
            }
        }

        public static async Task<EvaluateResponse> ApplyParam1ToParam2(EvaluateRequest evaluateRequest)
        {
            var (param1Found, param1) = await evaluateRequest.Parameters.TryGetProperty("param1", evaluateRequest.Parameters);
            if (!param1Found)
            {
                throw new InvalidOperationException("`param1` is required");
            }

            var (param2Found, param2) = await evaluateRequest.Parameters.TryGetProperty("param2", evaluateRequest.Parameters.Create(new
            {
                param1
            }));

            if (param2Found)
            {
                return new EvaluateResponse(true, param2);
            }
            else
            {
                return new EvaluateResponse(false, Core.Entity.Entity.Undefined);
            }
        }

        public static async Task<EvaluateResponse> ApplyParam1ToQuotedParam2(EvaluateRequest evaluateRequest)
        {
            var (param1Found, param1) = await evaluateRequest.Parameters.TryGetProperty("param1", evaluateRequest.Parameters);
            if (!param1Found)
            {
                throw new InvalidOperationException("`param1` is required");
            }

            var (param2Found, param2) = await evaluateRequest.Parameters.TryGetProperty("param2", evaluateRequest.Parameters);
            if (!param2Found)
            {
                throw new InvalidOperationException("`param2` is required");
            }

            var result = await param2.Evaluate(param1.Create(new
            {
                param1
            }));

            return result;
        }
    }
}
