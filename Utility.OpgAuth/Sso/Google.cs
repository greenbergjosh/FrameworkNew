using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Utility.OpgAuth.Sso
{
    public class Google : IPlatform
    {
        public Google(string authData)
        {

        }

        public async Task<UserDetails> GetUserDetails()
        {
            throw new NotImplementedException();
        }
    }
}
