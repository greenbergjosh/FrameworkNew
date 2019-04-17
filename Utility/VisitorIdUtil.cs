using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using Jw = Utility.JsonWrapper;

namespace Utility
{
    public static class VisitorIdUtil
    {
        public static IGenericEntity OpaqueFromBase64(string base64Opaque, Action<string, string> errLogger)
        {
            if (string.IsNullOrEmpty(base64Opaque)) { return null; }

            string jsopaque = Jw.Empty;
            object opstate = new object();
            try
            {
                jsopaque = Utility.Hashing.Base64DecodeFromUrl(base64Opaque); // could be badly base-64 encoded
                opstate = JsonConvert.DeserializeObject(jsopaque); // could be invalid json after decoding
            }
            catch (Exception e)
            {
                errLogger(nameof(OpaqueFromBase64), $"Caught exception attempting to Base-64 decode string '{base64Opaque ?? ""}' to opaque value: {e.UnwrapForLog()}");
            }
            IGenericEntity op = new GenericEntityJson();
            op.InitializeEntity(null, null, opstate);
            return op;
        }

        public static List<Guid> Md5ExcludeList (IEnumerable<IGenericEntity> excludeListGe)
        {
            List<Guid> md5List = new List<Guid>();
            excludeListGe.ForEach(x => md5List.Add(new Guid(x.GetS(""))));
            return md5List;
        }
    }
}
