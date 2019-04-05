using System.Threading.Tasks;

namespace Utility.OpgAuth.Sso
{
    public interface IPlatform
    {
        Task<UserDetails> GetUserDetails();
    }
}
