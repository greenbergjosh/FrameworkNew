using System.Text.Json;
using Utility.Entity;
using Utility.Entity.Implementations;

var fw = await Utility.FrameworkWrapper.Create();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();

app.MapGet("/", async (context) =>
{
    var entityWithRequestScope = fw.Entity.Wrap(new EntityConfig
    {
        Retriever = (entity, uri) => Task.FromResult<(IEnumerable<Entity> entities, string query)>(uri.Scheme switch
        {
            "httpcontext" => (new[] { entity.Create(context) }, char.ToUpper(uri.Authority[0]) + uri.Authority[1..]),
            "config" => (new[] { GetEntity(entity, Guid.Parse(uri.Host)) }, Uri.UnescapeDataString(uri.Query.TrimStart('?'))),
            _ => (new[] { Entity.Unhandled }, String.Empty)
        })
    }); // Retriever that handles request://

    Guid topLevelRequestHandlerEntityFromConfig = Guid.Parse("0086226a-d81d-4c74-983d-24f232eba731");

    _ = await entityWithRequestScope.Eval($"config://{topLevelRequestHandlerEntityFromConfig}").ToList();
});

app.Run();

Entity GetEntity(Entity baseEntity, Guid id)
{
    var entities = JsonDocument.Parse(File.ReadAllText("Entities/ConfigDB.json")).RootElement;
    var entity = entities.GetProperty(id.ToString());

    return baseEntity.Create(new EntityDocumentJson(entity));
}




//Eval("$.a.Items") => returns an array

//EvalL("$.a.Items") => Eval("$.a.Items.*") => returns each item in the array

//Eval("$..Items") => returns 2 arrays

//EvalL("$..Items") => Eval("$..Items.*") => returns each item in each array

//Eval("Seq1") => returns each item in the array

//EvalL("Seq1") => Eval("Seq1.*");

//EvalL("Seq1") => Eval(Eval("Seq1"), ".*");

//Eval("Seq1.color");

//Possible results:
//    //[1, 2, 3] - return the array as single object
//    //{ 1, false}, { 2, false}, { 3, false}, { null, true} - return one item per call
