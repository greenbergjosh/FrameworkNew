using System;
using System.Threading.Tasks;
using Google.Apis.Auth;
using Utility.GenericEntity;

namespace Utility.OpgAuth.Sso
{
    public class GoogleOAuth : Platform
    {
        private string _appCredentials;
        private string _appName;

        public override void Init(FrameworkWrapper fw, IGenericEntity init)
        {
            _appName = init.GetS("appName");
            _appCredentials = init.GetS("appCredentials");
        }

        public override string PlatformType { get; } = "Google";

        public override async Task<UserDetails> GetUserDetails(IGenericEntity authData)
        {
            try
            {
                var validation = await GoogleJsonWebSignature.ValidateAsync(authData.GetS("idToken"));

                if (validation?.EmailVerified != true) throw new AuthException($"Account is unverified.\nPayload: {authData.GetS("")}\n\nResponse: {JsonWrapper.Serialize(validation)}");

                return new UserDetails(id: validation.Subject, validation.Name, validation.Email, null, validation.Picture, loginToken: null, authData.GetS(""));
            }
            catch (InvalidJwtException e)
            {
                throw new AuthException($"Invalid token for Google SSO user details.\nPayload: {authData.GetS("")}", e);
            }
            catch (Exception e)
            {
                throw new AuthException($"Unhandled exception validating Google SSO user details.\nPayload: {authData.GetS("")}", e);
            }
        }
    }
}
