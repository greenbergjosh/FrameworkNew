using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Random = Utility.Crypto.Random;

namespace Utility.OpgAuth.Sso
{
    public class Mock : Platform
    {
        private string[] _emails;
        private bool _isConsole = false;

        public override async Task Init(FrameworkWrapper fw, Entity.Entity init)
        {
            _isConsole = ((await init.GetS("Console"))?.ParseBool() ?? false) && System.Diagnostics.Debugger.IsAttached;
            _emails = (await init.GetL<string>("emails")).ToArray();
        }

        public override string PlatformType { get; } = "Mock";

        public override Task<UserDetails> GetUserDetails(Entity.Entity authData)
        {
            string e;

            if (_isConsole)
            {
                var rx = new Regex(@"^[^@]+@[^@]+\.[^@.]+$");

                do
                {
                    Console.WriteLine("Enter email address:");
                    e = Console.ReadLine();
                    Console.WriteLine("");
                } while (!e.IsMatch(rx));
            }
            else
            {
                e = _emails[Random.Number(0, _emails.Length - 1)];
            }

            return Task.FromResult(new UserDetails(null, e, "Mock name", e, null, null, null));
        }
    }
}