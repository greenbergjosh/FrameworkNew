using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// JHG: Consider using creative style master-detail to point an evaluatable at a composite (its master) to create a composite with the
// original evaluatable as a child

namespace Framework.Core.Languages.E
{
    // This will get moved to dynamic code once it is available
    internal static class CompositeEvaluatable
    {
        private static async Task<IDictionary<string, object>> Evaluate(Request request, DictionaryStack parameters)
        {
            Guid me = parameters.Get<Guid>("_EntityId");
            int intMe = GuidHelper.ToInt(me);
            // Get the list of evaluatables managed by this composite
            var evaluatables = parameters.GetList("Evaluatables").Select(e => new
            {
                Name = e.Get<string>("Name"),
                EntityId = e.Get<string>("Name") == "PrimaryEntity" ? parameters.Get<Guid>("PrimaryEntityId") : e.Get<Guid>("EntityId"),
                Parameters = MergeParameters(e.Get<string>("Name"), e.Get("Parameters", null), parameters, e.GetList("ParameterMappings", null))
            }).ToList();

            if (evaluatables.Count != evaluatables.Select(e => e.Name).Distinct().Count())
                throw new ArgumentException("Duplicate name in Evaluatables");

            // Reverse the list if a parameter tells us to do so
            // Reverse makes sense when a composite is used as a sequence
            // It does not make sense when a composite is used as a join
            if (parameters.Get("RepeatAndReverseOnPost", false))
                evaluatables.Reverse();

            //var compositeParameters = new Dictionary<string, object>();
            // I commented the below line since no one reads this property - is it just used for passing structural configuration
            //compositeParameters["CompositeEvaluatables"] = evaluatables;
            // The composteReturn is used by the Grid and StackFrame POST behaviors to determine whether or not the primary entity
            // has completed. The grid will create a new cell for the entity if it hasn't completed.
            //var compositeReturn = parameters.Get("CompositeReturn", new DictionaryStack());
            //compositeParameters["CompositeReturn"] = compositeReturn;
            //var introducedParameters = new DictionaryStack();
            //compositeParameters["IntroducedParameters"] = introducedParameters;

            //var evaluatableParameters = new DictionaryStack(parameters);  //Original Line
            //var evaluatableParameters = new DictionaryStack();  // Replacement Line

            //evaluatableParameters.Push(compositeParameters);
            //evaluatableParameters.Push(introducedParameters);  // I added this line and commented out the push in the loop
            // JHG: Do the parameter updates made by the decorations get persisted between yields
            // If so, the post decorations could alter the primary evaluatable (which would take effect on the continuation)
            // How do I know if an introduced parameter is supposed to get pushed upward. I think the composite, which fully controls
            // the introduced parameters is the clue. The goal of decorations is to support the primary entityid. The problem is that
            // a primary entity could be used to implement the behavior of a decoration, but then it should be the job of that primary
            // entity to push something up into the parent's introduced parameters. Plus, its not really the primary entity, it is the 
            // join entity in the config.  The join entity knows what it is trying to do. It is either returning something, introducing
            // something, or providing structural reusability. So, it is the join entity that knows whether to pass up the introduced
            // parameters. Every entity in the JSON file is a join entity. That is what I was missing. Every join entity is reified and
            // can know something about what it adds to behavior. So, we can look at a join entity and decide if it should be able to 
            // introduce something to its parent. Of course, if composite did a full flattening then this would be meaningless since 
            // the total linear composite would only have a single primary entity and it would be logical to remove all introduced parameters
            // when the composite completed. This means that the composite is not doing a total flattening, it is allowing a branching
            // into n-dimensions (decorating decorations type of thing so that a decoration may be built up using non-decorations - different
            // from a series of decorations being reused).

            // Does the composite have to keep track of the continuation pointers that is gives to its gives/receives from its children
            // If not, then a decoration cannot be put back into the state that it was in before - which is exactly what grid does
            // Something is off again here. I am convoluting two things. I haven't clarified where the framework stops and E or a given
            // decoration picks up. Is the framework history aware? No, grid helps do that. Grid is a decoration. So decorations cannot
            // be history aware unless they are themselves decorated with a grid. Is that possible? Yes, it is.

            var returnValue = new DictionaryStack();

            var eCopy = evaluatables.ToList();

            var compositeParameters = new Dictionary<string, object>();
            compositeParameters["CompositeReturn"] = parameters.Get("CompositeReturn", new DictionaryStack());
            DictionaryStack introducedParameters = new DictionaryStack();
            introducedParameters.Push();
            compositeParameters["IntroducedParameters"] = introducedParameters;
            parameters.Push(compositeParameters);       

            while (evaluatables.Count > 0)
            {
                var evaluatable = evaluatables[0];
                evaluatables.RemoveAt(0);
                
                parameters.Push(evaluatable.Parameters);
                parameters.Push(introducedParameters);

                var childResult = await Evaluator.Evaluate(evaluatable.EntityId, request, parameters);
                returnValue.Push(childResult);
                ((DictionaryStack)compositeParameters["CompositeReturn"]).Push(childResult);

                parameters.Pop();
                parameters.Pop();
            }

            parameters.Pop();

            if (intMe == 13 || intMe == 18 || intMe == 17)
            {
                var parentIntroducedParameters = parameters.Get<DictionaryStack>("IntroducedParameters", null);
                if (parentIntroducedParameters != null)
                    parentIntroducedParameters.Push(introducedParameters);
            }

            return returnValue;
        }

        private static IDictionary<string, object> MergeParameters(string name, IDictionary<string, object> parameters, IDictionary<string, object> parentParameters, IList<IDictionary<string, object>> parameterMappings)
        {
            var result = new DictionaryStack();
            if (parameters != null)
            {
                result.Push(new Dictionary<string, object>(parameters));
            }

            if (parameterMappings != null)
            {
                result.Push();
                foreach (var parameterMapping in parameterMappings)
                {
                    var childParameterName = parameterMapping.Get<string>("ChildParameterName");
                    var parameterName = parameterMapping.Get<string>("ParameterName");
                    result[childParameterName] = parentParameters[parameterName];
                }
            }

            var parentParams = parentParameters.Get(name, null);
            if (parentParams != null)
            {
                result.Push(new Dictionary<string, object>(parentParams));
            }

            return result;
        }
    }
}
