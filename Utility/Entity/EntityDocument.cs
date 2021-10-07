using System;
using System.Collections.Generic;
using System.Linq;
using Utility.Entity.QueryLanguage.IndexExpressions;
using Utility.Entity.QueryLanguage.Tokens;

namespace Utility.Entity
{
    public abstract class EntityDocument
    {
        public abstract string Query { get; internal set; }

        protected abstract int Length { get; }
        public bool IsObject { get; internal set; }
        public bool IsArray { get; internal set; }

        internal IEnumerable<EntityDocument> Process(Token token) => token switch
        {
            RootNodeToken => new[] { this },
            LocalNodeToken => new[] { this },
            PropertyToken propertyToken => GetProperty(propertyToken),
            NestedDescentToken nestedDescentToken => NestedDescent(nestedDescentToken),
            IndexToken indexToken => ProcessIndex(indexToken),
            _ => throw new ArgumentException($"Unknown token type {token.GetType().Name}", nameof(token))
        };

        internal abstract IEnumerable<(string name, EntityDocument value)> EnumerateObject();

        internal bool TryGetProperty(string name, out EntityDocument propertyEntityDocument) => throw new NotImplementedException();
        
        internal abstract IEnumerable<EntityDocument> EnumerateArray();

        public abstract T Value<T>();

        protected static object Cast(Type type, object value)
        {
            if (value == null)
            {
                if (!type.IsValueType)
                {
                    return null;
                }

                return Activator.CreateInstance(type);
            }

            if (value.GetType() == type || type.IsInstanceOfType(value))
            {
                return value;
            }

            if (type == typeof(string))
            {
                return value.ToString();
            }

            try
            {
                var tryParseMethod = type.GetMethod("TryParse", new Type[] { typeof(string), type.MakeByRefType() });
                if (tryParseMethod != null)
                {
                    var parameters = new[] { value, null };
                    tryParseMethod.Invoke(null, parameters);
                    return parameters[1];
                }

                return Convert.ChangeType(value, type);
            }
            catch (Exception ex)
            {
                throw new Exception($"Couldn't convert [{value}] to type: {type.AssemblyQualifiedName}{Environment.NewLine}{ex.Message}");
            }
        }

        private IEnumerable<EntityDocument> GetProperty(PropertyToken token)
        {
            var result = GetPropertyCore(token);
            if ((result == null || !result.Any()) && token.Name == "length")
            {
                return new[] { new EntityDocumentConstant(Length, Query + ".length") };
            }

            return result;
        }

        private IEnumerable<EntityDocument> ProcessIndex(IndexToken indexToken)
        {
            if (indexToken.Indexes == null)
            {
                foreach (var entityDocument in GetPropertyCore(PropertyToken.Wildcard))
                {
                    yield return entityDocument;
                }
                yield break;
            }

            foreach (var index in indexToken.Indexes)
            {
                var entityDocuments = index switch
                {
                    ArrayIndexExpression arrayIndexExpression => ProcessArrayIndexExpression(arrayIndexExpression),
                    ObjectElementIndexExpression elementIndex => ProcessObjectElementIndex(elementIndex),
                    _ => throw new ArgumentException($"Unknown index type {index.GetType()}")
                };

                foreach(var entityDocument in entityDocuments)
                {
                    yield return entityDocument;
                }
            }
        }

        private IEnumerable<EntityDocument> ProcessArrayIndexExpression(ArrayIndexExpression arrayIndexExpression)
        {
            foreach(var indexExpression in arrayIndexExpression.Indexes)
            {
                foreach()
            }
        }

        private IEnumerable<EntityDocument> ProcessObjectElementIndex(ObjectElementIndexExpression elementIndex)
        {
        }

        protected abstract EntityDocument GetArrayElement(Index index);
        protected abstract IEnumerable<EntityDocument> GetPropertyCore(PropertyToken token);
        protected abstract IEnumerable<EntityDocument> NestedDescent(NestedDescentToken token);
    }
}
