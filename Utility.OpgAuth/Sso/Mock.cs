﻿using System;
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

        public override void Init(FrameworkWrapper fw, IGenericEntity init)
        {
            _isConsole = (init.GetS("Console")?.ParseBool() ?? false) && System.Diagnostics.Debugger.IsAttached;
            _emails = init.GetL("emails")?.Select(e => e.GetS("")).ToArray();
        }

        public override string PlatformType { get; } = "Mock";

        public override async Task<UserDetails> GetUserDetails(IGenericEntity authData)
        {
            if (_isConsole)
            {
                var rx = new Regex(@"\.+@\.+");
                string email;

                do
                {
                    Console.WriteLine("Enter email address:");
                    email = Console.ReadLine();
                    Console.WriteLine("");
                } while (!email.IsMatch(rx));
            }

            var e = _emails[Random.Number(0, _emails.Length - 1)];

            return new UserDetails(e, "Mock name", e, null, null, null);
        }
    }
}