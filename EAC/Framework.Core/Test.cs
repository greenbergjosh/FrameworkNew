using System.Threading.Tasks;

namespace Framework.Core
{
    public static class CSharpStaticCode
    {
        public static Task<object> Test2(State s)
        {
            return Task.FromResult(s.Get("p1") + s.Get("p2"));
        }
    }
}
