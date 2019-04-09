using System.Threading.Tasks;
using Google.Apis.Oauth2.v2;
using Google.Apis.Services;

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
            using (var service = new Oauth2Service(new BaseClientService.Initializer
            {
                ApplicationName = _appName,
                ApiKey = _appCredentials
            }))
            {
                var req = service.Userinfo.Get();

                req.OauthToken = authData.GetS("t");

                var userInfo = await req.ExecuteAsync();

                return new UserDetails(userInfo.Name, userInfo.Email, null, userInfo.Picture, JsonWrapper.Serialize(new { platform = PlatformType, userInfo }));
            }
        }
    }
}
