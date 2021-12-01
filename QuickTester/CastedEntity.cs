using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Utility;
using Utility.Entity;
using Utility.Entity.Implementations;

namespace QuickTester
{
    public class CastedEntity
    {
        private static Entity e;

        public CastedEntity() { }

        public CastedEntity(int b) => e = e.Create(b);
        public CastedEntity(bool b) => e = e.Create(b);

        public CastedEntity(string b) => e = e.Create(b);

        public CastedEntity(object o) => e = e.Create(o);

        public static implicit operator CastedEntity(int b) => new(b);
        public static implicit operator CastedEntity(bool b) => new(b);
        public static implicit operator CastedEntity(string s) => new(s);
        public static implicit operator CastedEntity(Dictionary<string, CastedEntity> d) => new(d);

        public static async Task Run()
        {
            var fw = await FrameworkWrapper.Create();

            e = fw.Entity;

            CastedEntity i = 3;
            CastedEntity s = "bob";
            CastedEntity b = false;
            CastedEntity d2 = new Dictionary<string, CastedEntity> { ["a"] = 1, ["b"] = true };
        }
    }
}
