using System.Threading.Tasks;
using Utility.Entity.Implementations;

namespace Utility.Entity.QueryLanguage.QueryExpressions.Operators
{
    internal sealed class ExistsOperator : IQueryExpressionOperator
    {
        public int OrderOfOperation => 1;

        public QueryExpressionType GetOutputType(QueryExpressionNode left, QueryExpressionNode right) => QueryExpressionType.Boolean;

        public async Task<EntityDocument> Evaluate(QueryExpressionNode left, QueryExpressionNode right, Entity entity, Entity evaluationParameters)
        {
            var leftEntity = await left.Evaluate(entity, evaluationParameters);

            return new EntityDocumentConstant(leftEntity.ValueType != EntityValueType.Undefined, EntityValueType.Boolean);
        }

        public string ToString(QueryExpressionNode left, QueryExpressionNode right) => left.ToString();
    }
}