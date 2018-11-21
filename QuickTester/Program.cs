using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Runtime.CompilerServices;
using Utility;

namespace QuickTester
{
    class Program
    {
        static void Main(string[] args)
        {
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

            Tuple<string, string, string> x1 = new Tuple<string, string, string>("Bob", "Jones", "Dog");
            Tuple<string, string, string> x2 = new Tuple<string, string, string>("Tom", "Arnold", "Cat");

            Tester t1 = new Tester("bob", "jones");
            Tester2 t2 = new Tester2("tom", "arnold");
            Tester t3 = new Tester("billy", "thorn");

            List<string> ls = new List<string>() { "Bob", "John", "Joe" };

            Dictionary<string, string> d = new Dictionary<string, string>()
            {
                { "Bob", "Jones" },
                { "Tom", "Arnold" }
            };

            Dictionary<string, string> d2 = new Dictionary<string, string>()
            {
                { "Name1", "Value1" },
                { "Name2", "Value2" }
            };

            Dictionary<string, object> d3 = new Dictionary<string, object>()
            {
                { "Name1", 5 },
                { "Name2", "Value2" }
            };

            Tuple<string, string, bool> tp1 = new Tuple<string, string, bool>("name1", "value1", true);
            Tuple<string, string, bool> tp2 = new Tuple<string, string, bool>("name2", "value2", true);
            List<Tuple<string, string, bool>> tpl1 = new List<Tuple<string, string, bool>>() { tp1, tp2 };

            List<object> as2 = new List<object>() { 5, "hello" };

            List<object> as3 = new List<object>() { t1, t3 };

            List<Tuple<string, string, string>> lts = new List<Tuple<string, string, string>>() { x1, x2 };

            var named = (first: "one", second: "two");

            string st1 = PL.C(new { x = 1, y = "Bob" }).ToString();
            string st1b = PL.C(new { x = 1, y = "Bob", z = "{}" }, new bool[] { true, true, false }).ToString(); ;
            string st2 = PL.C(t1).ToString(); 
            string st3 = PL.C(tpl1).ToString(); 
            string st4 = PL.C(d3).ToString(); 
            string st5 = PL.C("name", "bob").ToString(); 
            string st6 = PL.C(x1, new List<string>() { "FN", "LN", "PT" }).ToString();

            string st12 = PL.C(named).ToString();
            string st13 = PL.C(x1).ToString();
            var slc = lts.Select(lt => PL.C(lt));
            string st14 = A.C(slc).ToString();

            string st7 = JW.O(PL.N("name", st1));

            string st8 = PL.C(
                PL.N("ss", PL.C(PL.C(t1).Add(PL.C(tpl1)), PL.C(x1, new List<string>() { "FN", "LN", "PT" }))),
                PL.N("tt", PL.C(PL.C(t1).Add(PL.C(tpl1)), PL.C(x1, new List<string>() { "FN", "LN", "PT" }))),
                PL.N("zz", A.C(slc))
                ).ToString();

            List<string> as1 = new List<string>() { st1, st2, st3 };
            //string st8 = JW.A(SL.C(as1, false));

            //List<object> as2 = new List<object>() { 5, "hello" };
            //string st9 = JW.A(SL.C(as2, true));

            //List<object> as3 = new List<object>() { t1, t3 };
            //string st10 = JW.A(SL.C(as3, new List<string>() { "FieldOne" }));

            //List<Tuple<string, string, string>> lts = new List<Tuple<string, string, string>>() { x1, x2 };
            //string st11 = JW.A(SL.C(lts, new List<string>() { "FN", "LN", "PT" }, true));


            //PL pl1 = PL.C(x1, new List<string>() { "FN", "LN", "PT" });
            //List<PL> lpl1 = new List<PL>() { PL.C(t1), PL.C(t2) };

            //string s1 = JW.O(pl1);
            //string s2 = JW.OM(lpl1);

            //SL sl1 = SL.C(ls);
            //string s3 = JW.A(sl1);

            //List<Tuple<string, string, string>> lpl2 = 
            //    new List<Tuple<string, string, string>>() { x1, x2 };
            //string s4 = JW.A(SL.C(lpl2, new List<string>() { "FN", "LN", "PT" }, true));




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
            // O(PL, PL, PL) --> O
            // PL(name, PL) --> PL  ==  PL(name, O) --> PL
            // PL(name, SL) --> PL  ==  PL(name, A) --> PL
            // A(O==PL, A, SL) --> A

            // When you pass a list, I add them all together into one object or one array
            // When you pass a list, I create each as a separate object
            // IEnumerable json

            // When you pass a tree, I flatten the whole tree
            // When you pass a tree, I return a tree



            //string st1 = JW.O(PL.C(new { x = 1, y = "Bob" }));
            //string st1b = JW.O(PL.C(new { x = 1, y = "Bob", z = "{}" }, new bool[] { true, true, false }));
            //string st2 = JW.O(PL.C(t1));
            //string st3 = JW.O(PL.C(tpl1));
            //string st4 = JW.O(PL.C(d3));
            //string st5 = JW.O(PL.C("name", "bob"));
            //string st6 = JW.O(PL.C(x1, new List<string>() { "FN", "LN", "PT" }));

            //string st7 = JW.O(PL.N("name", st1));

            //List<string> as1 = new List<string>() { st1, st2, st3 };
            //string st8 = JW.A(SL.C(as1, false));

            //List<object> as2 = new List<object>() { 5, "hello" };
            //string st9 = JW.A(SL.C(as2, true));

            //List<object> as3 = new List<object>() { t1, t3 };
            //string st10 = JW.A(SL.C(as3, new List<string>() { "FieldOne" }));

            //List<Tuple<string, string, string>> lts = new List<Tuple<string, string, string>>() { x1, x2 };
            //string st11 = JW.A(SL.C(lts, new List<string>() { "FN", "LN", "PT" }, true));

            //var named = (first: "one", second: "two");
            //string st12 = JW.O(PL.C(named));
            //string st13 = JW.O(PL.C(x1));
            //string st14 = JW.O(PL.C(lts));
            //// Now consider a + operator for PL and SL

            //PL pl1 = PL.C(x1, new List<string>() { "FN", "LN", "PT" });
            //List<PL> lpl1 = new List<PL>() { PL.C(t1), PL.C(t2) };

            //string s1 = JW.O(pl1);
            //string s2 = JW.OM(lpl1);

            //SL sl1 = SL.C(ls);
            //string s3 = JW.A(sl1);

            //List<Tuple<string, string, string>> lpl2 = 
            //    new List<Tuple<string, string, string>>() { x1, x2 };
            //string s4 = JW.A(SL.C(lpl2, new List<string>() { "FN", "LN", "PT" }, true));


        }
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

