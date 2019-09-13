using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Utility.GenericEntity;
using Random = Utility.Crypto.Random;

namespace Utility.OpgAuth.Sso
{
    public class Mock : Platform
    {
        private string[] _emails;
        private bool _isConsole = false;

        public override void Init(FrameworkWrapper fw, IGenericEntity init)
        {
            _isConsole = (init.GetS("Console")?.ParseBool() ?? false) && System.Diagnostics.Debugger.IsAttached;
            _emails = init.GetL("emails")?.Select(e => e.GetS("")).ToArray();
        }

        public override string PlatformType { get; } = "Mock";

        public override async Task<UserDetails> GetUserDetails(IGenericEntity authData)
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
            else e = _emails[Random.Number(0, _emails.Length - 1)];

            return new UserDetails(null, e, "Mock name", e, null, null, null);
        }
    }
}