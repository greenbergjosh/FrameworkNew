namespace Framework.Core.Evaluatable.EvalProviders
{
    public interface IEvalProvider
    {
        Task<EvaluateResponse> Evaluate(Entity.Entity providerParameters, EvaluateRequest request);
    }
}
