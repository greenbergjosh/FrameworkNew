using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace Utility
{
    public class QC
    {
        private bool[] Quotes;
        public QC(bool[] quotes) => Quotes = quotes;

        public bool V(int i) => (Quotes == null || Quotes.Length < i + 1) ? true : Quotes[i];

        public static string Q(object x) => x != null ? "\"" + x.ToString() + "\"" : "null";
    }

    public interface IJ { }

    public class A : IJ
    {
        public List<IJ> js = new List<IJ>();

        public A() { }

        public static A C() => new A();

        public A(IEnumerable<IJ> js) => this.js.AddRange(js);

        public static A C(IEnumerable<IJ> js) => new A(js);

        public A(params IJ[] js) => this.js.AddRange(js);

        public static A C(params IJ[] js) => new A(js);

        public override string ToString()
        {
            return string.Concat("[",
                string.Join(",",
                    js.Select(p => p.ToString())),
                "]");
        }
    }

    public class SL : IJ
    {
        public List<Tuple<string, bool>> ls = new List<Tuple<string, bool>>();

        public SL() { }

        public static SL C() => new SL();

        public SL(SL sl)
        {
            if (sl != null)
            {
                ls.AddRange(sl.ls);
            }
        }

        public SL(params SL[] sls) => ls.AddRange(sls.SelectMany(x => x.ls));

        public static SL C(params SL[] sls) => new SL(sls);

        public SL(IEnumerable<SL> sls)
        {
            if (sls != null)
            {
                ls.AddRange(sls.SelectMany(x => x.ls));
            }
        }

        public static SL C(IEnumerable<SL> sls) => new SL(sls);

        public SL(List<Tuple<string, bool>> sls)
        {
            if (sls != null)
            {
                ls.AddRange(sls);
            }
        }

        public static SL C(List<Tuple<string, bool>> sls) => new SL(sls);

        public SL(string n, bool q = true) => ls.Add(new Tuple<string, bool>(n, q));

        public static SL C(string n, bool q = true) => new SL(n, q);

        public SL Add(params SL[] sls)
        {
            ls.AddRange(sls.SelectMany(x => x.ls));
            return this;
        }

        public SL Add(IEnumerable<SL> sls)
        {
            if (sls != null) this.ls.AddRange(sls.SelectMany(x => x.ls));
            return this;
        }

        public SL(IEnumerable<object> l, bool q = true)
        {
            if (l != null) ls.AddRange(l.Select(x => new Tuple<string, bool>(x.ToString(), q)));
        }

        public static SL C(IEnumerable<object> l, bool q = true) => new SL(l, q);

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

        public static SL C(List<object> os, List<string> names) => new SL(os, names);

        public static SL AO<T>(IList<T> os, List<string> names = null, bool[] quotes = null)
        {
            var qc = new QC(quotes);
            var ls = new List<string>();
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
                        foreach (var o in os)
                        {
                            var tuple = (ITuple)o;
                            var fields = new List<Tuple<string, string>>();
                            for (var i = 0; i < tuple.Length; i++)
                            {
                                fields.Add(new Tuple<string, string>("Tuple" + (i + 1), tuple[i].ToString()));
                            }

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

        public override string ToString() => string.Join(",", ls.Select(li => li.Item2 ? QC.Q(li.Item1) : li.Item1));
    }

    public class PL : IJ
    {
        private static Dictionary<Type, JsonToPlAction> jsonActions = new Dictionary<Type, JsonToPlAction>
        {
            { typeof(string), new JsonToPlAction(true) },
            { typeof(DateTime), new JsonToPlAction(true) },
            { typeof(long), new JsonToPlAction(false) },
            { typeof(double), new JsonToPlAction(false) },
            { typeof(bool), new JsonToPlAction(false, o => (bool) o ? "true" : "false") }
        };

        public List<Tuple<string, string, bool>> ps = new List<Tuple<string, string, bool>>();

        public PL() { }

        public static PL C() => new PL();

        public PL(PL pl)
        {
            if (pl != null)
            {
                ps.AddRange(pl.ps);
            }
        }

        public PL(params PL[] pls) => ps.AddRange(pls.SelectMany(x => x.ps));

        public static PL C(params PL[] pls) => new PL(pls);

        public PL(IEnumerable<PL> pls)
        {
            if (pls != null)
            {
                ps.AddRange(pls.SelectMany(x => x.ps));
            }
        }

        public static PL C(IEnumerable<PL> pls) => new PL(pls);

        public PL(List<Tuple<string, string, bool>> lps)
        {
            if (lps != null)
            {
                ps.AddRange(lps);
            }
        }

        public static PL C(List<Tuple<string, string, bool>> lps) => new PL(lps);

        public PL(string n, string v, bool q = true) => ps.Add(new Tuple<string, string, bool>(n, v, q));

        public static PL FromJsonString(string json)
        {
            var des = JsonConvert.DeserializeObject(json);

            if (des is JObject)
            {
                var jobj = (JObject)des;
                var pl = new PL();

                foreach (var p in jobj.Properties())
                {
                    if (p.Value is JValue val)
                    {
                        if (val.Value != null)
                        {
                            var t = val.Value.GetType();
                            var a = jsonActions.GetValueOrDefault(t);

                            if (a != null) pl.Add(PL.N(p.Name, a.Mutate(val.Value), a.Quote));
                            else throw new NotImplementedException();
                        }
                    }
                    else if(p.Value is JToken) pl.Add(PL.N(p.Name, p.Value.ToString()));
                    else throw new NotImplementedException();
                }

                return pl;
            }
            else throw new NotImplementedException();
        }

        public static PL C(string n, string v, bool q = true) => new PL(n, v, q);

        public static PL C(string n, int v) => new PL(n, v.ToString(), false);

        public static PL C(string n, short v) => new PL(n, v.ToString(), false);

        public static PL C(string n, long v) => new PL(n, v.ToString(), false);

        public static PL C(string n, bool v) => new PL(n, v.ToString(), false);

        public static PL C(string n, decimal v) => new PL(n, v.ToString(), false);

        public static PL C(string n, double v) => new PL(n, v.ToString(), false);

        public PL Add(params PL[] pls)
        {
            ps.AddRange(pls.SelectMany(x => x.ps));
            return this;
        }

        public PL Add(IEnumerable<PL> pls)
        {
            if (pls != null) this.ps.AddRange(pls.SelectMany(x => x.ps));
            return this;
        }

        public PL Add(string name, bool addEmpty, params PL[] pls) => Add(name, addEmpty, pls.ToList());

        public PL Add(string name, bool addEmpty, IEnumerable<PL> pls)
        {
            if (pls != null && pls.Any()) { Add(PL.N(name, A.C(pls.Select(pl => PL.C(pl))))); }
            else if (addEmpty) { Add(PL.N(name, A.C())); }
            return this;
        }

        public static PL N(string k, string v, bool q = false) => new PL(new Dictionary<string, object>() { { k, v } }, q);

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
            if (d != null && d.Count > 0) ps.AddRange(d.Select(x => new Tuple<string, string, bool>(x.Key, x.Value.ToString(), q)));
        }

        public static PL D(IDictionary<string, object> d, bool q = true) => new PL(d, q);

        public static string OM(IEnumerable<PL> pls)
        {
            return string.Concat("{",
                string.Join(",",
                    pls.SelectMany(pl => pl.ps).Select(p => QC.Q(p.Item1) + ":" + (p.Item3 ? QC.Q(p.Item2) : p.Item2))),
                "}");
        }

        public static PL O(IEnumerable<object> os, List<List<string>> names = null, bool[][] quotes = null)
        {
            return PL.C(os.Select((o, i) => PL.O(o,
                (names != null && names.Count > i) ? names[i] : null,
                (quotes != null && quotes.Length > i) ? quotes[i] : null)));
        }

        public static PL O(object o, bool[] quotes) => PL.O(o, null, quotes);

        public static PL O(object o, List<string> names = null, bool[] quotes = null)
        {
            if (o is IDictionary<string, object>) throw new Exception("Use PL.D for IDictionary<>");

            var qc = new QC(quotes);
            var ls = new List<Tuple<string, string, bool>>();
            if (o != null)
            {
                if (o is ITuple)
                {
                    if (names != null && names.Count > 0)
                    {
                        var tuple = o as ITuple;
                        for (var i = 0; i < tuple.Length && i < names.Count; i++)
                        {
                            ls.Add(new Tuple<string, string, bool>(names[i], tuple[i]?.ToString(), qc.V(i)));
                        }
                    }
                    else
                    {
                        var tuple = o as ITuple;
                        for (var i = 0; i < tuple.Length; i++)
                        {
                            ls.Add(new Tuple<string, string, bool>("Item" + (i + 1), tuple[i]?.ToString(), qc.V(i)));
                        }
                    }
                }
                else if (o.GetType().ToString().Contains("AnonymousType"))
                {
                    if (names != null && names.Count > 0)
                    {
                        ls = o.GetType().GetProperties().Select((pi, i) =>
                            new Tuple<string, string, bool>(names[i], pi.GetValue(o)?.ToString(), qc.V(i))).ToList();
                    }
                    else
                    {
                        ls = o.GetType().GetProperties().Select((pi, i) =>
                            new Tuple<string, string, bool>(pi.Name, pi.GetValue(o)?.ToString(), qc.V(i))).ToList();
                    }
                }
                else
                {
                    if (names != null && names.Count > 0)
                    {
                        ls = names.Select((n, i) => new Tuple<string, string, bool>(n, o.GetType().GetField(n).GetValue(o)?.ToString(), qc.V(i))).ToList();
                    }
                    else
                    {
                        ls = o.GetType().GetFields().Select((pi, i) => new Tuple<string, string, bool>(pi.Name, pi.GetValue(o)?.ToString(), qc.V(i))).ToList();
                    }
                }
            }
            return PL.C(ls);
        }

        public override string ToString()
        {
            return string.Concat("{",
                string.Join(",",
                    ps.Select(p => QC.Q(p.Item1) + ":" + (p.Item3 ? QC.Q(p.Item2) : p.Item2))),
                "}");
        }

        private class JsonToPlAction
        {
            public JsonToPlAction(bool quote) => Quote = quote;

            public JsonToPlAction(bool quote, Func<object, string> mutate)
            {
                Quote = quote;
                Mutate = mutate;
            }

            public bool Quote { get; }
            public Func<object, string> Mutate { get; } = o => o.ToString();
        }

    }
}
