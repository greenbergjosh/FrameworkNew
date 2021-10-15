using System;
using System.Collections.Generic;
using System.Linq;
using Utility.Entity.QueryLanguage.QueryExpressions;
using Utility.Entity.QueryLanguage.QueryExpressions.Operators;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    public abstract class QueryIndexExpression : IIndexExpression
    {
        internal static bool TryParseExpression(Entity entity, ReadOnlySpan<char> span, ref int i, out QueryExpressionNode expression)
        {
            if (span[i] != '(')
            {
                expression = null;
                return false;
            }

            i++;
            Helpers.ConsumeWhitespace(span, ref i);
            if (!QueryExpressionNode.TryParseSingleValue(entity, span, ref i, out var left))
            {
                expression = null;
                return false;
            }

            var followingNodes = new List<(IQueryExpressionOperator, QueryExpressionNode)>();
            while (i < span.Length && span[i] != ')')
            {
                Helpers.ConsumeWhitespace(span, ref i);
                if (!Operators.TryParse(span, ref i, out var op))
                {
                    expression = null;
                    return false;
                }

                QueryExpressionNode right;
                Helpers.ConsumeWhitespace(span, ref i);
                if (span[i] == '(')
                {
                    Helpers.ConsumeWhitespace(span, ref i);
                    if (!TryParseExpression(entity, span, ref i, out right))
                    {
                        expression = null;
                        return false;
                    }
                }
                else
                {
                    Helpers.ConsumeWhitespace(span, ref i);
                    if (!QueryExpressionNode.TryParseSingleValue(entity, span, ref i, out right))
                    {
                        expression = null;
                        return false;
                    }
                }

                followingNodes.Add((op, right));
            }

            i++; // consume ')'

            if (!followingNodes.Any())
            {
                expression = left.Operator is NotOperator ? left : new QueryExpressionNode(left, Operators.Exists, null!);
                return true;
            }

            var current = new Stack<QueryExpressionNode>();
            QueryExpressionNode root = null;
            foreach (var (op, node) in followingNodes)
            {
                if (root == null)
                {
                    root = new QueryExpressionNode(left, op, node);
                    current.Push(root);
                    continue;
                }

                while (current.Any() && current.Peek().Operator?.OrderOfOperation < op.OrderOfOperation)
                {
                    current.Pop();
                }

                if (current.Any())
                {
                    current.Peek().InsertRight(op, node);
                    continue;
                }

                root = new QueryExpressionNode(root, op, node);
                current.Push(root);
            }

            expression = root;
            return expression != null;
        }
    }
}
