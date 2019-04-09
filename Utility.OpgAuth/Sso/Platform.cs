using System.Threading.Tasks;

namespace Utility.OpgAuth.Sso
{
    public abstract class Platform
    {
        public abstract void Init(FrameworkWrapper fw, IGenericEntity init);

        public abstract string PlatformType { get; }

        public abstract Task<UserDetails> GetUserDetails(IGenericEntity authData);
    }
}
