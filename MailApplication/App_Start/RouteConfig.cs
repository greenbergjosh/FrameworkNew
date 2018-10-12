using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;

namespace MailApplication
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "API", // Route name
                "seedbuckets/{id}/seed", // URL with parameters
                new { controller = "ClientSeed", action = "Seed" });

            routes.MapRoute(
                "WarmUp", // Route name
                "{apiKey}/mailClassWarmUp", // URL with parameters
                new { controller = "ClientSeed", action = "MailClassWarmUp" });

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Mail", action = "Index", id = UrlParameter.Optional }
            );


        }


    }
}
