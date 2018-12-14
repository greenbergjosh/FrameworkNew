using System;
using System.Collections.Generic;
using System.Text;

namespace Utility
{
    public static class Extensions
    {
        public static int? ParseInt(this string str) => int.TryParse(str, out var i) ? i : (int?)null;
    }
}
