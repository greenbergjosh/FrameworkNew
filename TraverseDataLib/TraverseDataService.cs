using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Utility;
using VisitorIdLib;
using Jw = Utility.JsonWrapper;
using Vutil = Utility.VisitorIdUtil;

namespace TraverseDataLib
{
    public class TraverseDataService
    {

        const string DataLayerName = "TraverseResponse";
        public FrameworkWrapper Fw;
        public int SqlTimeoutSec;

        public void Config(FrameworkWrapper fw)
        {
            this.Fw = fw;
            this.SqlTimeoutSec = fw.StartupConfiguration.GetS("Config/SqlTimeoutSec").ParseInt() ?? 5;
        }

        public async Task Run(HttpContext context)
        {
            string requestFromPost = "";
            var result = Jw.Json(new { Error = "SeeLogs" });
            int resultHttpStatus = StatusCodes.Status400BadRequest;
            try
            {

                if (!String.IsNullOrWhiteSpace(context.Request.Query["m"]))
                {
                    string m = context.Request.Query["m"];

                    switch (m)
                    {
                        case "TraverseResponse":
                            var ge = await TraverseResponse(context);
                            var vid = new VisitorIdDataService().ConfigProviders(this.Fw);
                            VisitorIdResponse vidResp = await vid.SaveSession(this.Fw, context, true, false, Vutil.OpaqueFromBase64(ge.GetS("advertiserProperties.op")), ge.GetS("emailMd5Lower"));
                            await vid.SaveSessionEmailMd5(this.Fw, vidResp, DataLayerName);
                            result = Jw.Json(vidResp);
                            resultHttpStatus = StatusCodes.Status202Accepted;
                            break;
                        default:
                            await this.Fw.Err(1000, "Start", "Error", "Unknown request: " + requestFromPost);
                            break;
                    }
                }
                else
                {
                    await this.Fw.Err(1000, "Start", "Error", "Unknown request: " + requestFromPost);
                }
            }
            catch (Exception ex)
            {
                await this.Fw.Err(1000, "Start", "Exception", $@"{requestFromPost}::{ex}");
            }
            await WriteResponse(resultHttpStatus, context, result);

        }

        public async Task WriteResponse(int StatusCode, HttpContext context, string resp)
        {
            context.Response.StatusCode = StatusCode;
            context.Response.ContentType = "application/json";
            context.Response.ContentLength = resp.Length;
            await context.Response.WriteAsync(resp);
        }

        public async Task<IGenericEntity> TraverseResponse(HttpContext c)
        {
            /* From:https://traversedata.github.io/activity-identification-notification#consuming-identification-notifications 
               As of: 1/16/2019
               {
                 "campaignId": "6a11644c-690d-4bf3-bb19-4c3efba5a5a5",
                 "emailMd5Lower": "1105677c8d9decfa1e36a73ff5fb5531",
                 "emailSha1Lower": "ba9d46a037766855efca2730031bfc5db095c654",
                 "listIds": ["772823bd-b7be-4d23-bd78-96a577d02765"],
                 "advertiserProperties": {
                   "impressionId": "f53f6078-f802-4c98-90ca-e90aa56995ab",
                   "foo": "bar"
                  }
               }
               
               VisitorId sticks opaque into the path: 'advertiserProperties.op'
                
                */
            return Jw.JsonToGenericEntity(await c.GetRawBodyStringAsync());
        }


    }
}
