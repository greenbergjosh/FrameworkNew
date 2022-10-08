using Microsoft.AspNetCore.Http;
var response = await Entity.Eval<HttpResponse>("httpContext://Response");
await response.WriteAsync("Hello World from Entity!");
return new Utility.Evaluatable.EvaluateResponse(Complete: true);