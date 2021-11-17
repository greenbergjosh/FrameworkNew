using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Utility.OpgAuth.Sso;

namespace Utility.OpgAuth
{
    public class RegistrationValidation
    {
        public static async Task<bool> DefaultAutoRegister(UserDetails details) => (await (await Auth.GetConfig()).EvalL<string>("AutoRegisterDomains")).Any(d =>
        {
            try
            {
                return Regex.IsMatch(details.Email, d);
            }
            catch
            {
                return false;
            }
        });
    }
}