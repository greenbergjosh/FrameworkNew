using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.Entity.Implementations;
using Utility.Evaluatable;

namespace Utility.Entity.QueryLanguage.Selectors
{
    internal sealed class PropertySelector : Selector
    {
        private readonly string _name;

        public static PropertySelector Wildcard { get; } = new(null);

        public PropertySelector(string name) => _name = name;

        protected override async IAsyncEnumerable<Entity> Load(EvaluatableSequenceBase selector, Entity targetEntity, EvaluateRequest request)
        {
            var propertySelector = (PropertySelector)selector;

            var matched = new List<Entity>();

            await foreach (var target in targetEntity.Document.EnumerateArray())
            {
                // TODO: Replace with Wildcard once evaluator provides state
                if (propertySelector._name == null)
                {
                    if (target.Document.IsObject)
                    {
                        matched.AddRange(await target.Document.EnumerateObject().Select(property => property.value).ToList());
                    }
                    else if (target.Document.IsArray)
                    {
                        matched.AddRange(await target.Document.EnumerateArray().ToList());
                    }
                }
                else if (target.Document.IsObject)
                {
                    var (found, propertyEntity) = await target.Document.TryGetProperty(propertySelector._name);
                    if (found)
                    {
                        matched.Add(propertyEntity);
                    }
                }
                else if (propertySelector._name == "length")
                {
                    matched.Add(target.Create(new EntityDocumentConstant(target.Document.Length, EntityValueType.Number), $"{target.Query}.length", target));
                }
            }

            foreach (var match in matched)
            {
                yield return match;
            }
        }

        public override string ToString() => $".{_name ?? "*"}";

        //public static async Task<EvaluateResponse> Evaluate(EvaluateRequest request)
        //{
        //    var (found, propertyName) = await request.Parameters.Document.TryGetProperty("prop");
        //    if (!found)
        //    {
        //        throw new InvalidOperationException($"`prop` is required");
        //    }


        //}
    }
}
