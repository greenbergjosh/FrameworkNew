using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace Utility
{
        public class QC
        {
            bool[] Quotes;
            public QC(bool[] quotes) { this.Quotes = quotes; }

            public bool V(int i)
            {
                return (Quotes == null || Quotes.Length < i + 1) ? true : Quotes[i];
            }

            public static string Q(object x)
            {
                return "\"" + x.ToString() + "\"";
            }
        }

        public interface IJ { }

        public class A : IJ
        {
            public List<IJ> js = new List<IJ>();

            public A() { }

            public static A C() { return new A(); }

            public A(IEnumerable<IJ> js) { this.js.AddRange(js); }

            public static A C(IEnumerable<IJ> js) { return new A(js); }

            public A(params IJ[] js) { this.js.AddRange(js); }

            public static A C(params IJ[] js) { return new A(js); }

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

            public SL() { }

            public static SL C() { return new SL(); }

            public SL(SL sl) { this.ls.AddRange(sl.ls); }

            public SL(params SL[] sls) { this.ls.AddRange(sls.SelectMany(x => x.ls)); }

            public static SL C(params SL[] sls) { return new SL(sls); }

            public SL(IEnumerable<SL> sls) { this.ls.AddRange(sls.SelectMany(x => x.ls)); }

            public static SL C(IEnumerable<SL> sls) { return new SL(sls); }

            public SL(List<Tuple<string, bool>> sls) { ls.AddRange(sls); }

            public static SL C(List<Tuple<string, bool>> sls) { return new SL(sls); }

            public SL(string n, bool q = true)
            {
                ls.Add(new Tuple<string, bool>(n, q));
            }

            public static SL C(string n, bool q = true)
            {
                return new SL(n, q);
            }

            public SL Add(params SL[] sls)
            {
                this.ls.AddRange(sls.SelectMany(x => x.ls));
                return this;
            }

            public SL Add(IEnumerable<SL> sls)
            {
                this.ls.AddRange(sls.SelectMany(x => x.ls));
                return this;
            }

            public SL(IEnumerable<object> l, bool q = true)
            {
                ls.AddRange(l.Select(x => new Tuple<string, bool>(x.ToString(), q)));
            }

            public static SL C(IEnumerable<object> l, bool q = true)
            {
                return new SL(l, q);
            }

            public SL(List<object> os, List<string> names)
            {
                if (os != null && os.Count > 0)
                {
                    if (names != null)
                    {
                        ls.AddRange(os.Select(o => new Tuple<string, bool>(PL.OM(names.Select((x, i) => PL.C(x,
                            o.GetType().GetField(x).GetValue(o).ToString()))), false)));
                    }
                    else
                    {
                        ls.AddRange(os.Select(o => new Tuple<string, bool>(PL.OM(o.GetType().GetFields()
                            .Select(pi => PL.C(pi.Name, pi.GetValue(o).ToString()))), false)));
                    }
                }
            }

            public static SL C(List<object> os, List<string> names)
            {
                return new SL(os, names);
            }

            public static int TrailingInt(string s)
            {
                return Int32.Parse(string.Concat(s.ToArray().Reverse().TakeWhile(char.IsNumber).Reverse()));
            }

            public static SL AO<T>(IList<T> os, List<string> names = null, bool[] quotes = null)
            {
                QC qc = new QC(quotes);
                List<string> ls = new List<string>();
                if (os != null && os.Count > 0)
                {
                    if (os[0] is ITuple)
                    {
                        if (names != null && names.Count > 0)
                        {
                            ls.AddRange(os.Select(o => PL.OM(names.Select((x, i) => PL.C(x,
                                ((ITuple)o)[i].ToString(), qc.V(i))))));
                        }
                        else
                        {
                            foreach (T o in os)
                            {
                                ITuple tuple = (ITuple)o;
                                List<Tuple<string, string>> fields = new List<Tuple<string, string>>();
                                for (int i = 0; i < tuple.Length; i++)
                                    fields.Add(new Tuple<string, string>("Tuple" + (i + 1), tuple[i].ToString()));

                                ls.Add(PL.OM(fields.Select((x, i) => PL.C(x.Item1, x.Item2, qc.V(i)))));
                            }

                        }
                    }
                    else if (typeof(T).ToString().Contains("AnonymousType"))
                    {
                        if (names != null && names.Count > 0)
                        {
                            ls = os.Select(o => PL.OM(names.Select((x, i) => PL.C(x,
                                o.GetType().GetProperty(x).GetValue(o).ToString(), qc.V(i))))).ToList();
                        }
                        else
                        {
                            ls = os.Select(o => PL.OM(names.Select((x, i) => PL.C(x,
                                o.GetType().GetProperty("Item" + (i + 1)).GetValue(o).ToString(), qc.V(i))))).ToList();
                        }
                    }
                    else
                    {
                        if (names != null && names.Count > 0)
                        {
                            ls = os.Select(o => PL.OM(names.Select((x, i) => PL.C(x,
                                o.GetType().GetField(x).GetValue(o).ToString(), qc.V(i))))).ToList();
                        }
                        else
                        {
                            ls = os.Select(o => PL.OM(o.GetType().GetFields()
                                .Select((pi, i) => PL.C(pi.Name, pi.GetValue(o).ToString(), qc.V(i))))).ToList();
                        }
                    }
                }
                return SL.C(ls, false);
            }

            public override string ToString()
            {
                return String.Join(",", ls.Select(li => li.Item2 ? QC.Q(li.Item1) : li.Item1));
            }
        }

        public class PL : IJ
        {
            public List<Tuple<string, string, bool>> ps = new List<Tuple<string, string, bool>>();

            public PL() { }

            public static PL C() { return new PL(); }

            public PL(PL pl) { this.ps.AddRange(pl.ps); }

            public PL(params PL[] pls) { this.ps.AddRange(pls.SelectMany(x => x.ps)); }

            public static PL C(params PL[] pls) { return new PL(pls); }

            public PL(IEnumerable<PL> pls) { this.ps.AddRange(pls.SelectMany(x => x.ps)); }

            public static PL C(IEnumerable<PL> pls) { return new PL(pls); }

            public PL(List<Tuple<string, string, bool>> lps) { this.ps.AddRange(lps); }

            public static PL C(List<Tuple<string, string, bool>> lps) { return new PL(lps); }

            public PL(string n, string v, bool q = true)
            {
                ps.Add(new Tuple<string, string, bool>(n, v, q));
            }

            public static PL C(string n, string v, bool q = true)
            {
                return new PL(n, v, q);
            }

            public PL Add(params PL[] pls)
            {
                this.ps.AddRange(pls.SelectMany(x => x.ps));
                return this;
            }

            public PL Add(IEnumerable<PL> pls)
            {
                this.ps.AddRange(pls.SelectMany(x => x.ps));
                return this;
            }

            public PL Add(string name, bool addEmpty, params PL[] pls)
            {
                return Add(name, addEmpty, pls.ToList());
            }

            public PL Add(string name, bool addEmpty, IEnumerable<PL> pls)
            {
                if (pls != null && pls.Any()) { this.Add(PL.N(name, A.C(pls.Select(pl => PL.C(pl))))); }
                else if (addEmpty) { this.Add(PL.N(name, A.C())); }
                return this;
            }

            public static PL N(string k, string v, bool q = false)
            {
                return new PL(new Dictionary<string, object>() { { k, v } }, q);
            }

            public static PL N(string name, PL pl, bool addEmpty = false)
            {
                if (pl.ps != null && pl.ps.Count > 0) return PL.C(name, PL.C(pl).ToString(), false);
                else if (addEmpty) return PL.N(name, "{}", false);
                return PL.C();
            }

            public static PL N(string name, SL sl, bool addEmpty = false)
            {
                if (sl.ls != null && sl.ls.Count > 0) return PL.C(name, A.C(sl).ToString(), false);
                else if (addEmpty) return PL.N(name, "[]", false);
                return PL.C();
            }

            public static PL N(string name, A a, bool addEmpty = false)
            {
                if (a.js != null && a.js.Count > 0) return PL.C(name, a.ToString(), false);
                else if (addEmpty) return PL.N(name, "[]", false);
                return PL.C();
            }

            public PL(IDictionary<string, object> d, bool q = true)
            {
                if (d != null && d.Count > 0)
                    this.ps.AddRange(d.Select(x => new Tuple<string, string, bool>(x.Key, x.Value.ToString(), q)));
            }

            public static PL D(IDictionary<string, object> d, bool q = true)
            {
                return new PL(d, q);
            }

            public static string OM(IEnumerable<PL> pls)
            {
                return String.Concat("{",
                    String.Join(",",
                        pls.SelectMany(pl => pl.ps).Select(p => QC.Q(p.Item1) + ":" + (p.Item3 ? QC.Q(p.Item2) : p.Item2))),
                    "}");
            }

            public static PL O(IEnumerable<object> os, List<List<string>> names = null, bool[][] quotes = null)
            {
                return PL.C(os.Select((o, i) => PL.O(o,
                    (names != null && names.Count > i) ? names[i] : null,
                    (quotes != null && quotes.Length > i) ? quotes[i] : null)));
            }

            public static PL O(object o, List<string> names = null, bool[] quotes = null)
            {
                if (o is IDictionary<string, object>) throw new Exception("Use PL.D for IDictionary<>");
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
                            for (int i = 0; i < tuple.Length; i++)
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
                        ps.Select(p => QC.Q(p.Item1) + ":" + (p.Item3 ? QC.Q(p.Item2) : p.Item2))),
                    "}");
            }
        }
}
