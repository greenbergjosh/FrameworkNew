﻿using System;
using System.IO;
using System.Threading.Tasks;
using ImageMagick;
using Microsoft.AspNetCore.Http;
using Utility;

namespace CountdownGeneratorLib
{
    public class CountdownGeneratorDataService
    {
        public FrameworkWrapper Fw;
        public string WorkingDirectory;

        public void Config(FrameworkWrapper fw)
        {
            Fw = fw;
            WorkingDirectory = fw.StartupConfiguration.GetS("Config/WorkingDirectory");
        }

        public async Task Run(HttpContext context)
        {
            string requestFromPost = "";

            try
            {
                requestFromPost = await context.GetRawBodyStringAsync();

                string imageName = context.Request.Query["i"];
                int dx = int.TryParse(context.Request.Query["dx"], out dx) == false ? 0 : dx;
                int dy = int.TryParse(context.Request.Query["dy"], out dy) == false ? 0 : dy;
                string dv = context.Request.Query["dv"];
                int hx = int.TryParse(context.Request.Query["hx"], out hx) == false ? 0 : hx;
                int hy = int.TryParse(context.Request.Query["hy"], out hy) == false ? 0 : hy;
                string hv = context.Request.Query["hv"];
                int mx = int.TryParse(context.Request.Query["mx"], out mx) == false ? 0 : mx;
                int my = int.TryParse(context.Request.Query["my"], out my) == false ? 0 : my;
                string mv = context.Request.Query["mv"];
                int sx = int.TryParse(context.Request.Query["sx"], out sx) == false ? 0 : sx;
                int sy = int.TryParse(context.Request.Query["sy"], out sy) == false ? 0 : sy;
                string fnt = string.IsNullOrEmpty(context.Request.Query["f"].ToString()) 
                    ? "Arial" : context.Request.Query["f"].ToString();
                byte fr = byte.TryParse(context.Request.Query["fr"], out fr) == false ? (byte)0 : fr;
                byte fg = byte.TryParse(context.Request.Query["fg"], out fg) == false ? (byte)0 : fg;
                byte fb = byte.TryParse(context.Request.Query["fb"], out fb) == false ? (byte)0 : fb;
                if (!Enum.TryParse<FontStyleType>(context.Request.Query["fst"], out FontStyleType fst))
                    fst = FontStyleType.Normal;
                if (!Enum.TryParse<FontWeight>(context.Request.Query["fw"], out FontWeight fw))
                    fw = FontWeight.Normal;
                if (!Enum.TryParse<FontStretch>(context.Request.Query["fs"], out FontStretch fs))
                    fs = FontStretch.Normal;
                int p = int.TryParse(context.Request.Query["p"], out p) == false ? 10 : p;
                int sz = int.TryParse(context.Request.Query["sz"], out sz) == false ? 50 : sz;
                int dp = int.TryParse(context.Request.Query["dp"], out dp) == false ? 16 : dp;

                //i=teavana&dx=-160&dy=10&dv=10&hx=-55&hy=10&hv=11&mx=50&my=10&mv=12&sx=155&sy=10&fr=32&fg=141&fb=151
                if (!string.IsNullOrEmpty(imageName))
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
                        var size = new DrawableFontPointSize(sz);
                        var color = new DrawableFillColor(MagickColor.FromRgb(fr, fg, fb));
                        var font = new DrawableFont(fnt, fst, fw, fs);

                        //var strokeColor = new DrawableStrokeColor(Color.White);
                        //image.Annotate("Some annotation", Gravity.Center);

                        image.Draw(drawable1, gravity, font, antialias, size, color);
                        image.Draw(drawable2, gravity, font, antialias, size, color);
                        image.Draw(drawable3, gravity, font, antialias, size, color);
                        image.Draw(drawable4, gravity, font, antialias, size, color);

                        image.AnimationDelay = 100;
                        image.Depth = dp;
                        image.Posterize(p);

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
                await Fw.Error(nameof(Run), $@"Caught exception processing request: {ex.Message} : {ex.UnwrapForLog()}");
            }
        }
    }

}
