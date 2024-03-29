﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using HtmlAgilityPack;
using Utility;
using Utility.Entity;

namespace UnsubLib.UnsubFileProviders
{
    public class Ezepo : IUnsubLocationProvider
    {
        private readonly FrameworkWrapper _fw;
        private readonly string _logMethod = $"{nameof(UnsubFileProviders)}.{nameof(Ezepo)}";

        public Ezepo(FrameworkWrapper fw) => _fw = fw;

        public Task<bool> CanHandle(Entity network, string unsubRelationshipId, Uri uri) => Task.FromResult(uri.ToString().Contains("ezepo.net"));

        public async Task<(string url, IDictionary<string, string> postData)> GetFileUrl(Entity network, string unsubRelationshipId, Uri uri)
        {
            await _fw.Trace(_logMethod, $"Getting Unsub location: {uri}");

            var ezepoUnsubUrl = await GetEzepoUnsubFileUri(network, uri.ToString());

            await _fw.Trace(_logMethod, $"Retrieved Unsub location: {uri} -> {ezepoUnsubUrl}");

            if (!string.IsNullOrWhiteSpace(ezepoUnsubUrl))
            {
                return (ezepoUnsubUrl, null);
            }

            await _fw.Error(_logMethod, $"Empty Ezepo url: {uri}");

            return default;
        }

        public async Task<string> GetEzepoUnsubFileUri(Entity network, string url)
        {
            var fileUrl = "";

            await _fw.Trace("EZEPO", $"GetEzepoUnsubFileUri Entering");

            try
            {
                var web = new HtmlWeb();
                var doc = web.Load(url);
                var instance = doc.GetElementbyId("instance").GetAttributeValue("value", "");
                var affiliate = doc.GetElementbyId("affiliate").GetAttributeValue("value", "");
                var subId = doc.GetElementbyId("subid").GetAttributeValue("value", "");
                var listId = doc.GetElementbyId("list_id").GetAttributeValue("value", "");
                var ipAddress = doc.GetElementbyId("ipaddress").GetAttributeValue("value", "");
                var jobId = doc.GetElementbyId("job_id").GetAttributeValue("value", "");
                var source = doc.GetElementbyId("source").GetAttributeValue("value", "");
                var authorizationCode = doc.GetElementbyId("authorization_code").GetAttributeValue("value", "");

                var urlPrefix = url.Substring(0, url.IndexOf("ezepo.net", StringComparison.InvariantCulture));
                var startDownload = urlPrefix + "ezepo.net/download/messenger.php?class=download&job_id=" + jobId +
                    "&instance_id=" + instance +
                    "&list_id=" + listId +
                    "&affiliate=" + affiliate +
                    "&subid=" + subId +
                    "&ipaddress=" + ipAddress +
                    "&fromdate=" + "0";

                var result = await ProtocolClient.HttpGetAsync(startDownload);
                if (result.success && result.body == "1")
                {
                    var jobKey = jobId.Split('_');
                    var downloadFileUrl = urlPrefix +
                                          "ezepo.net/download/files/" +
                                          affiliate + '/' +
                                          listId + '/' +
                                          source + '/' +
                                          authorizationCode + '/' +
                                          jobKey[1];

                    doc = web.Load(downloadFileUrl);
                    var lastScript = doc.DocumentNode.Descendants("script")
                        .Single(node => string.IsNullOrEmpty(node.GetAttributeValue("src", null)));

                    string bucket = null;
                    using (var sr = new StringReader(lastScript.InnerText))
                    {
                        var line = sr.ReadLine();
                        while (line != null)
                        {
                            if (line.Contains("checkJobStatus("))
                            {
                                line = line.Trim()
                                    .Replace("'", "")
                                    .Replace(" ", "")
                                    .Replace("checkJobStatus(", "")
                                    .Replace(");", "");
                                var parts = line.Split(',');
                                jobId = parts[0];
                                bucket = parts[1];
                                break;
                            }

                            line = sr.ReadLine();
                        }
                    }

                    var messengerUrl = urlPrefix + "ezepo.net/download/messenger.php?class=status&job_id=" + jobId;
                    var startTime = DateTime.UtcNow;
                    string file;
                    while (true)
                    {
                        var (success, body) = await ProtocolClient.HttpGetAsync(messengerUrl);
                        if (success)
                        {
                            var ge = await network.Parse("application/json", body);
                            var status = await ge.EvalI("status");
                            if (status == 1)
                            {
                                file = await ge.EvalS("downloadfile");
                                break;
                            }
                        }

                        if (DateTime.UtcNow.Subtract(startTime).TotalMinutes > 15)
                        {
                            throw new TimeoutException();
                        }

                        await Task.Delay(10000);
                    }

                    if (file != null)
                    {
                        fileUrl = "https://s3.amazonaws.com/" + bucket + "/" + file;
                    }
                }
            }
            catch (Exception e)
            {
                await _fw.Error("EZEPO", $"GetEzepoUnsubFileUri Failed");
                await _fw.Error(nameof(GetEzepoUnsubFileUri), $"Ezepo failed {e.UnwrapForLog()}");
            }

            await _fw.Trace("EZEPO", $"GetEzepoUnsubFileUri Succeeded {fileUrl}");

            return fileUrl;
        }
    }
}
