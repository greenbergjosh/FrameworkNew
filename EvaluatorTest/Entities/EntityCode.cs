using Utility.Evaluatable;

namespace EvaluatorTest.Entities
{
    public class EntityCode
    {
        public static async Task<EvaluateResponse> HelloWorld(EvaluateRequest request)
        {
            var httpResponse = await request.Entity.Eval<HttpResponse>("object://httpContext/Response");
            await httpResponse.WriteAsync("Hello World from Static Entity!");
            return new EvaluateResponse(Complete: true);
        }

        public static async Task<EvaluateResponse> TopLevelWebHandler(EvaluateRequest request)
        {
            var httpContext = await request.Entity.Eval<HttpContext>("object://httpContext");

            var (entityId, writeResult) = httpContext.Request.Path.ToString() switch
            {
                "/hellostatic" => (Guid.Parse("903ddbdf-8198-46f3-972c-66a0ce4b624f"), false),
                "/hellodynamic" => (Guid.Parse("0086226a-d81d-4c74-983d-24f232eba731"), false),
                "/double4" => (Guid.Parse("3ca6a814-db89-4310-8302-eef2ba450ea8"), true),
                _ => (Guid.Parse("7cf50701-a305-4fd5-a203-3f3dba9ccab0"), true)
            };

            var result = await request.Entity.Eval($"config://{entityId}").ToList();
            if (writeResult)
            {
                var httpResponse = await request.Entity.Eval<HttpResponse>("object://httpContext/Response");

                await httpResponse.WriteAsJsonAsync(result);
            }

            return new EvaluateResponse(true, result.FirstOrDefault());
        }

        public static async Task<EvaluateResponse> Double(EvaluateRequest request)
        {
            var number = await request.Parameters.EvalI("number");
            return new EvaluateResponse(true, number * 2, true);
        }
    }
}
