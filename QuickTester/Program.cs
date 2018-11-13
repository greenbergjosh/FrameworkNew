using GenericEntity;
using Newtonsoft.Json;
using System;
using Utility;

namespace QuickTester
{
    class Program
    {
        static void Main(string[] args)
        {
            var result = SqlWrapper.SqlServerProviderEntry("Data Source =.;Initial Catalog = dataMail;Integrated Security = SSPI;",
                            "SelectProvider",
                            "{}",
                            "").GetAwaiter().GetResult();
            IGenericEntity gp = new GenericEntityJson();
            var gpstate = JsonConvert.DeserializeObject(result);
            gp.InitializeEntity(null, null, gpstate);

            foreach (var ig in gp.GetL(""))
            {
                var s = ig.GetS("Config/FetchParms");
                var t = ig.GetS("Config/Transform");
                var i = ig.GetS("Id");
                var all = ig.GetS("");
            }

            

            Console.WriteLine("0: " + args[0]);
            Console.WriteLine("1: " + args[1]);
            Console.WriteLine("2: " + args[2]);
            Console.WriteLine(Utility.UnixWrapper.BinarySearchSortedMd5File(args[0], args[1], args[2]).GetAwaiter().GetResult());
        }
    }
}
