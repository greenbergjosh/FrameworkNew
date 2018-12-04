using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Jw = Utility.JsonWrapper;

namespace Utility
{
    public class ConsumerRepository
    {
        public static async Task<IGenericEntity> SaveMd5ToContact(string cnsmrRepoConStr, string md5, int timeout)
        {
            return await SqlWrapper.SqlToGenericEntity(cnsmrRepoConStr,
                    "SaveMd5ToContact",
                    Jw.Json(new { Md5 = md5 }),
                    "", null, null, timeout);
        }

        public static async Task<IGenericEntity> Md5ToPlainTextOnPoint(string cnsmrRepoConStr, string md5, int ld, int timeout)
        {
            return await SqlWrapper.SqlToGenericEntity(cnsmrRepoConStr,
                    "Md5ToPlainTextOnPoint",
                    Jw.Json(new { Md5 = md5, Ld = ld }),
                    "", null, null, timeout);
        }

        public static async Task<IGenericEntity> Md5ToPlainTextLegacy(string cnsmrRepoConStr, string md5, int timeout)
        {
            return await SqlWrapper.SqlToGenericEntity(cnsmrRepoConStr,
                    "Md5ToPlainTextLegacy",
                    Jw.Json(new { Md5 = md5 }),
                    "", null, null, timeout);
        }
    }
}
