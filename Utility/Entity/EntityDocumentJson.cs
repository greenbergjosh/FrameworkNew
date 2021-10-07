using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Utility.Entity.QueryLanguage.Tokens;

namespace Utility.Entity
{
    public class EntityDocumentJson : EntityDocument
    {
        private readonly JsonElement _root;
        private static readonly Dictionary<Type, Func<JsonElement, object>> _valueMap = new()
        {
            [typeof(string)] = element => element.GetString(),
            [typeof(int)] = element => element.GetInt32()
        };

        public override string Query { get; internal set; }

        protected override int Length =>
            _root.ValueKind switch
            {
                JsonValueKind.Array => _root.GetArrayLength(),
                JsonValueKind.Object => _root.EnumerateObject().Count(),
                _ => throw new InvalidOperationException($"ValueKind {_root.ValueKind} does not have a length")
            };

        public EntityDocumentJson(JsonElement root, string query)
        {
            _root = root;
            Query = query;
        }

        public static Task<EntityDocument> Parse(string json) => Task.FromResult<EntityDocument>(new EntityDocumentJson(JsonDocument.Parse(json).RootElement, "$"));

        protected override EntityDocument GetArrayElement(Index index)
        {
            var max = _root.GetArrayLength();
            var i = Math.Min(max, index.IsFromEnd ? max - index.Value : index.Value);
            return new EntityDocumentJson(_root[i], Query + $"[{i}]");
        }

        protected override IEnumerable<EntityDocument> GetPropertyCore(PropertyToken token)
        {
            if (token == PropertyToken.Wildcard)
            {
                switch (_root.ValueKind)
                {
                    case JsonValueKind.Object:
                        foreach (var property in _root.EnumerateObject())
                        {
                            yield return new EntityDocumentJson(property.Value, Query + $".{property.Name}");
                        }
                        break;
                    case JsonValueKind.Array:
                        foreach (var (item, index) in _root.EnumerateArray().Select((item, index) => (item, index)))
                        {
                            yield return new EntityDocumentJson(item, Query + $"[{index}]");
                        }
                        break;
                }

                yield break;
            }

            if (_root.ValueKind != JsonValueKind.Object) yield break;

            if (!_root.TryGetProperty(token.Name, out var element)) yield break;

            yield return new EntityDocumentJson(element, Query + $".{token.Name}");
        }

        protected override IEnumerable<EntityDocument> NestedDescent(NestedDescentToken token) => GetChildren(_root, Query);

        public override string ToString() => _root.ToString();

        public override T Value<T>()
        {
            var targetType = typeof(T);

            if(!_valueMap.TryGetValue(targetType, out var getter))
            {
                throw new Exception($"Unable to convert value to type {targetType}");
            }

            return (T)getter(_root);
        }

        private static IEnumerable<EntityDocument> GetChildren(JsonElement current, string query)
        {
            switch (current.ValueKind)
            {
                case JsonValueKind.Object:
                    yield return new EntityDocumentJson(current, query);
                    foreach (var property in current.EnumerateObject())
                    {
                        foreach (var child in GetChildren(property.Value, query + $".{property.Name}"))
                        {
                            yield return child;
                        }
                    }
                    break;
                case JsonValueKind.Array:
                    yield return new EntityDocumentJson(current, query);
                    foreach (var (item, index) in current.EnumerateArray().Select((item, index) => (item, index)))
                    {
                        foreach (var child in GetChildren(item, query + $"[{index}]"))
                        {
                            yield return child;
                        }
                    }
                    break;
                case JsonValueKind.String:
                case JsonValueKind.Number:
                case JsonValueKind.True:
                case JsonValueKind.False:
                case JsonValueKind.Null:
                    yield return new EntityDocumentJson(current, query);
                    break;
                case JsonValueKind.Undefined:
                default:
                    throw new ArgumentOutOfRangeException(nameof(current), $"Unhandled {nameof(JsonValueKind)}: {current.ValueKind}");
            }
        }
    }
}
