using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Jw = Utility.JsonWrapper;
using Microsoft.AspNetCore.WebUtilities;
using Utility;
using Utility.GenericEntity;
using Vutil = VisitorIdLib.Util;

namespace VisitorIdLib
{
    public static class TowerWrapper
    {
        public static int PadCount(string str)
        {
            switch (str.Length % 4)
            {
                case 0: return 0;
                case 2: return 2;
                case 3: return 1;
                default:
                    throw new System.Exception("Illegal base64url string!");
            }
        }

        private static string Decrypt(string encryptedText, byte[] key)
        {
            RijndaelManaged aesEncryption = new RijndaelManaged();
            aesEncryption.BlockSize = 128;
            aesEncryption.KeySize = 128;

            aesEncryption.Mode = CipherMode.ECB;
            aesEncryption.Padding = PaddingMode.PKCS7;
            aesEncryption.Key = key;
            ICryptoTransform decrypto = aesEncryption.CreateDecryptor();
            byte[] encryptedBytes = Convert.FromBase64String(encryptedText);
            byte[] decryptedData = decrypto.TransformFinalBlock(encryptedBytes, 0, encryptedBytes.Length);
            return ASCIIEncoding.UTF8.GetString(decryptedData);
        }

        public static async Task<IGenericEntity> CallTowerEmailApi(FrameworkWrapper fw, HttpContext context, IGenericEntity ge)
        {
            string s = await CallTowerEmailApi(context, ge.GetS("md5"),
                ge.GetS("towerEmailApiUrl"), ge.GetS("towerEmailApiKey"), fw.Err);
            return JsonWrapper.JsonToGenericEntity(JsonWrapper.Json(new { result = s }));
        }

        public static async Task<string> CallTowerEmailApi(HttpContext context, string md5,
            string towerEmailApiUrl, string towerEmailApiKey,
            FrameworkWrapper.ErrorDelegate Err)
        {
            // All this method does is parse the Json return of an HTTP get
            // This API descriptor can be externalized as a Provider
            string towerEmailPlainText = "";
            try
            {
                string towerEmailApi = towerEmailApiUrl + "?api_key=" + towerEmailApiKey + "&md5_email=" + md5;
                var jsonPlainEmail = await Utility.ProtocolClient.HttpGetAsync(towerEmailApi);
                await Err(1, "CallTowerEmailApi", "Tracking",
                    "::ip=" + context.Connection.RemoteIpAddress + "::" + (!String.IsNullOrEmpty(jsonPlainEmail.Item2)
                            ? "CallEmailApi(Tower): " + md5 + "::" + jsonPlainEmail.Item2
                            : "CallEmailApi(Tower): " + md5 + "::" + "Null or empty jsonPlainEmail"));

                if (!String.IsNullOrEmpty(jsonPlainEmail.Item2) && jsonPlainEmail.Item1)
                {
                    IGenericEntity te = Jw.JsonToGenericEntity(jsonPlainEmail.Item2);
                    if (te.GetS("target_email") != null)
                    {
                        if (te.GetS("target_email").Length > 3)
                        {
                            towerEmailPlainText = te.GetS("target_email");
                        }
                    }
                    else
                    {
                        await Err(1, "CallTowerEmailApi", "Tracking", "::ip=" + context.Connection.RemoteIpAddress + "::" + ((jsonPlainEmail.Item2 != null)
                                    ? "CallEmailApi(Tower) Returned Null or Short Email: " + md5 + "::" + "|" + jsonPlainEmail.Item2 + "|"
                                    : "CallEmailApi(Tower) Returned Null or Short Email: " + md5 + "::" + "Null jsonPlainEmail"));
                    }
                }
            }
            catch (Exception tgException)
            {
                await Err(1000, "CallTowerEmailApi", "Exception", "TowerDataEmailApiFailed: " + $"{md5}" + "::" + tgException.ToString());
            }

            return towerEmailPlainText;
        }

        public static string Base64FromEqs(string rawstring)
        {
           string[] a = rawstring.Split("  ");
           a[a.Length - 1] = a[a.Length - 1].PadRight(a[a.Length - 1].Length + PadCount(a[a.Length - 1]), '=');
           return String.Join("\r\n", a).Replace('-', '+').Replace('_', '/');
        }

        public static async Task<(IGenericEntity opaque, string md5)> ProcessTowerMessage(FrameworkWrapper fw, HttpContext context, string towerEncryptionKey)
        {
            // All this method does in call SaveSession() with the decrypted opaque parm
            string pRawString = "";
            string opaque = "";
            string emailMd5 = "";

            string rawstring = context.Request.Query["eqs"].ToString();

            await fw.Err(1, "ProcessTowerMessage", "Tracking", "Entry: " + rawstring + "::ip=" + context.Connection.RemoteIpAddress);

            try
            {
                pRawString = Base64FromEqs(rawstring);
            }
            catch (Exception ex)
            {
                await fw.Err(1000, "ProcessTowerMessage", "Exception", "Step1Fail " + $"string error::{rawstring}" +
                                "::" + ex.ToString() + "::ip=" + context.Connection.RemoteIpAddress);
            }

            try
            {
                byte[] key = Utility.Hashing.StringToByteArray(towerEncryptionKey);
                string result = Decrypt(pRawString, key);
                if (result.Contains("md5_email") || result.Contains("label"))
                {

                    var query = QueryHelpers.ParseQuery(result);
                    // Tower may return a response omitting the md5_email if either there is no
                    // association, or they've been queried too many times with a specific cookie
                    opaque = query.ContainsKey("label") ? query["label"][0] : opaque;
                    emailMd5 = query.ContainsKey("md5_email") ? query["md5_email"][0] : emailMd5;
                    if (string.IsNullOrWhiteSpace(emailMd5))
                    {
                        await fw.Err(1, "ProcessTowerMessage", "Error", "Step2Fail: " + "No md5" + "::" + result + "::ip=" + context.Connection.RemoteIpAddress);
                    }
                    else
                    {
                        await fw.Err(1, "ProcessTowerMessage", "Tracking", "Step2Success: " + "Found md5" + "::" + result + "::ip=" + context.Connection.RemoteIpAddress);
                    }
                }
            }
            catch (Exception ex)
            {
                await fw.Err(1000, "ProcessTowerMessage", "Exception", "Step3Fail: " + $"decrypt error::{rawstring}" + "::" +
                                ex.ToString() + "::ip=" + context.Connection.RemoteIpAddress);
            }

            if (String.IsNullOrEmpty(emailMd5) ||
                emailMd5.ToLower() == "none" || emailMd5.Length != 32)
            {
                if (!String.IsNullOrEmpty(emailMd5) && emailMd5.Length != 32)
                {
                    await fw.Err(100, "ProcessTowerMessage", "Error", "Md5 is invalid: " + $"{emailMd5}" + "::ip=" + context.Connection.RemoteIpAddress);
                }

                return (opaque: Vutil.OpaqueFromBase64(opaque,async (method, message) => { await fw.Log(method, message); } ), md5: "");
            }

            try
            {
                await fw.Err(1, "ProcessTowerMessage", "Tracking", "Before Parsing Label: " + $"{opaque}" + "::ip=" + context.Connection.RemoteIpAddress);

                return (opaque: Vutil.OpaqueFromBase64(opaque, async (method, message) => { await fw.Log(method, message); }), md5: emailMd5);
            }
            catch (Exception ex)
            {
                await fw.Err(1000, "ProcessTowerMessage", "Exception", "OuterException: " + ex.ToString() + "::ip=" + context.Connection.RemoteIpAddress);
            }

            return (opaque: null, md5: "");
        }

    }
}
