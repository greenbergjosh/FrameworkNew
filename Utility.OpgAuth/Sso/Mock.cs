using System.Linq;
using System.Threading.Tasks;
using Utility.Crypto;

namespace Utility.OpgAuth.Sso
{
    public class Mock : Platform
    {
        private string[] _emails;

        public override void Init(FrameworkWrapper fw, IGenericEntity init)
        {
            _emails = init.GetL("emails").Select(e => e.GetS("")).ToArray();
        }

        public override string PlatformType { get; } = "Mock";

        public override async Task<UserDetails> GetUserDetails(IGenericEntity authData)
        {
            var e = _emails[Random.Number(0, _emails.Length - 1)];

            return new UserDetails("Mock name", e, null, null, null);
        }
    }
}