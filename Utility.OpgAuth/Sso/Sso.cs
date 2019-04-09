
namespace Utility.OpgAuth.Sso
{
    public static class Sso
    {
        // This is intended to be an IPlatform factory. For now, it's a factory of 1
        public static Platform GetPlatform(string authData)
        {
            return new GoogleOAuth(authData);
        }
    }
}
