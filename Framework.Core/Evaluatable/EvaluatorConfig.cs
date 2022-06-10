using Framework.Core.Evaluatable.MemoryProviders;

namespace Framework.Core.Evaluatable
{
    public class EvaluatorConfig
    {
        public IDictionary<string, EvalProvider> EvalProviders { get; init; }

        public IMemoryProvider MemoryProvider { get; init; }

        public EvaluatorConfig(IMemoryProvider memoryProvider, IDictionary<string, EvalProvider> evalProviders)
        {
            MemoryProvider = memoryProvider;
            EvalProviders = evalProviders;
        }
    }
}
