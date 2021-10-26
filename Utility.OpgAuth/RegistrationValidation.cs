using System.Linq;
using System.Text.RegularExpressions;
using Utility.OpgAuth.Sso;

namespace Utility.OpgAuth
{
    public class RegistrationValidation
    {
        public static bool DefaultAutoRegister(UserDetails details) => Auth.GetConfig().GetL("AutoRegisterDomains").Any(d =>
                                                                                 {
                                                                                     try
                                                                                     {
                                                                                         return Regex.IsMatch(details.Email, d.GetS(""));
                                                                                     }
                                                                                     catch
                                                                                     {
                                                                                         return false;
                                                                                     }
                                                                                 });
    }
}