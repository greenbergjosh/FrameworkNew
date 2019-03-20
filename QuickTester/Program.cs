using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Runtime.CompilerServices;
using Utility;
using static Utility.EdwBulkEvent;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Jw = Utility.JsonWrapper;
using Microsoft.AspNetCore.WebUtilities;
using Newtonsoft.Json.Linq;
using Utility.DataLayer;
using Random = Utility.Crypto.Random;

namespace QuickTester
{
    class Program
    {
        static void Test1()
        {
            //IGenericEntity gc = new GenericEntityJson();
            //string result = PL.C()
            //var gcstate = JsonConvert.DeserializeObject(result);
            //gc.InitializeEntity(null, null, gcstate);
        }

        static async Task<(TimeSpan overall, IEnumerable<(TimeSpan elapsed, int found, int notFound)> batches)> RunBatches(string testName, string filePath, IEnumerable<string> emails, int batchSize, bool global, bool sync)
        {
            var batches = emails.Select(e => (email: e, md5: Hashing.CalculateMD5Hash(e.Trim().ToLower()))).Batch(batchSize).Select(b => b.ToList()).ToArray();
            var stats = new List<(TimeSpan elapsed, int found, int notFound)>();
            var batchCnt = batches.Length;
            var unsubFile = new FileInfo(filePath);

            Func<List<(string email, string md5)>, Task<(TimeSpan elapsed, int found, int notFound)>> fileSearch;
            Func<List<string>, Task<int>> globalSearch;

            if (global)
            {
                if (batchSize == 1)
                {
                    globalSearch = async b =>
                    {
                        var email = b.First();
                        var res = await Data.CallFn("", "IsSuppressed", Jw.Json(new { email }), "");


                        return res.GetS("Result").ParseBool() == true ? 1 : 0;
                    };
                }
                else
                {
                    globalSearch = async b =>
                    {
                        var res = await Data.CallFn("", "AreSuppressed", Jw.Json(new { emails = b }), "");

                        var found = res.GetL("found").Select(g => g.GetS("")).ToList();

                        return found.Count;
                    };
                }
            }
            else globalSearch = b => Task.FromResult(0);

            if (batchSize == 1)
            {
                fileSearch = async b =>
                {
                    var swb = Stopwatch.StartNew();
                    var e = b.First();
                    var f = await UnixWrapper.BinarySearchSortedMd5File(unsubFile.DirectoryName, unsubFile.Name, e.md5);

                    if (!f)
                    {
                        var r = await globalSearch(new List<string> { e.email });
                        f = r > 0;
                    }

                    return (swb.Elapsed, f ? 1 : 0, f ? 0 : 1);
                };
            }
            else
            {
                var batchCompleted = 0;

                fileSearch = async b =>
                {
                    var swb = Stopwatch.StartNew();
                    var r = await UnixWrapper.BinarySearchSortedMd5File(unsubFile.FullName, b.Select(e => e.md5).ToList());
                    var notFound = from e in b
                                   join n in r.notFound on e.md5 equals n
                                   select e.email;
                    var gr = await globalSearch(notFound.ToList());

                    swb.Stop();

                    Interlocked.Add(ref batchCompleted, 1);

                    Console.WriteLine($"{testName} Batch {batchCompleted}/{batchCnt}");

                    return (swb.Elapsed, r.found.Count + gr, r.notFound.Count - gr);
                };
            }

            var swg = Stopwatch.StartNew();

            if (sync)
            {
                Console.WriteLine($"Starting {testName} {batchCnt} batches");

                for (int i = 0; i < batchCnt; i++)
                {
                    var r = await fileSearch(batches[i]);

                    stats.Add((r.elapsed, r.found, r.notFound));

                    Console.WriteLine($"{testName} Batch {i + 1}/{batchCnt}");
                }
            }
            else stats = (await Task.WhenAll(batches.Select(fileSearch))).ToList();

            swg.Stop();

            return (swg.Elapsed, stats);
        }

