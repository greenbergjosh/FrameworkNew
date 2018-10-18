using System;
using System.IO;

namespace QuickTester
{
    class Program
    {
        static void Main(string[] args)
        {            
            string fname = "abc.josh";
            string dfileName = "c:\\workspace\\copyofd1c.txt";
            new FileInfo(StringHolder.dir + "\\" + fname).CopyTo(dfileName);

            //string someFile = @"C:\somefolder\somefile.txt";
            //string directory = Path.GetDirectoryName(someFile);

            //foreach (var file in Directory.GetFiles(directory))
            //{
            //    File.Delete(file);
            //}

            //string baseDir = "C:\\Workspace";
            DirectoryInfo di = new DirectoryInfo("C:\\Workspace");
            Console.Write("Made it");
            FileInfo[] fi = di.GetFiles("copyofd1c.txt");
            if (fi.Length == 1)
            {
                Console.Write("Found it");
            }
            else
            {
                Console.Write("Did not find it");
            }
        }
    }
}
