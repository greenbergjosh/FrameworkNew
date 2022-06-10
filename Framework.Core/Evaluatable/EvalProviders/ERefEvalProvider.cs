using Framework.Core.Entity;

namespace Framework.Core.Evaluatable.EvalProviders
{
    public static class ERefEvalProvider
    {
        public static string Name => "ERef";

        public static async Task<EvaluateResponse> Evaluate(Entity.Entity providerParameters, EvaluateRequest request)
        {
            var url = await providerParameters.GetRequiredString("url", request.Parameters);

            if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
            {
                throw new InvalidOperationException("`url` must be a valid URI");
            }

            var resolvedEntity = await providerParameters.ResolveEntity(uri);

            var quoted = await providerParameters.GetOrDefault<bool>("quoted");
            if (quoted)
            {
                return new EvaluateResponse(true, resolvedEntity);
            }

            return await resolvedEntity.Evaluate(request.Parameters);
        }
    }
}
