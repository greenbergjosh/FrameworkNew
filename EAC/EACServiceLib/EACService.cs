using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Framework.Core;
using Framework.Core.ProcessManagement;
using Microsoft.AspNetCore.Http;

namespace EACServiceLib
{
    public class EACService
    {
        private FrameworkWrapper _fw;

        public void Config(FrameworkWrapper fw)
        {
            _fw = fw;
            StickyQueues.Test();
        }

        public async Task Run(HttpContext context)
        {
            var s = new State();
            var request = context.ToRequest();
            var lang = await _fw.LBM(request);
            var result = await lang(s, request);
            var rd = result as IDictionary<string, object>;
            if (rd.Count == 1 &&
                rd.TryGetValue(Keywords.Result, out var singleResult))
                result = singleResult;

            var json = JsonWrapper.Serialize(result);
            var sb = new StringBuilder(HtmlEncoder.Default.Encode(json));
            if (rd.TryGetValue(Keywords.ContinuationPointer, out var cp))
            {
                string g = null;

                request = context.ToRequest();
                if (request.ContainsKey("nm"))
                    request.Remove("nm");

                if (request.ContainsKey("g"))
                {
                    g = request["g"].ToString();
                    request.Remove("g");
                }

                if (request.ContainsKey("QueryString"))
                    request.Remove("QueryString");

                var sbParams = new StringBuilder();
                foreach (var param in request)
                    sbParams.Append($"&{param.Key}={param.Value}");

                sb.Append($"<br/><a href='?g={cp}{sbParams}'>{cp}</a>");

                var cpId = Guid.Parse(cp.ToString());
                if (s.Memory.TryGetValue(cpId, out var rawCell)
                    && rawCell is IDictionary<string, object> cell &&
                    cell.ContainsKey(Keywords.GridId))
                {
                    if (s.Memory.TryGetValue(cell.Get<Guid>(Keywords.GridId), out var sf))
                    {
                        var c = (IDictionary<string, object>)sf;
                        var grid = c.GetList<IDictionary<string, object>>(Keywords.Grid);
                        var tableData = new List<List<string>>();
                        var maxX = 0;

                        for (var y = 0; y < grid.Count; y++)
                        {
                            var xData = new List<string>();

                            for (int x = 0; x < grid[y].Count; x++)
                            {
                                var kv = grid[y].ElementAt(x);
                                var k = int.Parse(kv.Key);
                                if (k > maxX)
                                    maxX = k;

                                while (xData.Count < k)
                                    xData.Add(string.Empty);

                                string glink = null;
                                if (ProcessManager.Instance.GsToStates.ContainsKey(Guid.Parse(kv.Value.ToString())))
                                    glink = $"<br/><a href='?g={kv.Value}{sbParams}'>g</a>";

                                xData.Add($"X: {kv.Key} Y: {y}{glink}");
                            }

                            tableData.Add(xData);
                        }

                        var htmlTable = new StringBuilder();
                        htmlTable.Append("<table>");
                        htmlTable.Append("<tbody>");
                        foreach (var row in tableData)
                        {
                            htmlTable.Append("<tr>");
                            foreach (var column in row)
                            {
                                var style = g == null || column.Contains(g)
                                    ? "style='background: green'"
                                    : string.Empty;
                                if (g == null)
                                    g = Guid.NewGuid().ToString();

                                htmlTable.Append($"<td {style}>{column}</td>");
                            }
                            htmlTable.Append("</tr>");
                        }
                        htmlTable.Append("</tbody>");
                        htmlTable.Append("</table>");

                        sb.Append($"<br/><br/>{htmlTable}");
                    }
                }
            }

            var html = $"<html><head><style type='text/css'>table, th, td {{ border: 1px solid black; }}</style></head><body>{sb.ToString()}</body></html>";

            //context.Response.ContentType = MediaTypeNames.Application.Json;
            await context.Response.WriteAsync(html);
        }
    }
}
