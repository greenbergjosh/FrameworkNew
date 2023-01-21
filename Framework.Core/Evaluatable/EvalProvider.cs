namespace Framework.Core.Evaluatable
{   // Is this just evaluate
    public delegate Task<EvaluateResponse> EvalProvider(Entity.Entity providerParameters, EvaluateRequest request);
}
