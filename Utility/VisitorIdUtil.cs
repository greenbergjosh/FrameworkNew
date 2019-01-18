using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace Utility
{
    public static class VisitorIdUtil
    {
        public static IGenericEntity OpaqueFromBase64(string base64Opaque)
        {
            if (string.IsNullOrEmpty(base64Opaque)) { return null; }

            string jsopaque = Utility.Hashing.Base64DecodeFromUrl(base64Opaque);
            IGenericEntity op = new GenericEntityJson();
            var opstate = JsonConvert.DeserializeObject(jsopaque);
            op.InitializeEntity(null, null, opstate);
            return op;
        }

    }
}
