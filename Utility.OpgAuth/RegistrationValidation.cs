using System;
using System.Collections.Generic;
using System.Text;
using Utility.OpgAuth.Sso;

namespace Utility.OpgAuth
{
    public class RegistrationValidation
    {
        public static bool EmailIsAtOnpointglobal(UserDetails details)
        {
            return details.Email.ToLower().EndsWith("@onpointglobal.com");
        }

    }
}
