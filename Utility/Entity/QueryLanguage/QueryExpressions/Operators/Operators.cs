using System;

namespace Utility.Entity.QueryLanguage.QueryExpressions.Operators
{
    internal static class Operators
    {
        public static readonly IQueryExpressionOperator Exists = new ExistsOperator();
        public static readonly IQueryExpressionOperator Not = new NotOperator();

        public static readonly IQueryExpressionOperator Multiplication = new MultiplicationOperator();
        public static readonly IQueryExpressionOperator Division = new DivisionOperator();
        public static readonly IQueryExpressionOperator Modulus = new ModulusOperator();

        public static readonly IQueryExpressionOperator Addition = new AdditionOperator();
        public static readonly IQueryExpressionOperator Subtraction = new SubtractionOperator();

        public static readonly IQueryExpressionOperator EqualTo = new EqualToOperator();
        public static readonly IQueryExpressionOperator NotEqualTo = new NotEqualToOperator();
        public static readonly IQueryExpressionOperator LessThan = new LessThanOperator();
        public static readonly IQueryExpressionOperator LessThanOrEqualTo = new LessThanOrEqualToOperator();
        public static readonly IQueryExpressionOperator GreaterThan = new GreaterThanOperator();
        public static readonly IQueryExpressionOperator GreaterThanOrEqualTo = new GreaterThanOrEqualToOperator();

        public static readonly IQueryExpressionOperator And = new AndOperator();
        public static readonly IQueryExpressionOperator Or = new OrOperator();

        public static bool TryParse(ReadOnlySpan<char> query, ref int index, out IQueryExpressionOperator op)
        {
            op = null;
            switch (query[index])
            {
                case '*':
                    index++;
                    op = Multiplication;
                    return true;
                case '/':
                    index++;
                    op = Division;
                    return true;
                case '%':
                    index++;
                    op = Modulus;
                    return true;
                case '+':
                    index++;
                    op = Addition;
                    return true;
                case '-':
                    index++;
                    op = Subtraction;
                    return true;
                case '=':
                    if (index + 1 >= query.Length)
                    {
                        return false;
                    }

                    if (query[index + 1] == '=')
                    {
                        index += 2;
                        op = EqualTo;
                        return true;
                    }
                    break;
                case '!':
                    if (index + 1 >= query.Length)
                    {
                        return false;
                    }

                    if (query[index + 1] == '=')
                    {
                        index += 2;
                        op = NotEqualTo;
                        return true;
                    }
                    break;
                case '<':
                    if (index + 1 < query.Length && query[index + 1] == '=')
                    {
                        index += 2;
                        op = LessThanOrEqualTo;
                        return true;
                    }

                    index++;
                    op = LessThan;
                    return true;
                case '>':
                    if (index + 1 < query.Length && query[index + 1] == '=')
                    {
                        index += 2;
                        op = GreaterThanOrEqualTo;
                        return true;
                    }

                    index++;
                    op = GreaterThan;
                    return true;
                case '&':
                    if (index + 1 >= query.Length)
                    {
                        return false;
                    }

                    if (query[index + 1] == '&')
                    {
                        index += 2;
                        op = And;
                        return true;
                    }
                    break;
                case '|':
                    if (index + 1 >= query.Length)
                    {
                        return false;
                    }

                    if (query[index + 1] == '|')
                    {
                        index += 2;
                        op = Or;
                        return true;
                    }
                    break;
            }
            return false;
        }
    }
}