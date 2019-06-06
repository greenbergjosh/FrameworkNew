using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    // This will get moved to dynamic code once it is available
    internal static class CallsDecoration
    {
        public delegate Task<object> EvaluateDelegate(params object[] args);

        private static async Task<IDictionary<string, object>> Evaluate(Request request, DictionaryStack parameters)
        {
            return await CreateCalls(request, parameters);
        }

        private static async Task<IDictionary<string, object>> CreateCalls(Request request, DictionaryStack parameters)
        {
            var targetEntityId = parameters.Get<Guid>("TargetEntityId");
            var targetEntity = await Entity.GetEntity(targetEntityId);

            dynamic calls = new ExpandoObject();

            var code = targetEntity.Get("Master");
            var callsConfiguration = code.GetList("Calls");
            foreach (var call in callsConfiguration)
            {
                var callName = call.Get<string>("Name");
                ((IDictionary<string, object>)calls)[callName] = (EvaluateDelegate)((args) => EvaluateCall(call, request, args));
            }

            var introducedParameters = parameters.Get("IntroducedParameters");
            introducedParameters["Calls"] = calls;

            return null;
        }

        private static async Task<object> EvaluateCall(IDictionary<string, object> call, Request request, params object[] args)
        {
            var callerParameters = call.Get("Parameters", new Dictionary<string, object>());

            var entityId = call.Get<Guid>("EntityId");
            var targetEntity = await Entity.GetEntity(entityId);
            var codeEntityId = targetEntity.Get("Master").Get("Evaluate").Get("EntityId", Guid.Empty);
            // TODO: Find a better way to do this!!!
            if (codeEntityId == GuidHelper.FromInt(5) || codeEntityId == GuidHelper.FromInt(2) || codeEntityId == GuidHelper.FromInt(14))
            {
                var targetEntityId = targetEntity.Get("Parameters").Get<Guid>("PrimaryEntityId");
                targetEntity = await Entity.GetEntity(targetEntityId);
            }

            var evaluateParameters = new DictionaryStack();
            evaluateParameters.Push();
            int parameterCount = 0;

            var evaluate = targetEntity.Get("Master").Get("Evaluate");

            foreach (var targetParameter in targetEntity.Get("Master").Get("Evaluate").GetList("Parameters"))
            {
                var parameterName = targetParameter.Get<string>("Name");
                var matchedCallerParameter = callerParameters.SingleOrDefault(p => p.Key == parameterName);
                if (!matchedCallerParameter.Equals(default(KeyValuePair<string, object>)))
                {
                    evaluateParameters.Add(parameterName, matchedCallerParameter.Value);
                }
                else
                {
                    var isValid = IsValid(targetParameter, evaluateParameters);
                    var isRequired = IsRequired(targetParameter, evaluateParameters);
                    if (!isValid && !isRequired)
                        continue;

                    if (isRequired && args.Length <= parameterCount)
                        throw new InvalidOperationException("Missing required parameter [" + parameterName + "]");

                    if (args.Length > parameterCount)
                    {
                        evaluateParameters.Add(parameterName, args[parameterCount]);
                        parameterCount++;
                    }
                    else
                    {
                        break;
                    }
                }
            }

            var evaluateResult = await Evaluator.Evaluate(entityId, request, evaluateParameters);
            var returnValues = targetEntity.Get("Master").Get("Evaluate").GetList("ReturnValues", null);
            if (returnValues != null)
            {
                foreach (var returnValue in returnValues)
                {
                    if (IsValid(returnValue, evaluateParameters))
                    {
                        var returnValueName = returnValue.Get<string>("Name");
                        return evaluateResult[returnValueName];
                    }
                }
            }

            return evaluateResult;
        }

        private static bool IsValid(IDictionary<string, object> parameter, DictionaryStack evaluateParameters)
        {
            var validWhen = parameter.Get<List<IDictionary<string, object>>>("ValidWhen", null);

            if (validWhen == null)
            {
                var requiredWhen = parameter.GetList("RequiredWhen", null);
                if (requiredWhen == null)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }

            return ParameterMatch(validWhen, evaluateParameters);
        }

        private static bool IsRequired(IDictionary<string, object> parameter, DictionaryStack evaluateParameters)
        {
            if (parameter.Get("Required", false))
            {
                return true;
            }

            var requiredWhen = parameter.GetList("RequiredWhen", null);
            if (requiredWhen != null)
            {
                return ParameterMatch(requiredWhen, evaluateParameters);
            }

            return false;
        }

        private static bool ParameterMatch(IList<IDictionary<string, object>> matchRule, DictionaryStack parameters)
        {
            foreach (var matchedParameter in matchRule)
            {
                var matchedParameterName = matchedParameter.Get<string>("Name");
                var matchedValues = matchedParameter.Get<IList<string>>("MatchValues");

                var parameterValue = parameters.Get<string>(matchedParameterName, null);
                if (matchedValues.Contains(parameterValue))
                {
                    return true;
                }
            }

            return false;
        }
    }
}
