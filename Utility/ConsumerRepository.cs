using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Jw = Utility.JsonWrapper;

namespace Utility
{
    public class ConsumerRepository
    {
        //[ConsumerRepository].[spPlainTextFromMd5]
        public static async Task<IGenericEntity> PlainTextFromMd5(string cnsmrRepoConStr, string md5, int timeout)
        {
            return await SqlWrapper.SqlToGenericEntity(cnsmrRepoConStr,
                    "PlainTextFromMd5",
                    Jw.Json(new { Md5 = md5 }),
                    "", null, null, timeout);
        }
    }
}
