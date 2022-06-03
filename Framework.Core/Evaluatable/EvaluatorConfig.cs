using Framework.Core.Evaluatable.EvalProviders;
using Framework.Core.Evaluatable.MemoryProviders;

namespace Framework.Core.Evaluatable
{
    public class EvaluatorConfig
    {
        public IDictionary<string, IEvalProvider> EvalProviders { get; init; }

        public IMemoryProvider MemoryProvider { get; init; }

        public EvaluatorConfig(IMemoryProvider memoryProvider, IDictionary<string, IEvalProvider> evalProviders)
        {
            MemoryProvider = memoryProvider;
            EvalProviders = evalProviders;
        }
    }
}
