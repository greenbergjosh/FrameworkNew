namespace Framework.Core.Evaluatable
{
    public delegate Task<EvaluateResponse> EvalProvider(Entity.Entity providerParameters, EvaluateRequest request);
}
