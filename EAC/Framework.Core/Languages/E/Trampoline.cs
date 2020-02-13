using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    public static class Trampoline
    {
        public static async Task<object> Evaluate(IGenericEntity s, Guid entityId,
            IDictionary<string, object> parameters = null)
        {
            var entity = await Store.GetEntity(entityId);
            return await Evaluate(Keywords.Join, s, entity, parameters);
        }

        public static async Task<object> Evaluate(string memory, IGenericEntity s,
            IGenericEntity entity, IDictionary<string, object> parameters = null)
        {
            var completed = false;
            Guid entityId;
            IDictionary<string, object> result = null;
            var entityStack = new Stack<(string memory, IGenericEntity entity, Guid previousCellId)>();

            while (!completed)
            {
                var previousCellId = PreDecorateStack(memory, entity, s, parameters);

                result = (await EvaluateEntity(entity, s)) as IDictionary<string, object>;
                entityStack.Push((memory, entity, previousCellId));

                parameters = null;

                if (result != null)
                {
                    entityId = result.Get(Keywords.CallThis, Guid.Empty);
                    completed = result.Get(Keywords.Completed, false);
                    if (result.ContainsKey(Keywords.Completed))
                        result.Remove(Keywords.Completed);
                    memory = result.Get(Keywords.Memory, Keywords.Stack);
                }
                else
                {
                    entityId = Guid.Empty;
                    completed = true;
                }

                if (entityId == Guid.Empty)
                    break;

                entity = await Store.GetEntity(entityId);
            }

            while (entityStack.Count > 0)
            {
                var (m, e, previousCellId) = entityStack.Pop();
                if (previousCellId != Guid.Empty)
                    result[Keywords.PreviousContinuationPointer] = previousCellId;
                PostDecorateStack(m, e, s, result);
            }

            return result;
        }

        private static async Task<object> EvaluateEntity(IGenericEntity entity, IGenericEntity s)
        {
            IGenericEntity contract = null;
            var contractId = entity.Get(Keywords.Contract, Guid.Empty);
            if (contractId != Guid.Empty)
                contract = await Store.GetContract(contractId);

            ApplyInputsMap(entity, s);
            await EvaluateParameters(entity, s);
            ValidateInputs(contract, s);

            await AddServices(entity, s);
            await AddCalls(entity, s);

            var outputs = await Run(entity, s);

            ApplyOutputsMap(entity, outputs, outputs);
            ValidateOutputs(contract, s, outputs);

            return outputs;
        }

        private static Guid PreDecorateStack(string memory, IGenericEntity entity, IGenericEntity s,
            IDictionary<string, object> parameters)
        {
            Guid previousCellId = Guid.Empty;
            var state = (State)s;
            var hasId = entity.TryGetValue("Id", out object _);

            state.PushStackFrame(parameters);

            if (!hasId || memory == Keywords.Join)
                return previousCellId;

            if (memory == Keywords.Grid)
            {
                var (cp, previous) = GridDecoration.PreBehavior(s);

                var entityName = entity.GetS("Name");
                Debug.WriteLine($"{entityName} Pre Grid CP: {cp}");

                previousCellId = previous;
                s.Set(Keywords.CellId, cp);

                var cells = new List<IDictionary<string, object>>();
                while (cp != Guid.Empty)
                {
                    var cell = (IDictionary<string, object>)state.Memory[cp];
                    cells.Add(cell);
                    cp = cell.Get<Guid>(Keywords.PreviousCellId);
                }
                cells.Reverse();
                var hs = new DictionaryStack();
                foreach (var cell in cells)
                    hs.Push((IDictionary<string, object>)cell[Keywords.Memory]);

                state.PushContext(hs);
                state.PushStackFrame(hs);
            }
            else if (memory == Keywords.Stack)
            {
                var entityName = entity.GetS("Name");

                Guid cp;
                if (state.Context != null)
                    cp = state.Context.Get(Keywords.ContinuationPointer, Guid.Empty);
                else
                    cp = state.Get(Keywords.ContinuationPointer, Guid.Empty);

                if (cp == Guid.Empty)
                {
                    cp = Guid.NewGuid();
                    state.Memory[cp] = new Dictionary<string, object>();
                }
                s.Set(Keywords.StackFrameId, cp);

                Debug.WriteLine($"{entityName} Pre Stack CP: {cp}");

                var c = (IDictionary<string, object>)state.Memory[cp];
                state.PushContext(c);
                state.PushStackFrame(c);
            }
            else
            {
                throw new ArgumentException(memory, nameof(memory));
            }

            return previousCellId;
        }

        private static void PostDecorateStack(string memory, IGenericEntity entity, IGenericEntity s,
            IDictionary<string, object> outputs)
        {
            var state = (State)s;

            var hasId = entity.TryGetValue("Id", out object _);

            if (hasId && memory != Keywords.Join)
            {
                Guid g = Guid.NewGuid();
                state.PopContext();
                var context = state.Context;

                if (memory == Keywords.Grid)
                {
                    var entityName = entity.GetS("Name");
                    Debug.WriteLine($"{entityName} Post Grid CP: {g}");

                    GridDecoration.PostBehavior(s, outputs);
                    var completed = outputs.Get(Keywords.Completed, false);
                    g = outputs.Get(Keywords.ContinuationPointer, Guid.Empty);

                    var cellId = s.Get<Guid>(Keywords.CellId);
                    state.Results[cellId] = outputs;

                    if (context != null)
                    {
                        context[Keywords.ContinuationPointer] = !completed
                            ? g
                            : Guid.Empty;
                    }

                    state.PopStackFrame();
                }
                else if (memory == Keywords.Stack)
                {
                    var entityName = entity.GetS("Name");
                    Debug.WriteLine($"{entityName} Post Stack CP: {g}");

                    var completed = outputs.Get(Keywords.Completed, false);
                    g = s.Get<Guid>(Keywords.StackFrameId);
                    state.Results[g] = outputs;
                    g = !completed
                        ? g
                        : Guid.Empty;

                    outputs[Keywords.ContinuationPointer] = g;

                    if (context != null)
                        context[Keywords.ContinuationPointer] = g;

                    state.PopStackFrame();
                }
                else
                {
                    throw new ArgumentException(memory, nameof(memory));
                }
            }

            state.PopStackFrame();
        }

        private static async Task AddServices(IGenericEntity entity, IGenericEntity s)
        {
            foreach (var service in entity.GetL(Keywords.Services))
            {
                var contractId = service.Get<Guid>(Keywords.Contract);
                var serviceEntityId = service.Get<Guid>(Keywords.Implementation);
                var serviceEntity = await Store.GetEntity(serviceEntityId);
                ((State)s).AddService(contractId, serviceEntity);
            }
        }

        private static async Task AddCalls(IGenericEntity entity, IGenericEntity s)
        {
            foreach (var call in entity.GetL(Keywords.Calls))
            {
                var name = call.Get<string>(Keywords.Name);
                var contractId = call.Get<Guid>(Keywords.Contract);
                var parameters = call.Get<IDictionary<string, object>>(Keywords.Parameters);
                await ((State)s).AddCall(name, contractId, parameters);
            }
        }

        private static async Task EvaluateParameters(IGenericEntity entity, IGenericEntity s)
        {
            var evaluate = entity.GetE(Keywords.Evaluate, null);
            if (evaluate == null)
                return;

            foreach (var kv in evaluate.GetD(Keywords.Parameters))
            {
                if (!(kv.Value is IGenericEntity vd))
                {
                    s.Set(kv.Key, kv.Value);
                    continue;
                }

                var paramEntityDictionary = vd.GetE(Keywords.Entity, null);
                if (paramEntityDictionary == null)
                {
                    s.Set(kv.Key, kv.Value);
                    continue;
                }

                paramEntityDictionary.TryGetValue(Keywords.Memory, out var memory, Keywords.Stack);
                var paramResults = await Evaluate(memory, s, paramEntityDictionary);

                if (paramResults is IReadOnlyDictionary<string, object> rd &&
                    rd.TryGetValue(Keywords.Result, out object result))
                    s.Set(kv.Key, result);
                else
                    s.Set(kv.Key, paramResults);
            }
        }

        private static async Task<IDictionary<string, object>> Run(IGenericEntity entity, IGenericEntity s)
        {
            IDictionary<string, object> outputs;

            var evaluateConfiguration = entity.GetE(Keywords.Evaluate, null);
            if (evaluateConfiguration == null)
                throw new InvalidOperationException("Nothing to evaluate.");

            if (evaluateConfiguration.TryGetValue(Keywords.Constant, out object constant))
            {
                outputs = new Dictionary<string, object>()
                {
                    [Keywords.Result] = constant
                };
            }
            // TODO: Find a way to apply outputs to referenced entity.
            // Would it be ok to attach them to the result and process them elsewhere?
            else if (evaluateConfiguration.TryGetValue(Keywords.EntityId, out var evaluateEntityId, Guid.Empty))
            {
                evaluateConfiguration.TryGetValue(Keywords.Memory, out string memory, Keywords.Stack);
                outputs = new Dictionary<string, object>()
                {
                    [Keywords.CallThis] = evaluateEntityId,
                    [Keywords.Memory] = memory
                };
            }
            else
            {
                var scriptDescriptor = new ScriptDescriptor(evaluateConfiguration);
                var result = await scriptDescriptor.Evaluate(s);

                if (result is IDictionary<string, object> rd)
                {
                    outputs = rd;
                }
                else
                {
                    // TODO: Override Completed with result from referenced entity, and forward possible continuation pointer
                    outputs = new Dictionary<string, object>()
                    {
                        [Keywords.Result] = result
                    };
                }
            }

            return outputs;
        }

        private static void ApplyInputsMap(IGenericEntity entity, IGenericEntity s)
        {
            foreach (var inputMap in entity.GetD(Keywords.InputsMap))
            {
                var input = s.Get(inputMap.Value.ToString());
                s.Set(inputMap.Key, input);
            }
        }

        private static void ApplyOutputsMap(IGenericEntity entity, IDictionary<string, object> results,
            IDictionary<string, object> outputs)
        {
            foreach (var outputMap in entity.GetD(Keywords.OutputsMap))
            {
                results.TryGetValue(outputMap.Value.ToString(), out object output);
                outputs[outputMap.Key] = output;
            }
        }

        private static void ValidateInputs(IGenericEntity contract, IGenericEntity s)
        {
            if (contract == null)
                return;

            (bool, object) tryGetValue(string key)
            {
                var found = s.TryGetValue(key, out object value);
                return (found, value);
            }
            Validate(contract, s, tryGetValue, Keywords.Inputs);
        }

        private static void ValidateOutputs(IGenericEntity contract, IGenericEntity s,
            IDictionary<string, object> results)
        {
            if (contract == null)
                return;

            (bool, object) tryGetValue(string key)
            {
                var found = results.TryGetValue(key, out object value);
                return (found, value);
            }
            Validate(contract, s, tryGetValue, Keywords.Outputs);
        }

        private static void Validate(IGenericEntity contract, IGenericEntity s,
            Func<string, (bool, object)> tryGetValue, string key)
        {
            foreach (var rule in contract.GetL(key))
            {
                var name = rule.Get<string>(Keywords.Name);
                var (found, value) = tryGetValue(name);

                ValidateRequired(rule, name, found);
                ValidateRequiredWhen(rule, name, found, tryGetValue);
                ValidateAllowedValues(rule, name, found, value);
                ValidateValidWhen(rule, s, name, found, tryGetValue);
            }
        }

        private static void ValidateRequired(IGenericEntity rule, string name, bool found)
        {
            var required = rule.Get(Keywords.Required, false);
            if (required && !found)
                throw new InvalidOperationException(
                    $"Parameter [{name}] is required but could not be found on the stack.");
        }

        private static void ValidateRequiredWhen(IGenericEntity rule, string name, bool found,
            Func<string, (bool, object)> tryGetValue)
        {
            foreach (var requirement in rule.GetL(Keywords.RequiredWhen))
            {
                var paramName = requirement.Get<string>(Keywords.Name);
                var (foundParam, paramValue) = tryGetValue(paramName);
                if (!foundParam)
                    continue;

                var match = requirement
                    .GetA(Keywords.MatchValues)
                    .Any(matchValue => Equals(paramValue, matchValue));
                if (match && !found)
                    throw new InvalidOperationException(
                        $"Parameter [{name}] is required when parameter [{paramName}] value equals [{paramValue}].");
            }
        }

        private static void ValidateAllowedValues(IGenericEntity rule, string name, bool found, object value)
        {
            if (!found)
                return;

            var allowedValues = rule.GetA(Keywords.AllowedValues);
            if (!allowedValues.Any())
                return;

            var isAllowed = rule
                .GetA(Keywords.AllowedValues)
                .Any(allowedValue => Equals(value, allowedValue));

            if (!isAllowed)
                throw new InvalidOperationException(
                    $"Parameter [{name}] value [{value}] does not match allowed values.");
        }

        private static void ValidateValidWhen(IGenericEntity rule, IGenericEntity s, string name, bool found,
            Func<string, (bool, object)> tryGetValue)
        {
            if (!found)
                return;

            foreach (var validation in rule.GetL(Keywords.ValidWhen))
            {
                var paramName = validation.Get<string>(Keywords.Name);
                var (foundParam, paramValue) = tryGetValue(paramName);
                if (!foundParam)
                    throw new InvalidOperationException(
                        $"Parameter [{name}] validation depends on parameter [{paramName}], which is not on the stack.");

                var isValid = validation
                    .GetA(Keywords.MatchValues)
                    .Any(matchValue => Equals(paramValue, matchValue));
                if (isValid)
                    continue;

                throw new InvalidOperationException(
                    $"Parameter [{name}] validation rule does not match on parameter [{paramName}] value [{paramValue}].");
            }
        }
    }
}
