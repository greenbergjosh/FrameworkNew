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
        /*
     * The scheme:
     *   1. Entity location
     *   2. Entity handler
     */
        /*
             * var p1 = c("rqst://parameters?param1");
             * var p2 = c("rqst://parameters?param2");
             * return p2(p1);
             */
        // This is the actual strategy of the 'apply' evaluatable
        // It's expression should be as close to param2(param1) as possible
        // Using https://stackoverflow.com/questions/2450153/overloading-function-call-operator-in-c-sharp
        //  it should be possible to make Entity support a delegate that syntactically looks like overloading ()
        public static async Task<EvaluateResponse> ApplyParam2ToParam1(dynamic c)
        {
            //var p1 = await c("param1");
            //var p2 = await c("param2");
            //var p1 = await c["param1"];
            //var p2 = await c["param2"];
            var p1 = c["param1"];
            var p2 = c["param2"];
            return await p2(new { param1=p1 });
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

        //public static async Task<EvaluateResponse> Sum(EvaluateRequest evaluateRequest)
        //{
        //    var left = await evaluateRequest.Parameters.GetRequired<int>("left", evaluateRequest.Parameters);
        //    var right = await evaluateRequest.Parameters.GetRequired<int>("right", evaluateRequest.Parameters);

        //    var sum = left + right;

        //    return new EvaluateResponse(true, evaluateRequest.Parameters.Create(sum));
        //}

        //public static async Task<EvaluateResponse> Sum(dynamic c)
        //{
        //    //var left = (await c["left"]).Value<int>();
        //    //var right = (await c["right"]).Value<int>();

        //    var left = c["left"].Value<int>();
        //    var right = c["right"].Value<int>();

        //    var sum = left + right;

        //    return new EvaluateResponse(true, c.Parameters.Create(sum));
        //}

        public static async Task<EvaluateResponse> Sum(int left, int right, dynamic c)
        {
            var sum = left + right;

            return new EvaluateResponse(true, c.Parameters.Create(sum));
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
