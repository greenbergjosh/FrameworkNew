using System;
using System.Linq;

namespace Utility
{
    public static class StringWrapper
    {
        //(string l1, string r1) = "".SplitOnChar(' ');
        //(string l2, string r2) = " ".SplitOnChar(' ');
        //(string l3, string r3) = "  ".SplitOnChar(' ');
        //(string l4, string r4) = "   ".SplitOnChar(' ');
        //(string l5, string r5) = "http://abc.com".SplitOnChar(' ');
        //(string l6, string r6) = "http://abc.com ".SplitOnChar(' ');
        //(string l7, string r7) = "http://abc.com {x}".SplitOnChar(' ');
        public static (string Left, string Right) SplitOnChar(this string s, char c)
        {
            if (s == null) return (Left: null, Right: null);
            if (s == "") return (Left: "", Right: "");
            int idx = s.IndexOf(c);
            if (idx == -1) return (Left: s, Right: null);
            if (idx == 0) return (Left: "", Right: ((s.Length == 1) ? "" : s.Substring(1, s.Length-1)));
            return (Left: s.Substring(0, idx), Right: ((idx + 1 == s.Length) ? "" :
                s.Substring(idx + 1, s.Length - idx - 1)));
        }

        public static int TrailingInt(string s) => int.Parse(string.Concat(s.ToArray().Reverse().TakeWhile(char.IsNumber).Reverse()));
    }
}
