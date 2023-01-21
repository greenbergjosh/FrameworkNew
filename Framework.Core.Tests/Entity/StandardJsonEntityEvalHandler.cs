using System;
using Framework.Core.Entity;
using Framework.Core.Entity.Implementations;
using Framework.Core.Evaluatable.EvalProviders;
using System.Diagnostics;
using System.Text.Json;

namespace Framework.Core.Tests.Entity
{
    [DebuggerDisplay("{Name,nq} StandardJsonEntityEvalHandler")]
    public class StandardJsonEntityEvalHandler : IEntityEvalHandler
    {
        public string Name { get; init; }

        public StandardJsonEntityEvalHandler(string name)
        {
            Name = name;
        }

        // The EntityEvalHandler knows the shape of the stored entity and how to interpret that shape.
        public async Task<(string providerName, Core.Entity.Entity providerParameters)> HandleEntity(Core.Entity.Entity entity)
        {
            var (erefFound, eref) = await entity.Document.TryGetProperty("$eref");
            if (erefFound)
            {
                return (ERefEvalProvider.Name, entity.Create(new
                {
                    url = eref
                }));
            }

            var (qErefFound, qEref) = await entity.Document.TryGetProperty("$qeref");
            if (qErefFound)
            {
                return (ERefEvalProvider.Name, entity.Create(new
                {
                    url = qEref,
                    quoted = true
                }));
            }

            var (evaluateFound, evaluate) = await entity.Document.TryGetProperty("$evaluate");
            if (!evaluateFound)
            {
                // No evalute, so use the constant provider
                return (ConstantEvalProvider.Name, entity.Create(new { value = entity }));
            }

            var providerName = await evaluate.Document.GetRequiredString("provider");
            if (providerName == PfaEvalProvider.Name)
            {
                // This is short-hand for pointing to another entity in the current "database"
                var (entityIdFound, entityId) = await evaluate.Document.TryGetProperty("entityId");
                if (entityIdFound)
                {
                    var targetEntity = GetFromConfigDb(entity, entityId.Value<Guid>());
                    return (PfaEvalProvider.Name, entity.Create(new
                    {
                        entity = targetEntity,
                        parameters = await evaluate.Document.GetRequiredProperty("parameters")
                    }));
                }
            }

            return (providerName, evaluate);
        }

        // This is called by the resolver
        public Core.Entity.Entity GetFromConfigDb(Core.Entity.Entity baseEntity, Guid id)
        {
            var entities = JsonDocument.Parse(File.ReadAllText("Entity/ConfigDB.json")).RootElement;
            var entity = entities.GetProperty(id.ToString());

            // This is equivalent to the scheme knowing which EntityEvalHandler to use.
            return baseEntity.Create(new EntityDocumentJson(entity, this));
        }
    }
}

