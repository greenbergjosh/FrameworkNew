﻿using System;
using System.Linq;
using System.Threading.Tasks;

namespace Utility.Entity.QueryLanguage.QueryExpressions
{
    internal sealed class QueryExpressionNode
    {
        private readonly Query _query;
        private readonly QueryExpressionNode _left;
        private QueryExpressionNode _right;
        private QueryExpressionType? _outputType;
        private Entity _value;

        public IQueryExpressionOperator Operator { get; }

        public QueryExpressionType OutputType => _outputType ??= GetOutputType();

        public QueryExpressionNode(Entity value) => _value = value;

        public QueryExpressionNode(Query query)
        {
            _query = query;
            _outputType = QueryExpressionType.InstanceDependent;
        }

        public QueryExpressionNode(QueryExpressionNode left, IQueryExpressionOperator op, QueryExpressionNode right)
        {
            _left = left ?? throw new ArgumentNullException(nameof(left));
            Operator = op ?? throw new ArgumentNullException(nameof(op));
            _right = right;
        }

        public async Task<Entity> Evaluate(Entity entity)
        {
            if (_value != null)
            {
                return _value;
            }

            if (_query != null)
            {
                var result = await entity.Evaluate(_query);
                // don't set _value; need to always eval
                return result.SingleOrDefault() ?? Entity.Undefined;
            }

            if (OutputType == QueryExpressionType.Invalid)
            {
                return default;
            }

            var value = entity.Create(await Operator.Evaluate(_left, _right, entity), Operator.ToString());
            if (OutputType != QueryExpressionType.InstanceDependent)
            {
                _value = value;
            }

            return value;
        }

        public void InsertRight(IQueryExpressionOperator op, QueryExpressionNode newRight) => _right = new QueryExpressionNode(_right, op, newRight);

        public static bool TryParseSingleValue(Entity entity, ReadOnlySpan<char> query, ref int index, out QueryExpressionNode node)
        {
            if (query[index] == '!')
            {
                index++;
                if (!TryParseSingleValue(entity, query, ref index, out var singleValue))
                {
                    node = null;
                    return false;
                }
                node = new QueryExpressionNode(singleValue, Operators.Operators.Not, null);
                return true;
            }

            if (Query.TryParse(entity, query, ref index, true, out var path, out var _))
            {
                node = new QueryExpressionNode(path);
                return true;
            }

            if (Helpers.TryParseEntityDocument(query, ref index, out var entityDocument))
            {
                node = new QueryExpressionNode(entity.Create(entityDocument, "@"));
                return true;
            }

            node = null;
            return false;
        }

        public string MaybeAddParentheses(int operationOrder, bool overrideIfSame = false)
        {
            var asString = ToString();
            if (operationOrder < Operator?.OrderOfOperation)
            {
                asString = $"({asString})";
            }

            if (overrideIfSame && operationOrder == Operator?.OrderOfOperation)
            {
                asString = $"({asString})";
            }

            return asString;
        }

        private QueryExpressionType GetOutputType()
        {
            if (_value != null)
            {
                return GetValueType();
            }

            if (_query != null)
            {
                return QueryExpressionType.InstanceDependent;
            }

            if (_left.OutputType == QueryExpressionType.Invalid || _right?.OutputType == QueryExpressionType.Invalid)
            {
                return QueryExpressionType.Invalid;
            }

            if (_left.OutputType == QueryExpressionType.InstanceDependent || _right?.OutputType == QueryExpressionType.InstanceDependent)
            {
                return QueryExpressionType.InstanceDependent;
            }

            return Operator?.GetOutputType(_left!, _right!) ?? GetValueType();
        }

        private QueryExpressionType GetValueType() => _value.ValueType switch
        {
            EntityValueType.Array => QueryExpressionType.Array,
            EntityValueType.Boolean => QueryExpressionType.Boolean,
            EntityValueType.Null => QueryExpressionType.Null,
            EntityValueType.Number => QueryExpressionType.Number,
            EntityValueType.Object => QueryExpressionType.Object,
            EntityValueType.String => QueryExpressionType.String,
            _ => throw new ArgumentOutOfRangeException()
        };

        public override string ToString() => Operator?.ToString(_left!, _right!) ?? _value?.ToString() ?? _query!.ToString();
    }
}