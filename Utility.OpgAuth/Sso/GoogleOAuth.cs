using System;
using System.Text.Json;
using System.Threading.Tasks;
using Google.Apis.Auth;

namespace Utility.OpgAuth.Sso
{
    public class GoogleOAuth : Platform
    {
        public override Task Init(FrameworkWrapper fw, Entity.Entity init) => Task.CompletedTask;

        public override string PlatformType { get; } = "Google";

        public override async Task<UserDetails> GetUserDetails(Entity.Entity authData)
        {
            try
            {
                var validation = await GoogleJsonWebSignature.ValidateAsync(await authData.GetS("idToken"));

                if (validation?.EmailVerified != true)
                {
                    throw new AuthException($"Account is unverified.\nPayload: {authData}\n\nResponse: {JsonSerializer.Serialize(validation)}");
                }

                return new UserDetails(id: validation.Subject, validation.Name, validation.Email, null, validation.Picture, loginToken: null, authData.ToString());
            }
            catch (InvalidJwtException e)
            {
                throw new AuthException($"Invalid token for Google SSO user details.\nPayload: {authData}", e);
            }
            catch (Exception e)
            {
                throw new AuthException($"Unhandled exception validating Google SSO user details.\nPayload: {authData}", e);
            }
        }
    }
}
