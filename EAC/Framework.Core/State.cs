using Framework.Core.EntityStoreProviders;
using Framework.Core.GenericEntity;
using Framework.Core.Languages.E;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Framework.Core
{
    public class State : GenericEntityBase
    {
        public string Serialize()
        {
            return JsonWrapper.Serialize(_memory);
        }

        public void Deserialize(string json)
        {
            _memory.Clear();
            var jt = JsonWrapper.TryParse(json);
            var memory = (IDictionary<string, object>)JsonEntityStoreProvider.ToObject(jt);
            foreach (var kv in memory)
            {
                _memory.Add(Guid.Parse(kv.Key), kv.Value);
            }
        }

        private delegate Task<object> EvaluateDelegate(params object[] args);

        //****************************************************************************************//
        // Only this member is serialized.
        //
        private readonly IDictionary<Guid, object> _memory =                    // Memory
            new Dictionary<Guid, object>();
        //
        //
        //****************************************************************************************//

        private readonly DictionaryStack _stack = new DictionaryStack();        // Stack

        private readonly IDictionary<Guid, IGenericEntity> _s =                 // Services
            new Dictionary<Guid, IGenericEntity>();

        private readonly DictionaryStack _calls = new DictionaryStack();        // Calls

        private readonly Stack<IDictionary<string, object>> _context =          // Context Stack
            new Stack<IDictionary<string, object>>();

        private readonly Dictionary<Guid, object> _results =                  // Results
            new Dictionary<Guid, object>();

        public IDictionary<Guid, object> Memory { get { return _memory; } }

        public DictionaryStack Stack { get { return _stack; } }

        public IDictionary<Guid, object> Results { get { return _results; } }

        public IDictionary<string, object> Calls { get { return _calls; } }

        public override void InitializeEntity(object configuration, object data)
        {

        }

        public void PushStackFrame(object parameters)
        {
            _calls.Push();
            _stack.Push(CreateStackFrame(parameters));
        }

        public void PopStackFrame()
        {
            _calls.Pop();
            _stack.Pop();
        }

        public void PushContext(IDictionary<string, object> context)
        {
            _context.Push(context);
        }

        public void PopContext()
        {
            if (_context.Count > 0)
                _context.Pop();
        }

        public IDictionary<string, object> Context
        {
            get
            {
                return _context.Count == 0
                    ? null
                    : _context.Peek();
            }
        }

        public static IDictionary<string, object> CreateStackFrame(object o)
        {
            if (o is IDictionary<string, object> dictionary)
                return dictionary;

            var sf = new Dictionary<string, object>();
            if (o == null)
                return sf;

            if (o is IReadOnlyDictionary<string, object> roDictionary)
            {
                foreach (var kv in roDictionary)
                    sf.Add(kv.Key, kv.Value);
                return sf;
            }

            if (o is IEnumerable<KeyValuePair<string, object>> enumerable)
            {
                foreach (var kv in enumerable)
                    sf.Add(kv.Key, kv.Value);
                return sf;
            }

            var t = o.GetType();
            foreach (PropertyInfo pi in t.GetProperties())
                sf.Add(pi.Name, pi.GetValue(o));

            return sf;
        }

        public override object this[string path]
        {
            get
            {
                var parts = path.Split('/');

                object currentNode = GetRoot(parts[0]);
                if (currentNode == null)
                    throw new ArgumentOutOfRangeException(parts[0]);
            
                foreach (string node in parts)
                    currentNode = ((IDictionary<string, object>)currentNode)[node];

                return currentNode;
            }
        }

        public override void Set(string key, object value)
        {
            Stack[key] = value;
        }

        private IDictionary<string, object> GetRoot(string key)
        {
            /*IDictionary<string, object> root = null;

            switch (key.ToLowerInvariant())
            {
                case "p":
                case "parameters":
                    root = P;
                    break;

                case "f":
                case "functions":
                    root = F;
                    break;
            }

            return root;*/

            return Stack;
        }

        public override bool TryGetValue<T>(string path, out T value, T defaultValue = default)
        {
            var parts = path.Split('/');
            object currentNode = GetRoot(parts[0]);

            if (currentNode != null)
            {
                foreach (string node in parts)
                    currentNode = ((IDictionary<string, object>)currentNode)[node];
            }
            
            if (currentNode == null)
            {
                value = defaultValue;
                return false;
            }

            value = (T)DictionaryExtensions.Get(typeof(T), currentNode);
            return true;
        }

        public override IEnumerable<IGenericEntity> GetL(string path)
        {
            if (TryGetValue<IEnumerable<IDictionary<string, object>>>(path, out var enumerable))
            {
                foreach (var item in enumerable)
                {
                    var entity = new GenericEntityCollection();
                    entity.InitializeEntity(null, item);
                    yield return entity;
                }
            }
        }

        public override IGenericEntity GetE(string path)
        {
            var entity = new GenericEntityCollection();
            entity.InitializeEntity(null, this[path]);
            return entity;
        }

        public override IGenericEntity GetE(string path, IGenericEntity defaultValue)
        {
            if (!TryGetValue(path, out object e))
                return defaultValue;

            var entity = new GenericEntityCollection();
            entity.InitializeEntity(null, e);
            return entity;
        }

        public override async Task<dynamic> Run(string path, params object[] args)
        {
            var f = (Delegate)_calls[path];
            var result = (IDictionary<string, object>)await (Task<object>)f.DynamicInvoke((object)args);
            if (result.TryGetValue(Keywords.Result, out var r))
                return r;
            return result;
        }

        public void AddService(Guid contractId, IGenericEntity service)
        {
            if (!_s.ContainsKey(contractId))
                _s.Add(contractId, service);
        }

        public void ClearServices()
        {
            _s.Clear();
        }

        public async Task AddCall(string name, Guid contractId, IDictionary<string, object> parameters)
        {
            var service = _s[contractId];
            var contract = await Store.GetContract(contractId);
            _calls.Add(name, (EvaluateDelegate)((args) => EvaluateCall(service, contract, parameters, args)));
        }

        private async Task<object> EvaluateCall(IGenericEntity service, IGenericEntity contract, 
            IDictionary<string, object> parameters, object[] args)
        {
            var argsIndex = 0;
            var actualParameters = new Dictionary<string, object>();
            var inputs = contract.GetL(Keywords.Inputs);
            foreach (var input in inputs)
            {
                var name = input.Get<string>(Keywords.Name);
                var required = input.Get(Keywords.Required, false);
                if (required)
                {
                    if (!(actualParameters.ContainsKey(name) || 
                          parameters.ContainsKey(name) || 
                          argsIndex < args.Length))
                        throw new InvalidOperationException($"Parameter [{name}] is required.");
                }

                var requiredWhen = input.GetL(Keywords.RequiredWhen);
                foreach (var requirement in requiredWhen)
                {
                    var paramName = requirement.Get<string>(Keywords.Name);
                    var foundParam = actualParameters.TryGetValue(paramName, out object paramValue);
                    if (!foundParam)
                    {
                        foundParam = parameters.TryGetValue(paramName, out paramValue);
                        if (!foundParam)
                            continue;
                    }

                    foreach (var matchValue in requirement.GetA(Keywords.MatchValues))
                    {
                        var same = Equals(paramValue, matchValue);
                        if (!same)
                            continue;

                        if (!(actualParameters.ContainsKey(name) || 
                                parameters.ContainsKey(name) || 
                                argsIndex < args.Length))
                        {
                            throw new InvalidOperationException(
                                $"Parameter [{name}] is required when parameter [{paramName}] value equals [{paramValue}].");
                        }
                        else
                        {
                            required = true;
                            break;
                        }
                    }
                }

                if (!required && requiredWhen.Any())
                    continue;

                if (parameters.TryGetValue(name, out var value))
                    actualParameters.Add(name, value);
                else
                {
                    if (argsIndex < args.Length)
                    {
                        actualParameters.Add(name, args[argsIndex]);
                        argsIndex++;
                    }
                }
            }

            service.TryGetValue(Keywords.Memory, out var memory, Keywords.Stack);
            return await Trampoline.Evaluate(memory, this, service, actualParameters);
        }
    }
}
