using System;
using System.Threading.Tasks;
using Utility;
using Utility.GenericEntity;

namespace TheGreatWallOfDataLib.Routing
{
    public static class Authentication
    {
        private static string _mockToken = new Guid().ToString();
        private static FrameworkWrapper _fw;

        public static async Task Initialize(FrameworkWrapper fw)
        {
            _fw = fw;
        }

        public static async Task<IGenericEntity> Login(string payload)
        {
            await _fw.Trace(nameof(Login), payload);
            var pl = JsonWrapper.JsonToGenericEntity(payload);

            if (pl.GetS("google").IsNullOrWhitespace()) throw new FunctionException(106, "Auth not implemented and only Google OAuth is faked");

            return JsonWrapper.ToGenericEntity(new { token = _mockToken, name = pl.GetS("google/name"), email = pl.GetS("google/email"), profileImage = pl.GetS("google/imageUrl") });
        }

        public static async Task<IGenericEntity> GetUserDetails(string identity)
        {
            return JsonWrapper.ToGenericEntity(new { name = "Test User", email = "abc@onpointglobal.com", profileImage = "https://picsum.photos/150" });
        }

        public static async Task<bool> HasPermissions(string scope, string funcName, string identity)
        {
            return identity == _mockToken;
        }

    }
}
