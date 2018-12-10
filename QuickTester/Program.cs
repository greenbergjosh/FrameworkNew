using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Runtime.CompilerServices;
using Utility;
using static Utility.EdwBulkEvent;
using System.Reflection;

using System.Threading.Tasks;
using Jw = Utility.JsonWrapper;
using Microsoft.AspNetCore.WebUtilities;

namespace QuickTester
{
    class Program
    {
        static void Main(string[] args)
        {

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
                "Utility.FileSystem", "QuotePathParts");
            object[] parms = new object[]
                {
                    @"c:\program files\long line\abc\efg.txt"
                };
            string s = (string)mi.Invoke(null, parms);
            mi = Utility.AssemblyResolver.GetMethod(Directory.GetCurrentDirectory() + "\\" + "Utility.dll",
                "Utility.FileSystem", "QuotePathParts");
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
