using CurlThin;
using CurlThin.Enums;
using CurlThin.Helpers;
using CurlThin.Native;
using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

namespace QuickTester
{
    public class CurlThinWrapper
    {
        public static void Run()
        {
            CurlResources.Init();
            var global = CurlNative.Init();

            // curl_easy_init() to create easy handle.
            var easy = CurlNative.Easy.Init();
            try
            {
                var dataCopier = new DataCallbackCopier();
                
                //CurlNative.Easy.SetOpt(easy, CURLoption.URL, "http://httpbin.org/ip");
                //CurlNative.Easy.SetOpt(easy, CURLoption.WRITEFUNCTION, dataCopier.DataHandler);
                
                CurlNative.Easy.SetOpt(easy, CURLoption.BUFFERSIZE, 102400);
                CurlNative.Easy.SetOpt(easy, CURLoption.URL, "ftp://142.44.215.16/dph.hsr");
                CurlNative.Easy.SetOpt(easy, CURLoption.USERPWD, "jgreenberg:kr0b0t");
                CurlNative.Easy.SetOpt(easy, CURLoption.USERAGENT, "curl/7.55.1");
                CurlNative.Easy.SetOpt(easy, CURLoption.MAXREDIRS, 50);
                CurlNative.Easy.SetOpt(easy, CURLoption.TCP_KEEPALIVE, 1);

                FileStream stream = new FileStream("test.dat", FileMode.OpenOrCreate, FileAccess.ReadWrite);
                CurlNative.Easy.SetOpt(easy, CURLoption.WRITEFUNCTION, (data, size, nmemb, user) =>
                {
                    var length = (int)size * (int)nmemb;
                    var buffer = new byte[length];
                    Marshal.Copy(data, buffer, 0, length);
                    stream.Write(buffer, 0, length);
                    return (UIntPtr)length;
                });
               
                

                var result = CurlNative.Easy.Perform(easy);
                stream.Close();

                Console.WriteLine($"Result code: {result}.");
                Console.WriteLine();
                Console.WriteLine("Response body:");
                //Console.WriteLine(Encoding.UTF8.GetString(dataCopier.Stream.ToArray()));
            }
            finally
            {
                easy.Dispose();

                if (global == CURLcode.OK)
                {
                    CurlNative.Cleanup();
                }
            }
        }
    }
}
