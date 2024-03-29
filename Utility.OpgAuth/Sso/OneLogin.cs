﻿using System;
using System.Threading.Tasks;

namespace Utility.OpgAuth.Sso
{
    public class OneLogin : Platform
    {
        private Entity.Entity _config;

        public override Task Init(FrameworkWrapper fw, Entity.Entity init)
        {
            _config = init;
            return Task.CompletedTask;
        }

        public override string PlatformType { get; } = "OneLogin";

        public override async Task<UserDetails> GetUserDetails(Entity.Entity authData)
        {
            try
            {
                var token = await authData .EvalS("accessToken");

                var baseUrl = new Uri(await _config.EvalS("baseUrl"));
                var userDetailsPath = await _config.EvalS("userDetailsPath");

                var url = new Uri(baseUrl, userDetailsPath).ToString();

                var (success, body) = await ProtocolClient.HttpGetAsync(url,
                    new (string key, string value)[]
                    {
                        ("Authorization", "Bearer " + token)
                    });

                var ge = await authData.Parse("application/json", body);

                if (!success)
                {
                    var error = await ge.EvalS("error");
                    var description = await ge.EvalS("error_description");
                    var message = $"{error}.\n{description}\nPayload: {authData}\n\nResponse: {body}";
                    throw new AuthException(message);
                }

                var subject = await ge.EvalS("sub");
                var name = await ge.EvalS("name");
                var email = await ge.EvalS("email");

                var user = new UserDetails(subject, name, email, string.Empty, string.Empty, token, authData.ToString());

                return user;
            }
            catch (AuthException)
            {
                throw;
            }
            catch (Exception e)
            {
                throw new AuthException($"Unhandled exception validating OneLogin user details.\nPayload: {authData}", e);
            }
        }
    }
}
