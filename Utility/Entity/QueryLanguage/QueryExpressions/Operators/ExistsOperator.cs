using System.Threading.Tasks;

namespace Utility.Entity.QueryLanguage.QueryExpressions.Operators
{
    internal class ExistsOperator : IQueryExpressionOperator
    {
        public int OrderOfOperation => 1;

        public QueryExpressionType GetOutputType(QueryExpressionNode left, QueryExpressionNode right) => QueryExpressionType.Boolean;

        public async Task<EntityDocument> Evaluate(QueryExpressionNode left, QueryExpressionNode right, Entity entity)
        {
            var leftEntity = await left.Evaluate(entity);

            return new EntityDocumentConstant(leftEntity.ValueType != EntityValueType.Undefined, EntityValueType.Boolean, ToString());
        }

        public string ToString(QueryExpressionNode left, QueryExpressionNode right) => left.ToString();
    }
}