        static async Task Main(string[] args)
        {
            var batchSizes = new[] { 21, 55, 144, 377, 987, 2584, 6765, 17711, 46368, 121393, 317811 }.Select(x => x.ToString());
            //var batchSizes = new[] { 21, 144, 987, 6765, 46368, 317811 }.Select(x => x.ToString());
            var tf = new[] { "true", "false" };
            var cp = batchSizes.CartesianProduct(new[] { "false" }, new[] { "false" }).ToArray();
            List<(string name, int batchSize, bool global, bool sync)> tests = new List<(string name, int batchSize, bool global, bool sync)> { ("_current", 1, true, false) };

            tests.AddRange(cp.Select(x =>
            {
                var p = x.ToArray();
                var size = p[0].ParseInt().Value;
                var global = p[1].ParseBool().Value;
                var sync = p[2].ParseBool().Value;
                var g = global ? "G" : "L";
                var sy = sync ? "S" : "P";

                return ($"{size}-{g}-{sy}", size, global, sync);
            }));

            var emails = new List<string>();

            using (var fs = File.OpenText("C:/Users/OnPoint Global/Documents/dev/Workspace/Unsub/performanceTestEmails.csv"))
            {
                while (!fs.EndOfStream)
                {
                    var l = fs.ReadLine();

                    if (!l.IsNullOrWhitespace()) emails.Add(l.Trim().ToLower());
                }
            }

            //using (var ow = File.CreateText("C:/Users/OnPoint Global/Documents/dev/Workspace/Unsub/performanceTestMD5s.txt"))
            //{
            //    foreach (var md5 in emails.Distinct().Select(Hashing.CalculateMD5Hash).OrderBy(m => m))
            //    {
            //        ow.WriteLine(md5);
            //    }
            //}

            //return;

            var unsub = new UnsubLib.UnsubLib(new FrameworkWrapper());
            var opDir = new DirectoryInfo("C:/Users/OnPoint Global/Documents/dev/Workspace/Unsub/perfOP");

            if (opDir.Exists)
            {
                opDir.Delete(true);
                await Task.Delay(1000);
                opDir.Refresh();
            }

            opDir.Create();

            var of = new FileInfo(Path.Combine(opDir.FullName, "summary.csv"));

            using (var ow = of.CreateText())
            {
                ow.WriteLine("name,batchSize,global,sync,batchCount,totalSeconds,emails/s,found,notFound,avgBatchCompletionMS");
                var filePath = "C:/Users/OnPoint Global/Documents/dev/Workspace/Unsub/search/99d39a3b-49e3-4ef7-a8a0-e856ec657ea1.txt.srt";
                //var filePath = "C:/Users/OnPoint Global/Documents/dev/Workspace/Unsub/performanceTestMD5s.txt";

                foreach (var t in tests)
                {
                    var r = await RunBatches(t.name, filePath, emails, t.batchSize, t.global, t.sync);
                    var df = new FileInfo(Path.Combine(opDir.FullName, $"{t.name}.txt"));
                    var found = 0;
                    var notFound = 0;

                    using (var dw = df.CreateText())
                    {
                        dw.WriteLine($"Total Seconds: {r.overall.TotalSeconds:##,###.###}");
                        dw.WriteLine("Batches:");
                        foreach (var b in r.batches)
                        {
                            dw.WriteLine($"{b.elapsed.TotalSeconds:##,###.###},{b.found},{b.notFound}");
                            found += b.found;
                            notFound += b.notFound;
                        }
                    }

                    ow.WriteLine($"{t.name},{t.batchSize},{t.global},{t.sync},{(int)Math.Ceiling(emails.Count / (double)t.batchSize)},{r.overall.TotalSeconds},\"{emails.Count / r.overall.TotalSeconds:##,###.###}\",{found},{notFound},\"{(int)Math.Ceiling(r.batches.Select(ts => ts.elapsed.TotalMilliseconds).Average()):##,###}\"");
                }
            }

            return;

            var js = Jw.JsonToGenericEntity("{\"a\":[1,2,3]}");
            var vals = js.GetL("a").Select(g => g.GetS(""));

            string h = null;
            var plObj = new { a = 1, b = "1", c = "abc", e = DateTime.UtcNow, f = true, g = 1.01, i = new { a = 2 }, d = new[] { 1, 2, 3 } };

            var uid = Guid.NewGuid();
            var tms = DateTime.UtcNow;
            PL payload = PL.O(plObj, new[] { false, true, true });
            var configId = Guid.NewGuid();

            var ljw = PL.O(new { id = uid, ts = tms.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.fff") })
                .Add(PL.N("payload", PL.C(payload)))
                .Add(PL.C("rsid", configId.ToString())).ToString();

            var j = JsonConvert.SerializeObject(plObj);
            payload = PL.FromJsonString(j);

            //var jw = PL.C("whatev", j, false);
            var jw = PL.O(new { id = uid, ts = tms.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.fff") })
                .Add(PL.N("payload", PL.C(payload)))
                .Add(PL.C("rsid", configId.ToString())).ToString();

            return;
            var nl = Environment.NewLine;
            //var unsubFile = new FileInfo(Path.GetFullPath(args[0]));
            //var opFile = new FileInfo(Path.Combine(unsubFile.DirectoryName, $"{unsubFile.Name.Replace(unsubFile.Extension, "")}_md5s{unsubFile.Extension}"));
            //var totalMd5s = unsubFile.Length / 34;
            //var rand = new Random();
            //var randomlines = new SortedDictionary<int, object>();
            //var randMin = 0;
            //var randMax = 0;

            //for (int j = 0; j < 10; j++)
            //{
            //    randMin = (int)Math.Round(totalMd5s * j * 0.1, MidpointRounding.AwayFromZero);
            //    randMax = (int)Math.Round(totalMd5s * (j + 1) * 0.1, MidpointRounding.AwayFromZero);

            //    if ((randMax - randMin) < 1000) throw new Exception("Range too small");

            //    while (randomlines.Count < (j + 1) * 5000)
            //    {
            //        var r = rand.Next(randMin, randMax);

            //        if (!randomlines.ContainsKey(r)) randomlines.Add(r, null);
            //    }
            //}

            //if (opFile.Exists) opFile.Delete();
            //var md5s = new List<string>();

            //using (var rle = randomlines.GetEnumerator())
            //using (var fs = unsubFile.OpenText())
            //{
            //    rle.MoveNext();
            //    string line;
            //    var fileIndex = 0;

            //    while ((line = await fs.ReadLineAsync()) != null)
            //    {
            //        if (fileIndex == rle.Current.Key)
            //        {
            //            md5s.Add(line);
            //            rle.MoveNext();
            //        }
            //        fileIndex++;
            //    }
            //}

            //for (int j = 0; j < 2000; j++)
            //{
            //    md5s.Add(Utility.Crypto.Random.GenerateRandomString(32, 32, Utility.Crypto.Random.hex));
            //}

            //md5s.Sort();

            //using (var fw = opFile.Open(FileMode.CreateNew, FileAccess.Write, FileShare.None))
            //{
            //    await fw.WriteAsync(Encoding.ASCII.GetBytes(md5s.Join(nl)));
            //}

            //return;

            var checkFile = new FileInfo(Path.GetFullPath(args[1]));
            var searchFile = new FileInfo(Path.GetFullPath(args[0]));
            var outputFile = new FileInfo(Path.Combine(checkFile.DirectoryName, $"{checkFile.Name.Replace(checkFile.Extension, "")}_results{checkFile.Extension}"));
            string md5Str;

            Console.WriteLine($"Getting MD5 list from {checkFile.FullName}");
            using (var fs = checkFile.OpenText())
            {
                md5Str = await fs.ReadToEndAsync();
            }

            var md5s = md5Str.Split(new[] { ',', '\n' }, StringSplitOptions.RemoveEmptyEntries).Select(m => m.Trim()).ToList();
            var res = (found: new List<string>(), notFound: new List<string>());

            var sw = Stopwatch.StartNew();

            await md5s.ForEachAsync(10, async md5 =>
            {
                var f = await UnixWrapper.BinarySearchSortedMd5File(searchFile.DirectoryName, searchFile.Name, md5);

                if (f) res.found.Add(md5);
                else res.notFound.Add(md5);
            });

            sw.Stop();

            Console.WriteLine($"Processed in {sw.Elapsed.TotalSeconds}s ~{(int)(md5s.Count / sw.Elapsed.TotalSeconds)} records/s");

            if (outputFile.Exists) outputFile.Delete();

            using (var fs = outputFile.Open(FileMode.CreateNew, FileAccess.Write, FileShare.None))
            {
                await fs.WriteAsync(Encoding.ASCII.GetBytes($"Found:{nl}"));
                await fs.WriteAsync(Encoding.ASCII.GetBytes(res.found.Join(nl)));
                await fs.WriteAsync(Encoding.ASCII.GetBytes($"{nl}Not Found:{nl}"));
                await fs.WriteAsync(Encoding.ASCII.GetBytes(res.found.Join(nl)));
            }

            return;

            Test1();
            var uri = new Uri("http://a/b/c?md5_email=bob@hotmail.com&label=blah");
            var baseUri = uri.GetComponents(UriComponents.Scheme | UriComponents.Host | UriComponents.Port | UriComponents.Path, UriFormat.UriEscaped);
            var query = QueryHelpers.ParseQuery(uri.Query);
            string opaque = query.ContainsKey("label") ? query["label"][0] : "";
            string emailMd5 = query.ContainsKey("md5_email") ? query["md5_email"][0] : "";


            List<ScriptDescriptor> scripts = new List<ScriptDescriptor>();
            string scriptsPath = @"e:\workspace\scripts";
            var rw = new RoslynWrapper(scripts, $@"{scriptsPath}\\debug");
            string scriptFlatFileColumnGenerator =
                @"int i = 0;
                  foreach (var x in p.ge.GetL(""""))
                  {
                    XmlNode cln = p.cn.Clone();
                    ((XmlElement)cln).RemoveAttribute(""TokenizerReplace"" + [=i=]);
                    await f.TokenReplaceXmlR(new {pn = cln, ge = x}, s);
                    p.cn.ParentNode.AppendChild(cln);
                    i++;
                  }
                  p.cn.ParentNode.RemoveChild(p.cn);""""";
            //for (int ij = 0; ij < 100; ij++)
            //    rw.CompileAndCache(new ScriptDescriptor("FlatFileColumnGenerator", 
            //        scriptFlatFileColumnGenerator.Replace("[=i=]",ij.ToString()), false, null));


            string constr = "Data Source=66.70.182.182;Initial Catalog=GlobalConfig;Persist Security Info=True;User ID=GlobalConfigUser;Password=Global!User1";
            string result = SqlWrapper.SqlServerProviderEntry(constr, "SelectConfig", JsonWrapper.Json(new { InstanceId = "3B93EB28-79B6-489E-95D1-6EAA392536B5" }), "").GetAwaiter().GetResult();

            string json = "{\"x\": {\"a\": \"1\",\"b\": \"2\",\"c\": \"3\"}}";
            IGenericEntity gp = new GenericEntityJson();
            var gpstate = JsonConvert.DeserializeObject(json);
            gp.InitializeEntity(null, null, gpstate);

            foreach (var t in gp.GetD("x"))
            {
                string nm = t.Item1;
                string vl = t.Item2;
            }




            //var result = (JObject)JsonConvert.DeserializeObject(json);
            //foreach (var je in result.AsJEnumerable())
            //{
            //    string nm = ((JProperty)je).Name;
            //    string vl = ((JProperty)je).Value.ToString();
            //}
            //object x;
            //MethodInfo mi = x.GetType().GetMethod("");
            //using (var dynamicContext = new Utility.AssemblyResolver(Directory.GetCurrentDirectory() + "\\" + "Utility.dll"))
            //{
            //    //dynamic o = dynamicContext.Assembly.CreateInstance("Utility.FileSystem");
            //    dynamic t = dynamicContext.Assembly.GetType("Utility.FileSystem");
            //    MethodInfo mi = t.GetMethod("QuotePathParts");
            //    object[] parms = new object[]
            //    {
            //        @"c:\program files\long line\abc\efg.txt"
            //    };
            //    string s = (string)mi.Invoke(null, parms);
            //}

            MethodInfo mi = Utility.AssemblyResolver.GetMethod(Directory.GetCurrentDirectory() + "\\" + "Utility.dll",
                "Utility.FileSystem", "QuotePathParts", null);
            object[] parms = new object[]
                {
                    @"c:\program files\long line\abc\efg.txt"
                };
            string s = (string)mi.Invoke(null, parms);
            mi = Utility.AssemblyResolver.GetMethod(Directory.GetCurrentDirectory() + "\\" + "Utility.dll",
                "Utility.FileSystem", "QuotePathParts", null);
            s = (string)mi.Invoke(null, parms);

            int zz = 0;

            //var result = SqlWrapper.SqlServerProviderEntry("Data Source =.;Initial Catalog = dataMail;Integrated Security = SSPI;",
            //                "SelectProvider",
            //                "{}",
            //                "").GetAwaiter().GetResult();
            //IGenericEntity gp = new GenericEntityJson();
            //var gpstate = JsonConvert.DeserializeObject(result);
            //gp.InitializeEntity(null, null, gpstate);

            //foreach (var ig in gp.GetL(""))
            //{
            //    var s = ig.GetS("Config/FetchParms");
            //    var t = ig.GetS("Config/Transform");
            //    var i = ig.GetS("Id");
            //    var all = ig.GetS("");
            //}



            //Console.WriteLine("0: " + args[0]);
            //Console.WriteLine("1: " + args[1]);
            //Console.WriteLine("2: " + args[2]);
            //Console.WriteLine(Utility.UnixWrapper.BinarySearchSortedMd5File(args[0], args[1], args[2]).GetAwaiter().GetResult());

            //int xt1 = 1;
            //int xt2 = 2;
            //int xt3 = 3;
            //List<int?> xts1 = new List<int?> { xt1, null, xt2, null, xt3, 4 };
            //IEnumerable<int?> xts2 = new List<int?> { xt1, null, xt2, null, xt3, 4 };
            //int?[] xa1 = new int?[] { xt1, xt2, xt3, 4 };

            //int xr0 = Sum(xt1);
            //int xr1 = Sum(xt1, xt2, xt3);
            //int xr2 = Sum(xts1);
            //int xr3 = Sum(xts2);
            //int xr4 = Sum(xa1);



            //Tuple<string, string, string> x1 = new Tuple<string, string, string>("Bob", "Jones", "Dog");
            //Tuple<string, string, string> x2 = new Tuple<string, string, string>("Tom", "Arnold", "Cat");

            //Tester t1 = new Tester("bob", "jones");
            //Tester2 t2 = new Tester2("tom", "arnold");
            //Tester t3 = new Tester("billy", "thorn");

            //List<string> ls = new List<string>() { "Bob", "John", "Joe" };

            //Dictionary<string, string> d = new Dictionary<string, string>()
            //{
            //    { "Bob", "Jones" },
            //    { "Tom", "Arnold" }
            //};

            //Dictionary<string, string> d2 = new Dictionary<string, string>()
            //{
            //    { "Name1", "Value1" },
            //    { "Name2", "Value2" }
            //};

            //Dictionary<string, object> d3 = new Dictionary<string, object>()
            //{
            //    { "Name1", 5 },
            //    { "Name2", "Value2" }
            //};

            //Tuple<string, string, bool> tp1 = new Tuple<string, string, bool>("name1", "value1", true);
            //Tuple<string, string, bool> tp2 = new Tuple<string, string, bool>("name2", "value2", true);
            //List<Tuple<string, string, bool>> tpl1 = new List<Tuple<string, string, bool>>() { tp1, tp2 };

            //List<object> as2 = new List<object>() { 5, "hello" };

            //List<object> as3 = new List<object>() { t1, t3 };

            //List<Tuple<string, string, string>> lts = new List<Tuple<string, string, string>>() { x1, x2 };

            //var named = (first: "one", second: "two");

            //string st1 = PL.O(new { x = 1, y = "Bob" }).ToString();
            //string st1b = PL.O(new { x = 1, y = "Bob", z = "{}" }, null, new bool[] { true, true, false }).ToString(); ;
            //string st2 = PL.O(t1).ToString(); 
            //string st3 = PL.C(tpl1).ToString(); 
            //string st4 = PL.D(d3).ToString(); 
            //string st5 = PL.C("name", "bob").ToString(); 
            //string st6 = PL.O(x1, new List<string>() { "FN", "LN", "PT" }).ToString();

            //string st12 = PL.O(named).ToString();
            //string st13 = PL.O(x1).ToString();
            //var slc = lts.Select(lt => PL.O(lt));
            //string st14 = A.C(slc).ToString();


            //string st8 = PL.C(
            //    PL.N("ss", PL.C(PL.O(t1).Add(PL.C(tpl1)), PL.O(x1, new List<string>() { "FN", "LN", "PT" }))),
            //    PL.N("tt", PL.C(PL.O(t1).Add(PL.C(tpl1)), PL.O(x1, new List<string>() { "FN", "LN", "PT" }))),
            //    PL.N("zz", A.C(slc))
            //    ).ToString();

            //string st9 = A.C(
            //    PL.C(
            //        PL.N("ss", PL.C(PL.O(t1).Add(PL.C(tpl1)), PL.O(x1, new List<string>() { "FN", "LN", "PT" }))),
            //        PL.N("tt", PL.C(PL.O(t1).Add(PL.C(tpl1)), PL.O(x1, new List<string>() { "FN", "LN", "PT" }))),
            //        PL.N("zz", A.C(slc))
            //    ),
            //    PL.C(
            //        PL.N("ss", PL.C(PL.O(t1).Add(PL.C(tpl1)), PL.O(x1, new List<string>() { "FN", "LN", "PT" }))),
            //        PL.N("tt", PL.C(PL.O(t1).Add(PL.C(tpl1)), PL.O(x1, new List<string>() { "FN", "LN", "PT" }))),
            //        PL.N("zz", A.C(slc))
            //    ),
            //    SL.AO(lts, new List<string>() { "FN", "LN", "PT" }, new bool[] { true, true, true}),
            //    A.C(SL.AO(lts, new List<string>() { "AFN", "ALN", "APT" }, new bool[] { true, true, true }),
            //        SL.AO(lts, new List<string>() { "BFN", "BLN", "BPT" }, new bool[] { true, true, true })),
            //    SL.C(new List<object> { "hello", 5 })
            //    ).ToString();

            //Guid id1 = Guid.NewGuid();
            //string ts1 = DateTime.Now.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.fff");
            //Dictionary<string, object> rsids = new Dictionary<string, object>()
            //    { {"anrsid", "b0419e46-6620-4ed7-b849-d714f10b1d41" } };
            //List<string> weps = new List<string>()
            //    { "4231FE39-D704-4E8B-B982-9D69A9A29C26", "C8404A79-5403-4726-94C9-B663261FD78F" };


            //string st10 = PL.C(
            //    PL.N("E", A.C(
            //        PL.O(new { id = id1, ts = ts1 }).Add(
            //        PL.N("payload", PL.C("a_key", "a_value").Add(
            //            PL.N("rsid", PL.D(rsids)).Add(
            //            PL.N("whep", SL.C(weps)))))),

            //        PL.O(new { id = id1, ts = ts1 }).Add(
            //        PL.N("payload", PL.C("a_key", "a_value").Add(
            //            PL.N("rsid", PL.D(rsids)).Add(
            //            PL.N("whep", SL.C(weps))))))
            //        )
            //    ),
            //    PL.N("IM", A.C(
            //        PL.O(new { id = id1, ts = ts1 }).Add(
            //        PL.N("payload", PL.C("a_key", "a_value")).Add(
            //        PL.C("config_id", id1.ToString()))),

            //        PL.O(new { id = id1, ts = ts1 }).Add(
            //        PL.N("payload", PL.C("a_key", "a_value")).Add(
            //        PL.C("config_id", id1.ToString()))))

            //    )//,
            //    //PL.N("CK", ),
            //    //PL.N("CD", ),
            //    ).ToString();

            Guid id1 = Guid.NewGuid();
            string ts1 = DateTime.Now.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.fff");
            Dictionary<string, object> rsids = new Dictionary<string, object>()
                { {"anrsid", "b0419e46-6620-4ed7-b849-d714f10b1d41" } };
            List<string> weps = new List<string>()
                { "4231FE39-D704-4E8B-B982-9D69A9A29C26", "C8404A79-5403-4726-94C9-B663261FD78F" };

            EdwBulkEvent bulk = new EdwBulkEvent();
            bulk.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids, weps, PL.C("a_key", "a_value"));
            bulk.AddEvent(Guid.NewGuid(), DateTime.UtcNow, rsids, weps, PL.C("a_key", "a_value"));
            bulk.AddRS(EdwType.Immediate, Guid.NewGuid(), DateTime.UtcNow, PL.C("a_key", "a_value"), Guid.NewGuid());
            bulk.AddRS(EdwType.Immediate, Guid.NewGuid(), DateTime.UtcNow, PL.C("a_key", "a_value"), Guid.NewGuid());
            string st11 = bulk.ToString();
            int i = 0;

            // ["a", 5]
            // A PL is a list of things that can be put into an object
            // An SL is a list of things that can be put into an array
            // I can put an object, a PL into an array
            // I can put an array, an SL, into an object, but only if I name it first, thereby making it a PL
            // I can put an object into an object, but only if I name it first
            // I can put an array into an array

            // I construct from the bottom up
            // I start by creating PLs (which will become objects) and SLs which will become arrays
            // I can add them together (I could add positional insertion as well)
            // I then want to compose those PLs and SLs
            // I can add things to an O, only if they are named
            //   An O has List<PL>
            // I can add things to an A
            //   An A has List<PL|SL|tuple<string,bool>>

            // I build a PL from base parts, adding, inserting where needed
            // I build an SL from base parts, adding, inserting where needed

            // I then want to compose those base parts upward to create the larger structure
            // PL(name, PL) --> PL
            // PL(name, SL) --> PL  ==  PL(name, A) --> PL
            // A(PL, A, SL) --> A

        }

        public static int Sum(params int?[] xs)
        {
            return xs.Aggregate((x, y) => (x ?? 0) + (y ?? 0)) ?? 0;
        }

        public static int Sum(IEnumerable<int?> xs)
        {
            return Sum(xs.ToArray());
        }



        //    public enum RsType
        //    {
        //        Immediate = 0,
        //        Checked,
        //        CheckedDetail
        //    }

        //    public static IList<PL> events = new List<PL>();
        //    public static List<PL> ims = new List<PL>();
        //    public static List<PL> cks = new List<PL>();
        //    public static List<PL> cds = new List<PL>();

        //    public static Dictionary<RsType, List<PL>> RsTypes = new Dictionary<RsType, List<PL>>()
        //        { { RsType.Immediate, ims }, {RsType.Checked, cks}, {RsType.CheckedDetail, cds} };

        //    public static void AddEvent(Guid uid, DateTime tms, Dictionary<string, object> rsid,
        //        List<string> whep, PL payload)
        //    {
        //       events.Add(
        //            PL.O(new { id = uid, ts = tms.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.fff") })
        //                .Add(PL.N("payload", PL.C(payload).Add(PL.N("rsid", PL.D(rsid)))
        //                                                  .Add(PL.N("whep", SL.C(whep))))));
        //    }

        //    public static void AddRS(RsType t, Guid uid, DateTime tms, PL payload, Guid configId)
        //    {
        //        RsTypes[t].Add(
        //            PL.O(new { id = uid, ts = tms.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss.fff") })
        //                .Add(PL.N("payload", PL.C(payload)))
        //                .Add(PL.C("config_id", configId.ToString())));

        //    }

        //    public static string EdwBulk()
        //    {
        //        return PL.C().Add("E", false, events)
        //            .Add("IM", false, ims)
        //            .Add("CK", true, cks)
        //            .Add("CD", true, cds)
        //            .ToString();
        //    }
    }



    public class Tester
    {
        public string FieldOne;
        public string FieldTwo;

        public Tester(string fieldOne, string fieldTwo)
        {
            FieldOne = fieldOne;
            FieldTwo = fieldTwo;
        }

    }

    public class Tester2
    {
        public string FieldThree;
        public string FieldFour;

        public Tester2(string fieldThree, string fieldFour)
        {
            FieldThree = fieldThree;
            FieldFour = fieldFour;
        }

    }

    //public interface IJ { }

    //public class A : IJ
    //{
    //    IEnumerable<IJ> js = new List<IJ>();

    //    public A(IJ j) { js = new List<IJ>() { j }; }

    //    public static A C(IJ j) { return new A(j); }

    //    public A(IEnumerable<IJ> js) { this.js = js; }

    //    public static A C(IEnumerable<IJ> js) { return new A(js); }

    //    public A(params IJ[] js) { this.js = js; }

    //    public static A C(params IJ[] js) { return new A(js); }

    //    public override string ToString()
    //    {
    //        return String.Concat("[",
    //            String.Join(",",
    //                js.Select(p => p.ToString())),
    //            "]");
    //    }
    //}

    //public class SL : IJ
    //{
    //    public List<Tuple<string, bool>> ls = new List<Tuple<string, bool>>();

    //    public SL(SL sl)
    //    {
    //        this.ls = sl.ls.ToList();
    //    }

    //    public SL Add(SL rhs)
    //    {
    //        SL lhs = new SL(this);
    //        lhs.ls.AddRange(rhs.ls);
    //        return lhs;
    //    }

    //    public SL AddRange(List<SL> sls)
    //    {
    //        SL lhs = new SL(this);
    //        foreach (var sl in sls) lhs.ls.AddRange(sl.ls);
    //        return lhs;
    //    }

    //    public static SL operator +(SL lhs, SL rhs)
    //    {
    //        return lhs.Add(rhs);
    //    }

    //    public SL(List<object> l, bool q = true)
    //    {
    //        ls = l.Select(x => new Tuple<string, bool>(x.ToString(), q)).ToList();
    //    }

    //    public static SL C(List<object> l, bool q = true)
    //    {
    //        return new SL(l, q);
    //    }

    //    public SL(List<string> l, bool q = true)
    //    {
    //        ls = l.Select(x => new Tuple<string, bool>(x.ToString(), q)).ToList();
    //    }

    //    public static SL C(List<string> l, bool q = true)
    //    {
    //        return new SL(l, q);
    //    }

    //    public SL(params SL[] sls) { this.ls.AddRange(sls.SelectMany(x => x.ls)); }

    //    public static SL C(params SL[] sls) { return new SL(sls); }

    //    public SL(List<object> os, List<string> names)
    //    {
    //        if (os != null && os.Count > 0)
    //        {
    //            if (names != null)
    //            {
    //                ls = os.Select(o => new Tuple<string, bool>(PL.OM(names.Select((x, i) => PL.C(x,
    //                    o.GetType().GetField(x).GetValue(o).ToString()))), false)).ToList();
    //            }
    //            else
    //            {
    //                ls = os.Select(o => new Tuple<string, bool>(PL.OM(o.GetType().GetFields()
    //                    .Select(pi => PL.C(pi.Name, pi.GetValue(o).ToString()))), false)).ToList();
    //            }
    //        }
    //    }

    //    public static SL C(List<object> os, List<string> names)
    //    {
    //        return new SL(os, names);
    //    }

    //    public static SL C<T>(List<T> os, List<string> names, bool tuples)
    //    {
    //        List<string> ls = new List<string>();
    //        if (os != null && os.Count > 0)
    //        {
    //            if (tuples)
    //                ls = os.Select(o => PL.OM(names.Select((x, i) => PL.C(x,
    //                        o.GetType().GetProperty("Item" + (i + 1)).GetValue(o).ToString())))).ToList();
    //            else
    //            {
    //                if (names != null)
    //                {
    //                    ls = os.Select(o => PL.OM(names.Select((x, i) => PL.C(x,
    //                        o.GetType().GetField(x).GetValue(o).ToString())))).ToList();
    //                }
    //                else
    //                {
    //                    ls = os.Select(o => PL.OM(o.GetType().GetFields()
    //                        .Select(pi => PL.C(pi.Name, pi.GetValue(o).ToString())))).ToList();
    //                }
    //            }
    //        }
    //        return SL.C(ls, false);
    //    }

    //    public override string ToString()
    //    {
    //        return String.Join(",", ls.Select(li => li.Item2 ? Q(li.Item1) : li.Item1));
    //    }

    //    public static string Q(object x)
    //    {
    //        return "\"" + x.ToString() + "\"";
    //    }
    //}

    //public class PL : IJ
    //{
    //    public List<Tuple<string, string, bool>> ps = new List<Tuple<string, string, bool>>();

    //    public PL(PL pl)
    //    {
    //        this.ps = pl.ps.ToList();
    //    }

    //    public PL Add(PL rhs)
    //    {
    //        PL lhs = new PL(this);
    //        lhs.ps.AddRange(rhs.ps);
    //        return lhs;
    //    }

    //    public PL AddRange(List<PL> pls)
    //    {
    //        PL lhs = new PL(this);
    //        foreach (var pl in pls) lhs.ps.AddRange(pl.ps);
    //        return lhs;
    //    }

    //    public static PL operator +(PL lhs, PL rhs)
    //    {
    //        return lhs.Add(rhs);
    //    }

    //    public static PL N(string k, string v, bool q = false)
    //    {
    //        return new PL(new Dictionary<string, object>() { { k, v } }, q);
    //    }

    //    public static PL N(string name, PL pl)
    //    {
    //        return new PL(new Dictionary<string, object>() { { name, PL.C(pl) } }, false);
    //    }

    //    public static PL N(string name, SL sl)
    //    {
    //        return new PL(new Dictionary<string, object>() { { name, A.C(sl) } }, false);
    //    }

    //    public static PL N(string name, A a)
    //    {
    //        return new PL(new Dictionary<string, object>() { { name, a } }, false);
    //    }

    //    public PL(params PL[] pls) { this.ps.AddRange(pls.SelectMany(x => x.ps)); }

    //    public static PL C(params PL[] pls) { return new PL(pls); }

    //    public PL(List<Tuple<string, string, bool>> lps)
    //    {
    //        ps = lps;
    //    }

    //    public static PL C(List<Tuple<string, string, bool>> lps)
    //    {
    //        return new PL(lps);
    //    }

    //    public PL(string n, string v, bool q = true)
    //    {
    //        ps.Add(new Tuple<string, string, bool>(n, v, q));
    //    }

    //    public static PL C(string n, string v, bool q = true)
    //    {
    //        return new PL(n, v, q);
    //    }

    //    public PL(Dictionary<string, object> d, bool q = true)
    //    {
    //        if (d != null && d.Count > 0)
    //            ps = d.Select(x => new Tuple<string, string, bool>(x.Key, x.Value.ToString(), q)).ToList();
    //    }

    //    public static PL C(Dictionary<string, object> d, bool q = true)
    //    {
    //        return new PL(d, q);
    //    }

    //    public static string OM(IEnumerable<PL> pls)
    //    {
    //        return String.Concat("{",
    //            String.Join(",",
    //                pls.SelectMany(pl => pl.ps).Select(p => Q(p.Item1) + ":" + Q(p.Item2))),
    //            "}");
    //    }

    //    public class QC
    //    {
    //        bool[] Quotes;
    //        public QC(bool[] quotes) { this.Quotes = quotes;  }

    //        public bool V(int i)
    //        {
    //            return (Quotes == null || Quotes.Length < i + 1) ? true : Quotes[i];
    //        }
    //    }

    //    public PL(object o, bool[] quotes = null)
    //    {
    //        QC qc = new QC(quotes);

    //        if (o != null)
    //        {
    //            if (o is ITuple)
    //            {
    //                var tuple = o as ITuple;
    //                for (int i = 0; i < tuple.Length; i++)
    //                    ps.Add(new Tuple<string, string, bool>("Item" + (i + 1), tuple[i].ToString(), qc.V(i)));
    //            }
    //            else if (o.GetType().ToString().Contains("AnonymousType"))
    //                ps = o.GetType().GetProperties().Select((pi, i) =>
    //                    new Tuple<string, string, bool>(pi.Name, pi.GetValue(o).ToString(), qc.V(i))).ToList();
    //            else
    //                ps = o.GetType().GetFields().Select((pi, i) => 
    //                    new Tuple<string, string, bool>(pi.Name, pi.GetValue(o).ToString(), qc.V(i))).ToList();
    //        }
    //    }

    //    public static PL C(object o, bool[] quotes = null)
    //    {
    //        return new PL(o, quotes);
    //    }

    //    public static PL C<T>(T o, List<string> names, bool[] quotes = null)
    //    {
    //        QC qc = new QC(quotes);
    //        List<Tuple<string, string, bool>> ls = new List<Tuple<string, string, bool>>();
    //        if (o != null)
    //        {
    //            if (o is ITuple)
    //            {
    //                if (names != null && names.Count > 0)
    //                {
    //                    var tuple = o as ITuple;
    //                    for (int i = 0; i < tuple.Length && i < names.Count; i++)
    //                        ls.Add(new Tuple<string, string, bool>(names[i], tuple[i].ToString(), qc.V(i)));
    //                }
    //                else
    //                {
    //                    var tuple = o as ITuple;
    //                    for (int i = 0; i < tuple.Length && i < names.Count; i++)
    //                        ls.Add(new Tuple<string, string, bool>("Item" + (i + 1), tuple[i].ToString(), qc.V(i)));
    //                }   
    //            }
    //            else if (o.GetType().ToString().Contains("AnonymousType"))
    //            {
    //                if (names != null && names.Count > 0)
    //                {
    //                    ls = o.GetType().GetProperties().Select((pi, i) =>
    //                        new Tuple<string, string, bool>(names[i], pi.GetValue(o).ToString(), qc.V(i))).ToList();
    //                }
    //                else
    //                {
    //                    ls = o.GetType().GetProperties().Select((pi, i) =>
    //                        new Tuple<string, string, bool>(pi.Name, pi.GetValue(o).ToString(), qc.V(i))).ToList();
    //                }
    //            }   
    //            else
    //            {
    //                if (names != null && names.Count > 0)
    //                {
    //                    ls = names.Select((n, i) => new Tuple<string, string, bool>(n, o.GetType().GetField(n).GetValue(o).ToString(), qc.V(i))).ToList();
    //                }
    //                else
    //                {
    //                    ls = o.GetType().GetFields().Select((pi, i) => new Tuple<string, string, bool>(pi.Name, pi.GetValue(o).ToString(), qc.V(i))).ToList();
    //                }
    //            }
    //        }
    //        return PL.C(ls);
    //    }

    //    public override string ToString()
    //    {
    //        return String.Concat("{",
    //            String.Join(",",
    //                ps.Select(p => Q(p.Item1) + ":" + (p.Item3 ? Q(p.Item2) : p.Item2))),
    //            "}");
    //    }

    //    public static string Q(object x)
    //    {
    //        return "\"" + x.ToString() + "\"";
    //    }
    //}
}
