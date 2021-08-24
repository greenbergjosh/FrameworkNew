﻿using System;
using System.Threading.Tasks;
using Utility.GenericEntity;

namespace Utility.OpgAuth.Sso
{
    public class OneLogin : Platform
    {
        private IGenericEntity _config;

        public override void Init(FrameworkWrapper fw, IGenericEntity init)
        {
            _config = init;
        }

        public override string PlatformType { get; } = "OneLogin";

        public override async Task<UserDetails> GetUserDetails(IGenericEntity authData)
        {
            try
            {
                var token = authData.GetS("accessToken");

                var baseUrl = new Uri(_config.GetS("baseUrl"));
                var userDetailsPath = _config.GetS("userDetailsPath");

                var url = new Uri(baseUrl, userDetailsPath).ToString();

                var (success, body) = await ProtocolClient.HttpGetAsync(url,
                    new (string key, string value)[]
                    {
                        ("Authorization", "Bearer " + token)
                    });

                var ge = new GenericEntityJson();
                ge.InitializeEntity(null, null, JsonWrapper.TryParse(body));

                if (!success)
                {
                    var error = ge.GetS("error");
                    var description = ge.GetS("error_description");
                    var message = $"{error}.\n{description}\nPayload: {authData.GetS("")}\n\nResponse: {body}";
                    throw new AuthException(message);
                }

                var subject = ge.GetS("sub");
                var name = ge.GetS("name");
                var email = ge.GetS("email");

                var user = new UserDetails(subject, name, email, string.Empty, string.Empty, token, authData.GetS(""));

                return user;
            }
            catch (AuthException)
            {
                throw;
            }
            catch (Exception e)
            {
                throw new AuthException($"Unhandled exception validating OneLogin user details.\nPayload: {authData.GetS("")}", e);
            }
        }
    }
}
