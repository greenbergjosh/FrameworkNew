using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Utility;
using Utility.GenericEntity;

namespace TheGreatWallOfDataLib.Scopes
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
            return JsonWrapper.ToGenericEntity(new {token = _mockToken, name = "Test User", email = "abc@onpointglobal.com", profileImage = "https://picsum.photos/150" });
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
