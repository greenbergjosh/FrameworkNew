using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    public static class DecoratorEvaluatable
    {
        public static async Task<object> Evaluate(IGenericEntity s)
        {
            var evaluatables = s.GetL(Keywords.Evaluatables);

            await PreBehavior(s, evaluatables);

            var primaryEntityId = s.Get<Guid>(Keywords.PrimaryEntityId);
            var result = (IDictionary<string, object>)await Trampoline.Evaluate(s, primaryEntityId);

            await PostBehavior(s, evaluatables, result);

            return result;
        }

        public static async Task PreBehavior(IGenericEntity s, IEnumerable<IGenericEntity> evaluatables)
        {
            var introducedParameters = new Dictionary<string, object>();
            var decorationParameters = new Dictionary<string, object>()
            {
                [Keywords.DecorationStage] = Keywords.Pre
            };

            await EvaluateDecorations(s, evaluatables, decorationParameters, introducedParameters);
            foreach (var parameter in introducedParameters)
                s.Set(parameter.Key, parameter.Value);
        }

        public static async Task PostBehavior(IGenericEntity s, IEnumerable<IGenericEntity> evaluatables, 
            IDictionary<string, object> result)
        {
            var repeatAndReverseOnPost = s.Get(Keywords.RepeatAndReverseOnPost, false);
            if (repeatAndReverseOnPost)
            {
                var introducedParameters = new Dictionary<string, object>();
                var decorationParameters = new Dictionary<string, object>()
                {
                    [Keywords.DecorationStage] = Keywords.Post,
                    [Keywords.CompositeReturn] = result
                };
                
                await EvaluateDecorations(s, evaluatables.Reverse(), decorationParameters, introducedParameters);
                foreach (var parameter in introducedParameters)
                    result[parameter.Key] = parameter.Value;
            }
        }

        public static async Task EvaluateDecorations(IGenericEntity s, IEnumerable<IGenericEntity> evaluatables,
            IDictionary<string, object> decorationParameters, IDictionary<string, object> introducedParameters)
        {
            foreach (var evaluatable in evaluatables)
            {
                evaluatable.TryGetValue(Keywords.Memory, out var memory, Keywords.Stack);
                var result = (IDictionary<string, object>)await Trampoline.Evaluate(memory, s, evaluatable, decorationParameters);
                foreach (var kv in result.Get<IDictionary<string, object>>(Keywords.IntroducedParameters))
                    introducedParameters[kv.Key] = kv.Value;
            }
        }
    }
}
