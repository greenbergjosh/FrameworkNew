using Microsoft.AspNetCore.Http;
using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Utility;
using Utility.DataLayer;
using Jw = Utility.JsonWrapper;

namespace ReadPixelLib
{
    public class ReadPixelDataService
    {
        public string PixelValue;
        public int PixelDuration;
        public FrameworkWrapper Fw;

        public void Config(FrameworkWrapper fw)
        {
            Fw = fw;

            this.PixelValue = fw.StartupConfiguration.GetS("Config/PixelValue");
            this.PixelDuration = Int32.Parse(fw.StartupConfiguration.GetS("Config/PixelDuration"));
        }

        public async Task Run (HttpContext context)
        {
            string requestFromPost = "";

            try
            {
                requestFromPost = await context.GetRawBodyStringAsync();

                string pixelValue = context.Request.Query["pxl"];
                if (!String.IsNullOrEmpty(pixelValue))
                {
                    Stopwatch stopWatch = new Stopwatch();                    
                    stopWatch.Start();

                    context.RequestAborted.Register(async () =>
                    {
                        stopWatch.Stop();
                        long duration = stopWatch.ElapsedMilliseconds;
                        string result = await Data.CallFnString("ReadPixel", "ReadPixelFire",
                        Jw.Json(new { Duration = duration, PixelValue = pixelValue }), "");
                    });

                    await Task.Delay(this.PixelDuration * 1000);

                    if (!context.RequestAborted.IsCancellationRequested)
                    {
                        string result = await Data.CallFnString("ReadPixel",
                            "ReadPixelFire",
                            Jw.Json(new { Duration = -1, PixelValue = pixelValue }),
                            Jw.Empty);

                        var PixelContentBase64 = this.PixelValue;
                        var PixelContentType = "image/gif";
                        var PixelImage = Convert.FromBase64String(PixelContentBase64);
                        context.Response.ContentType = PixelContentType;
                        context.Response.Headers.ContentLength = PixelImage.Length;
                        await context.Response.Body.WriteAsync(PixelImage);
                    }
                }
            }
            catch (Exception ex)
            {
                await Fw.Error(nameof(Run), $@"Caught exception processing request: {ex.Message} : {ex.UnwrapForLog()}");
            }
        }

    }

}
