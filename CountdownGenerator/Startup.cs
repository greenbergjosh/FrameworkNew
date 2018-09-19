using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using GenericEntity;
using ImageMagick;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Jw = Utility.JsonWrapper;

namespace CountdownGenerator
{
    public class Startup
    {
        public string ConnectionString;
        public string ConfigurationKey;
        public string CountdownTimerConnectionString;
        public string WorkingDirectory;

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            IConfigurationRoot configuration = new ConfigurationBuilder()
                            .SetBasePath(Directory.GetCurrentDirectory())
                            .AddJsonFile("appsettings.json")
                            .Build();
            this.ConnectionString = configuration.GetConnectionString("DefaultConnection");
            this.ConfigurationKey = configuration.GetValue<String>("Application:Instance");

            string result = SqlWrapper.SqlServerProviderEntry(this.ConnectionString,
                        "SelectConfig",
                        Jw.Json(new { InstanceId = this.ConfigurationKey }),
                        "").GetAwaiter().GetResult();
            IGenericEntity gc = new GenericEntityJson();
            var gcstate = JsonConvert.DeserializeObject(result);
            gc.InitializeEntity(null, null, gcstate);

            this.CountdownTimerConnectionString = gc.GetS("Config/CountdownTimerConnectionString");
            this.WorkingDirectory = gc.GetS("Config/WorkingDirectory");

            app.Run(async (context) =>
            {
                await Start(context);
            });
        }

        public async Task Start(HttpContext context)
        {
            string requestFromPost = "";

            try
            {
                StreamReader reader = new StreamReader(context.Request.Body);
                requestFromPost = await reader.ReadToEndAsync();

                string imageName = context.Request.Query["i"];
                int dx = Int32.TryParse(context.Request.Query["dx"], out dx) == false ? 0 : dx;
                int dy = Int32.TryParse(context.Request.Query["dy"], out dy) == false ? 0 : dy;
                string dv = context.Request.Query["dv"];
                int hx = Int32.TryParse(context.Request.Query["hx"], out hx) == false ? 0 : hx;
                int hy = Int32.TryParse(context.Request.Query["hy"], out hy) == false ? 0 : hy;
                string hv = context.Request.Query["hv"];
                int mx = Int32.TryParse(context.Request.Query["mx"], out mx) == false ? 0 : mx;
                int my = Int32.TryParse(context.Request.Query["my"], out my) == false ? 0 : my;
                string mv = context.Request.Query["mv"];
                int sx = Int32.TryParse(context.Request.Query["sx"], out sx) == false ? 0 : sx;
                int sy = Int32.TryParse(context.Request.Query["sy"], out sy) == false ? 0 : sy;
                string fnt = String.IsNullOrEmpty(context.Request.Query["f"].ToString()) 
                    ? "Arial" : context.Request.Query["f"].ToString();
                byte fr = byte.TryParse(context.Request.Query["fr"], out fr) == false ? (byte)0 : (byte)fr;
                byte fg = byte.TryParse(context.Request.Query["fg"], out fg) == false ? (byte)0 : (byte)fg;
                byte fb = byte.TryParse(context.Request.Query["fb"], out fb) == false ? (byte)0 : (byte)fb;
                FontStyleType fst;
                if (!Enum.TryParse<FontStyleType>(context.Request.Query["fst"], out fst))
                    fst = FontStyleType.Normal;
                FontWeight fw;
                if (!Enum.TryParse<FontWeight>(context.Request.Query["fw"], out fw))
                    fw = FontWeight.Normal;
                FontStretch fs;
                if (!Enum.TryParse<FontStretch>(context.Request.Query["fs"], out fs))
                    fs = FontStretch.Normal;

                //i=teavana&dx=-160&dy=10&dv=10&hx=-55&hy=10&hv=11&mx=50&my=10&mv=12&sx=155&sy=10&fr=32&fg=141&fb=151
                if (!String.IsNullOrEmpty(imageName))
                {
                    string imgFileName = this.WorkingDirectory + "\\" + imageName + ".gif";
                    MagickImageCollection collection = new MagickImageCollection();
                    MagickImage img = new MagickImage(imgFileName);
                    MagickImage[] frames = new MagickImage[60];

                    Parallel.For(0, 60, number =>
                    {
                        //for (int number = 59; number >= 0; number--)
                        //{
                        MagickImage image = new MagickImage(img);
                        var drawable1 = new DrawableText(dx, dy, dv);
                        var drawable2 = new DrawableText(hx, hy, hv);
                        var drawable3 = new DrawableText(mx, my, mv);
                        var drawable4 = new DrawableText(sx, sy, number.ToString());
                        var gravity = new DrawableGravity(Gravity.North);
                        var antialias = new DrawableTextAntialias(true);
                        var size = new DrawableFontPointSize(50);
                        var color = new DrawableFillColor(MagickColor.FromRgb(fr, fg, fb));
                        var font = new DrawableFont(fnt, fst, fw, fs);

                        //var strokeColor = new DrawableStrokeColor(Color.White);
                        //image.Annotate("Some annotation", Gravity.Center);

                        image.Draw(drawable1, gravity, font, antialias, size, color);
                        image.Draw(drawable2, gravity, font, antialias, size, color);
                        image.Draw(drawable3, gravity, font, antialias, size, color);
                        image.Draw(drawable4, gravity, font, antialias, size, color);

                        image.AnimationDelay = 100;
                        image.Depth = 16;
                        image.Posterize(64);
                        //collection.Add(image);
                        frames[number] = image;
                    });

                    for (int i = 59; i >= 0; i--) collection.Add(frames[i]);
                    collection.Optimize();
                    
                    MemoryStream ms = new MemoryStream();
                    collection.Write(ms);
                    
                    context.Response.ContentType = "image/gif";
                    long length = ms.Length;
                    context.Response.Headers.ContentLength = length; 
                    ms.Position = 0;
                    byte[] buffer = ms.GetBuffer();
                    await context.Response.Body.WriteAsync(buffer, 0, (int)length);
                }
            }
            catch (Exception ex)
            {
                //File.AppendAllText("log.txt", $@"{DateTime.Now}::{requestFromPost}::{ex.ToString()}" + Environment.NewLine);
            }
        }
    }
}