    public class JW
    {
        public static string OM(IEnumerable<PL> pls/*, List<bool> qs*/)
        {

            //var output = numbers.SelectMany((n, ni) => animals.Select((s, si) => ((ni * animals.Count) + si) + s + n))

            //return String.Concat("{",
            //    String.Join(",",
            //        pls.SelectMany((pl, i) => pl.ps.Select(p => (qs[i] ? Q(p.Item1) : p.Item1) + 
            //                ":" + (qs[i] ? Q(p.Item2) : p.Item2)))),
            //    "}");

            return String.Concat("{",
                String.Join(",",
                    pls.SelectMany(pl => pl.ps).Select(p => Q(p.Item1) + ":" + Q(p.Item2))),
                "}");
        }

        public static string O(PL pl)
        {
            return String.Concat("{",
                String.Join(",",
                    pl.ps.Select(p => Q(p.Item1) + ":" + (p.Item3 ? Q(p.Item2) : p.Item2))),
                "}");
        }

        public static string O(IEnumerable<PL> pls)
        {
            return String.Concat("{",
                String.Join(",",
                    pls.Select(p => O(p))),
                "}");
        }

        public static string AM(IEnumerable<SL> sls/*, List<bool> qs*/)
        {
            //return String.Concat("[",
            //    String.Join(",",
            //        sls.SelectMany((sl, i) => sl.ls.Select(li => qs[i] ? Q(li) : li))),
            //    "}");

            return String.Concat("[",
                String.Join(",",
                    sls.SelectMany(sl => sl.ls).Select(li => Q(li.Item1))),
                "]");
        }

