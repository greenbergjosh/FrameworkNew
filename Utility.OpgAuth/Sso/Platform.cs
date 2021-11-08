using System.Threading.Tasks;

namespace Utility.OpgAuth.Sso
{
    public abstract class Platform
    {
        public abstract Task Init(FrameworkWrapper fw, Entity.Entity init);

        public abstract string PlatformType { get; }

        public abstract Task<UserDetails> GetUserDetails(Entity.Entity authData);
    }
}
