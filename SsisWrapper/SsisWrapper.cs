﻿using System.Collections.Generic;
using System.Data.SqlClient;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using Utility;

namespace SsisWrapper
{
    public static class SsisWrapper
    {
        public static string scriptFlatFileColumnGenerator =
                @"int i = 0;
                  foreach (var x in p.ge.GetL(""""))
                  {
                    XmlNode cln = p.cn.Clone();
                    ((XmlElement)cln).RemoveAttribute(""TokenizerReplace"");
                    await f.TokenReplaceXmlR(new {pn = cln, ge = x}, s);
                    p.cn.ParentNode.AppendChild(cln);
                    i++;
                  }
                  p.cn.ParentNode.RemoveChild(p.cn);""""";

        public static async Task<string> TokenReplaceSSISPackage(string tokenizedPkgFile,
            string jsonFile, Dictionary<string, string> xmlGeMap, RoslynWrapper rw)
        {
            rw.CompileAndCache(new ScriptDescriptor("FlatFileColumnGenerator", scriptFlatFileColumnGenerator, false, null));

            XmlDocument fd = await XmlTokenizer.XmlTokenizer.TokenReplaceXml(
                    tokenizedPkgFile,
                    jsonFile,
                    xmlGeMap,
                    new Dictionary<string, string> { { "DTS", "www.microsoft.com/SqlServer/Dts" } },
                    rw
                    );
            return fd.OuterXml;
        }

        public static async Task ExecutePackage(string dtexec, string pkg, string connectionString, IDictionary<string, string> vars)
        {
            StringBuilder quotedDtExecPath = new StringBuilder();
            StringBuilder quotedPkgPath = new StringBuilder("\"");

            string[] ps = dtexec.Split('\\');
            for (int i = 0; i < ps.Length - 1; i++)
            {
                if (i == 0) quotedDtExecPath.Append(ps[i] + "\\");
                else if (ps[i].Contains(' ')) quotedDtExecPath.Append("\"" + ps[i] + "\"\\");
                else quotedDtExecPath.Append(ps[i] + "\\");
            }
            quotedDtExecPath.Append(ps[ps.Length - 1]);

            ps = pkg.Split('\\');
            for (int i = 0; i < ps.Length - 1; i++)
            {
                if (i == 0) quotedPkgPath.Append(ps[i] + "\\");
                else if (ps[i].Contains(' ')) quotedPkgPath.Append("\"" + ps[i] + "\"\\");
                else quotedPkgPath.Append(ps[i] + "\\");
            }
            quotedPkgPath.Append(ps[ps.Length - 1] + "\"");

            string cmds = "EXEC Master..xp_cmdshell '" +
                quotedDtExecPath + " /F " + quotedPkgPath + "'";

            using (SqlConnection cn = new SqlConnection(connectionString))
            {
                cn.Open();
                SqlCommand cmd = cn.CreateCommand();
#pragma warning disable CA2100 // Review SQL queries for security vulnerabilities
                cmd.CommandText = cmds;
#pragma warning restore CA2100 // Review SQL queries for security vulnerabilities
                object ret = await cmd.ExecuteScalarAsync();
            }
        }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Security", "CA2100:Review SQL queries for security vulnerabilities", Justification = "<Pending>")]
        public static async Task<long> GetRecordCount(string connectionString, string tableName)
        {
            long count = 0;

            using (SqlConnection cn = new SqlConnection(connectionString))
            {
                cn.Open();
                SqlCommand cmd = cn.CreateCommand();
                cmd.CommandText = $@"
                    SELECT SUM(row_count)
                    FROM sys.dm_db_partition_stats (nolock)
                    WHERE object_id = OBJECT_ID('{tableName}')
                    AND(index_id = 0 or index_id = 1)";
                count = (long)(await cmd.ExecuteScalarAsync());
            }

            return count;
        }
    }
}
