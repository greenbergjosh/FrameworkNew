using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
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

            List<string> ls = new List<string>() { "Bob", "John", "Joe" };

            Dictionary<string, string> d = new Dictionary<string, string>()
            {
                { "Bob", "Jones" },
                { "Tom", "Arnold" }
            };

            PL pl1 = PL.C(x1, new List<string>() { "FN", "LN", "PT" }, true);
            List<PL> lpl1 = new List<PL>() { PL.C(t1), PL.C(t2) };

            string s1 = JW.O(pl1);
            string s2 = JW.OM(lpl1, new List<bool> { true, true });

            SL sl1 = SL.C(ls);
            string s3 = JW.A(sl1);

            List<Tuple<string, string, string>> lpl2 = 
                new List<Tuple<string, string, string>>() { x1, x2 };
            string s4 = JW.A(SL.C(lpl2, new List<string>() { "FN", "LN", "PT" }, true), false);
            

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
        public static string OM(IEnumerable<PL> pls, List<bool> qs)
        {

            //var output = numbers.SelectMany((n, ni) => animals.Select((s, si) => ((ni * animals.Count) + si) + s + n))

            return String.Concat("{",
                String.Join(",",
                    pls.SelectMany((pl, i) => pl.ps.Select(p => (qs[i] ? Q(p.Item1) : p.Item1) + 
                            ":" + (qs[i] ? Q(p.Item2) : p.Item2)))),
                "}");

            //return String.Concat("{",
            //    String.Join(",",
            //        pls.SelectMany(pl => pl.ps).Select(p => Q(p.Item1) + ":" + Q(p.Item2))),
            //    "}");
        }

        public static string O(PL pl)
        {
            return String.Concat("{",
                String.Join(",",
                    pl.ps.Select(p => Q(p.Item1) + ":" + Q(p.Item2))),
                "}");
        }

        public static string O(IEnumerable<PL> pls)
        {
            return String.Concat("{",
                String.Join(",",
                    pls.Select(p => O(p))),
                "}");
        }

        public static string AM(IEnumerable<SL> sls, List<bool> qs)
        {
            return String.Concat("[",
                String.Join(",",
                    sls.SelectMany((sl, i) => sl.ls.Select(li => qs[i] ? Q(li) : li))),
                "}");

            //return String.Concat("[",
            //    String.Join(",",
            //        sls.SelectMany(sl => sl.ls).Select(li => Q(li))),
            //    "]");
        }

        public static string A(SL sl, bool quote = true)
        {
            return String.Concat("[",
                String.Join(",",
                    sl.ls.Select(li => quote ? Q(li) : li)),
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

    public class SL
    {
        public List<string> ls = new List<string>();

        public SL(List<object> l)
        {
            ls = l.Select(x => x.ToString()).ToList();
        }

        public static SL C(List<object> l)
        {
            return new SL(l);
        }

        public SL(List<string> l)
        {
            ls = l.Select(x => x.ToString()).ToList();
        }

        public static SL C(List<string> l)
        {
            return new SL(l);
        }

        public SL(List<object> os, List<string> names)
        {
            if (os != null && os.Count > 0)
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
            return SL.C(ls);
        }
    }

    public class PL
    {
        public List<Tuple<string, string>> ps = new List<Tuple<string, string>>();

        public static PL N(string k, string v)
        {
            return new PL(new Dictionary<string, object>() { { k, v } });
        }

        public PL(List<Tuple<string, string>> lps)
        {
            ps = lps;
        }

        public static PL C(List<Tuple<string, string>> lps)
        {
            return new PL(lps);
        }

        public PL(string n, string v)
        {
            ps.Add(new Tuple<string, string>(n, v));
        }

        public static PL C(string n, string v)
        {
            return new PL(n, v);
        }

        public PL(Dictionary<string, object> d)
        {
            if (d != null && d.Count > 0)
                ps = d.Select(x => new Tuple<string, string>(x.Key, x.Value.ToString())).ToList();
        }

        public static PL C(Dictionary<string, object> d)
        {
            return new PL(d);
        }

        public PL(object o)
        {
            if (o != null)
            {
                ps = o.GetType().GetFields().Select(pi => new Tuple<string, string>(pi.Name, pi.GetValue(o).ToString())).ToList();
            }
        }

        public static PL C(object o)
        {
            return new PL(o);
        }

        public static PL C<T>(T o, List<string> names, bool tuple)
        {
            List<Tuple<string, string>> ls = new List<Tuple<string, string>>();
            if (o != null)
            {
                if (tuple)
                {
                    ls = names.Select((n, i) => new Tuple<string, string>(n, o.GetType().GetProperty("Item" + (i + 1)).GetValue(o).ToString())).ToList();
                }
                else
                {
                    if (names != null && names.Count > 0)
                    {
                        ls = names.Select(n => new Tuple<string, string>(n, o.GetType().GetField(n).GetValue(o).ToString())).ToList();
                    }
                    else
                    {
                        ls = o.GetType().GetFields().Select(pi => new Tuple<string, string>(pi.Name, pi.GetValue(o).ToString())).ToList();
                    }
                }
            }
            return PL.C(ls);
        }
    }
}
