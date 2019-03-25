using System.Collections.Generic;

namespace Framework.Core
{
    public static class Configuration
    {
        public static IDictionary<string, object> Config = new Dictionary<string, object>()
        {
            {"DefaultBootstrapper", GuidHelper.FromInt(99950)},
        };
   }
}