        public static string A(SL sl)
        {
            return String.Concat("[",
                String.Join(",",
                    sl.ls.Select(li => li.Item2 ? Q(li.Item1) : li.Item1)),
                "]");
        }

        public static string A(IEnumerable<SL> sl)
        {
            return String.Concat("[",
                String.Join(",",
                    sl.Select(li => A(li))),
                "]");
        }

        public static string A(string csv, IList<string> names)
        {
            StringBuilder sb = new StringBuilder("[");
            using (StringReader reader = new StringReader(csv))
            {
                string line;
                while ((line = reader.ReadLine()) != null)
                {
                    string[] cols = line.Split(',');
                    sb.Append("{");
                    for (int i = 0; i < names.Count; i++)
                        sb.Append(Q(names[i]) + ":" + Q(cols[i]) + ",");
                    sb.Remove(sb.Length - 1, 1);
                    sb.Append("},");
                }
                if (sb.Length > 1) sb.Remove(sb.Length - 1, 1);
                sb.Append("]");
            }
            return sb.ToString();
        }

        public static string Q(object x)
        {
            return "\"" + x.ToString() + "\"";
        }
    }

    public interface IJ
    {

    }

    public class O : IJ
    {
        IEnumerable<PL> pls = new List<PL>();

        public O(PL pl) { pls = new List<PL> { pl };  }

        public static O C(PL pl) { return new O(pl);  }

        public O(IEnumerable<PL> pls) { this.pls = pls; }

        public static O C(IEnumerable<PL> pls) { return new O(pls);  }

        public O(params PL[] pls) { this.pls = pls;  }

        public static O C(params PL[] pls) { return new O(pls);  }

        public override string ToString()
        {
            return String.Concat("{",
                String.Join(",",
                    pls.Select(p => p.ToString())),
                "}");
        }
    }

    // O(PL, PL, PL) --> O
    // PL(name, PL) --> PL  ==  PL(name, O) --> PL
    // PL(name, SL) --> PL  ==  PL(name, A) --> PL
    // A(O==PL, A, SL) --> A

    public class A : IJ
    {
        IEnumerable<IJ> js = new List<IJ>();

        public A(IJ j) { js = new List<IJ>() { j }; }

        public static A C(IJ j) { return new A(j); }

        public A(IEnumerable<IJ> js) { this.js = js; }

        public static A C(IEnumerable<IJ> js) { return new A(js); }

        public override string ToString()
        {
            return String.Concat("[",
                String.Join(",",
                    js.Select(p => p.ToString())),
                "]");
        }
    }

    public class SL : IJ
    {
        public List<Tuple<string, bool>> ls = new List<Tuple<string, bool>>();

        public SL(SL sl)
        {
            this.ls = sl.ls.ToList();
        }

        public SL Add(SL rhs)
        {
            SL lhs = new SL(this);
            lhs.ls.AddRange(rhs.ls);
            return lhs;
        }

        public static SL operator +(SL lhs, SL rhs)
        {
            return lhs.Add(rhs);
        }

        public SL(List<object> l, bool q = true)
        {
            ls = l.Select(x => new Tuple<string, bool>(x.ToString(), q)).ToList();
        }

        public static SL C(List<object> l, bool q = true)
        {
            return new SL(l, q);
        }

