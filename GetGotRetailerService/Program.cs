using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

<<<<<<< HEAD:GetGotRetailerWeb/Program.cs
namespace GetGotRetailerWeb
=======
namespace GetGotRetailerService
>>>>>>> b02c7bcfe404cf2a718a36d88d849bb27fcc54c7:GetGotRetailerService/Program.cs
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>();
    }
}
