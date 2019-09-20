using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Utility.OpgAuth.Sso;

namespace Utility.OpgAuth
{
    public class RegistrationValidation
    {
        public static bool DefaultAutoRegister(UserDetails details)
        {
            return Auth.GetConfig().GetL("AutoRegisterDomains").Any(d =>
            {
                try
                {
                    return Regex.IsMatch(d.GetS(""), details.Email);
                }
                catch (Exception e)
                {
                    return false;
                }
            });
        }
    }
}