        public SL(List<string> l, bool q = true)
        {
            ls = l.Select(x => new Tuple<string, bool>(x.ToString(), q)).ToList();
        }

        public static SL C(List<string> l, bool q = true)
        {
            return new SL(l, q);
        }

        public SL(params SL[] sls) { this.ls.AddRange(sls.SelectMany(x => x.ls)); }

        public static SL C(params SL[] sls) { return new SL(sls); }

        public SL(List<object> os, List<string> names)
        {
            if (os != null && os.Count > 0)
            {
                if (names != null)
                {
                    ls = os.Select(o => new Tuple<string, bool>(JW.OM(names.Select((x, i) => PL.C(x,
                        o.GetType().GetField(x).GetValue(o).ToString()))), false)).ToList();
                }
                else
                {
                    ls = os.Select(o => new Tuple<string, bool>(JW.OM(o.GetType().GetFields()
                        .Select(pi => PL.C(pi.Name, pi.GetValue(o).ToString()))), false)).ToList();
                }
            }
        }

        public static SL C(List<object> os, List<string> names)
        {
            return new SL(os, names);
        }

        public static SL C<T>(List<T> os, List<string> names, bool tuples)
        {
            List<string> ls = new List<string>();
            if (os != null && os.Count > 0)
            {
                if (tuples)
                    ls = os.Select(o => JW.OM(names.Select((x, i) => PL.C(x,
                            o.GetType().GetProperty("Item" + (i + 1)).GetValue(o).ToString())))).ToList();
                else
                {
                    if (names != null)
                    {
                        ls = os.Select(o => JW.OM(names.Select((x, i) => PL.C(x,
                            o.GetType().GetField(x).GetValue(o).ToString())))).ToList();
                    }
                    else
                    {
                        ls = os.Select(o => JW.OM(o.GetType().GetFields()
                            .Select(pi => PL.C(pi.Name, pi.GetValue(o).ToString())))).ToList();
                    }
                }
            }
            return SL.C(ls, false);
        }

        public override string ToString()
        {
            return String.Concat("[",
                String.Join(",", ls.Select(li => li.Item2 ? Q(li.Item1) : li.Item1)),
            "]");
        }

        public static string Q(object x)
        {
            return "\"" + x.ToString() + "\"";
        }
    }

    public class PL : IJ
    {
        public List<Tuple<string, string, bool>> ps = new List<Tuple<string, string, bool>>();

        public PL(PL pl)
        {
            this.ps = pl.ps.ToList();
        }

        public PL Add(PL rhs)
        {
            PL lhs = new PL(this);
            lhs.ps.AddRange(rhs.ps);
            return lhs;
        }

        public static PL operator +(PL lhs, PL rhs)
        {
            return lhs.Add(rhs);
        }

        public static PL N(string k, string v, bool q = false)
        {
            return new PL(new Dictionary<string, object>() { { k, v } }, q);
        }

        public static PL N(string name, PL pl)
        {
            return new PL(new Dictionary<string, object>() { { name, PL.C(pl) } }, false);
        }

        public static PL N(string name, O o)
        {
            return new PL(new Dictionary<string, object>() { { name, o } }, false);
        }

        public static PL N(string name, SL sl)
        {
            return new PL(new Dictionary<string, object>() { { name, A.C(sl) } }, false);
        }

        public static PL N(string name, A a)
        {
            return new PL(new Dictionary<string, object>() { { name, a } }, false);
        }

        public PL(params PL[] pls) { this.ps.AddRange(pls.SelectMany(x => x.ps)); }

        public static PL C(params PL[] pls) { return new PL(pls); }

        public PL(List<Tuple<string, string, bool>> lps)
        {
            ps = lps;
        }

        public static PL C(List<Tuple<string, string, bool>> lps)
        {
            return new PL(lps);
        }

        public PL(string n, string v, bool q = true)
        {
            ps.Add(new Tuple<string, string, bool>(n, v, q));
        }

