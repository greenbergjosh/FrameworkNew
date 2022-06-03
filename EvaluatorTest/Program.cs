using System.Text.Json;
using Utility.Entity;
using Utility.Entity.Implementations;

var fw = await Utility.FrameworkWrapper.Create();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

//var app = builder.Build();

//// Configure the HTTP request pipeline.

//app.UseHttpsRedirection();

//app.MapFallback(async (context) =>
//{
//    var entityWithRequestScope = fw.Entity.Wrap(new EntityConfig
//    {
//        Retriever = (entity, uri) => Task.FromResult<(IEnumerable<Entity> entities, string query)>(uri.Scheme switch
//        {
//            "object" => uri.Authority switch
//            {
//                "httpcontext" => (new[] { entity.Create(context) }, uri.AbsolutePath[1..]),
//                _ => (new[] { Entity.Unhandled }, String.Empty)
//            },
//            "config" => (new[] { GetEntity(entity, Guid.Parse(uri.Host)) }, Uri.UnescapeDataString(uri.Query.TrimStart('?'))),
//            _ => (new[] { Entity.Unhandled }, String.Empty)
//        })
//    });

//    Guid topLevelRequestHandlerEntityFromConfig = Guid.Parse("ab9c9297-4b2f-430d-a9b5-03b7ac4cb80b");

//    _ = await entityWithRequestScope.Eval($"config://{topLevelRequestHandlerEntityFromConfig}").ToList();
//});

//app.Run();

Entity GetEntity(Entity baseEntity, Guid id)
{
    var entities = JsonDocument.Parse(File.ReadAllText("Entities/ConfigDB.json")).RootElement;
    var entity = entities.GetProperty(id.ToString());

    return baseEntity.Create(new EntityDocumentJson(entity));
}

var entityWithRequestScope = fw.Entity.Wrap(new EntityConfig
{
    Retriever = (entity, uri) => Task.FromResult<(IEnumerable<Entity> entities, string query)>(uri.Scheme switch
    {
        "config" => (new[] { GetEntity(entity, Guid.Parse(uri.Host)) }, Uri.UnescapeDataString(uri.Query.TrimStart('?'))),
        _ => (new[] { Entity.Unhandled }, String.Empty)
    })
});

var x = GetEntity(entityWithRequestScope, Guid.Parse("458ad2e3-63dd-4d9c-af26-442eff688f66"));

// Create process/thread

for (var i = 0; i < 5; i++)
{
    var result = await fw.Evaluator.Evaluate("myCounter", x, null);

    Console.WriteLine(result);
}

for (var i = 0; i < 5; i++)
{
    var result = await fw.Evaluator.Evaluate("myCounter2", x, null);

    Console.WriteLine(result);
}

for (var i = 0; i < 5; i++)
{
    var result = await fw.Evaluator.Evaluate("myCounter", x, null);

    Console.WriteLine(result);
}

