using System.Dynamic;
using Framework.Core.Entity;
// I believe this class can be removed
namespace Framework.Core.Evaluatable
{
    public class EvaluateRequest : DynamicObject
    {
        public Evaluator Evaluator;
        public Entity.Entity Parameters;

        public EvaluateRequest(Evaluator Evaluator, Entity.Entity Parameters)
        {
            this.Evaluator = Evaluator;
            this.Parameters = Parameters;
        }

#pragma warning disable CS8610 // Nullability of reference types in type of parameter doesn't match overridden member.
        public override bool TryInvoke(InvokeBinder binder, object[] args, out object result)
#pragma warning restore CS8610 // Nullability of reference types in type of parameter doesn't match overridden member.
        {
            result = Parameters.GetRequiredProperty((string)args[0], Parameters);
            return true;
        }

        //public Task<Entity.Entity> this[string index]
        //{
        //    get { return Parameters[index]; }
        //}

        public Entity.Entity this[string index]
        {
            get { return Parameters[index].Result; }
        }
    }
    
}