        public static PL C(string n, string v, bool q = true)
        {
            return new PL(n, v, q);
        }

        public PL(Dictionary<string, object> d, bool q = true)
        {
            if (d != null && d.Count > 0)
                ps = d.Select(x => new Tuple<string, string, bool>(x.Key, x.Value.ToString(), q)).ToList();
        }

        public static PL C(Dictionary<string, object> d, bool q = true)
        {
            return new PL(d, q);
        }

        public class QC
        {
            bool[] Quotes;
            public QC(bool[] quotes) { this.Quotes = quotes;  }

            public bool V(int i)
            {
                return (Quotes == null || Quotes.Length < i + 1) ? true : Quotes[i];
            }
        }

        public PL(object o, bool[] quotes = null)
        {
            QC qc = new QC(quotes);

            if (o != null)
            {
                if (o is ITuple)
                {
                    var tuple = o as ITuple;
                    for (int i = 0; i < tuple.Length; i++)
                        ps.Add(new Tuple<string, string, bool>("Item" + (i + 1), tuple[i].ToString(), qc.V(i)));
                }
                else if (o.GetType().ToString().Contains("AnonymousType"))
                    ps = o.GetType().GetProperties().Select((pi, i) =>
                        new Tuple<string, string, bool>(pi.Name, pi.GetValue(o).ToString(), qc.V(i))).ToList();
                else
                    ps = o.GetType().GetFields().Select((pi, i) => 
                        new Tuple<string, string, bool>(pi.Name, pi.GetValue(o).ToString(), qc.V(i))).ToList();
            }
        }

        public static PL C(object o, bool[] quotes = null)
        {
            return new PL(o, quotes);
        }

        public static PL C<T>(T o, List<string> names, bool[] quotes = null)
        {
            QC qc = new QC(quotes);
            List<Tuple<string, string, bool>> ls = new List<Tuple<string, string, bool>>();
            if (o != null)
            {
                if (o is ITuple)
                {
                    if (names != null && names.Count > 0)
                    {
                        var tuple = o as ITuple;
                        for (int i = 0; i < tuple.Length && i < names.Count; i++)
                            ls.Add(new Tuple<string, string, bool>(names[i], tuple[i].ToString(), qc.V(i)));
                    }
                    else
                    {
                        var tuple = o as ITuple;
                        for (int i = 0; i < tuple.Length && i < names.Count; i++)
                            ls.Add(new Tuple<string, string, bool>("Item" + (i + 1), tuple[i].ToString(), qc.V(i)));
                    }   
                }
                else if (o.GetType().ToString().Contains("AnonymousType"))
                {
                    if (names != null && names.Count > 0)
                    {
                        ls = o.GetType().GetProperties().Select((pi, i) =>
                            new Tuple<string, string, bool>(names[i], pi.GetValue(o).ToString(), qc.V(i))).ToList();
                    }
                    else
                    {
                        ls = o.GetType().GetProperties().Select((pi, i) =>
                            new Tuple<string, string, bool>(pi.Name, pi.GetValue(o).ToString(), qc.V(i))).ToList();
                    }
                }   
                else
                {
                    if (names != null && names.Count > 0)
                    {
                        ls = names.Select((n, i) => new Tuple<string, string, bool>(n, o.GetType().GetField(n).GetValue(o).ToString(), qc.V(i))).ToList();
                    }
                    else
                    {
                        ls = o.GetType().GetFields().Select((pi, i) => new Tuple<string, string, bool>(pi.Name, pi.GetValue(o).ToString(), qc.V(i))).ToList();
                    }
                }
            }
            return PL.C(ls);
        }

        public override string ToString()
        {
            return String.Concat("{",
                String.Join(",",
                    ps.Select(p => Q(p.Item1) + ":" + (p.Item3 ? Q(p.Item2) : p.Item2))),
                "}");
        }

        public static string Q(object x)
        {
            return "\"" + x.ToString() + "\"";
        }
    }
}
