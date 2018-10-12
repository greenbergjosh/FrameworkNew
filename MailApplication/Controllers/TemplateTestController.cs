using BusinessLogic;
using BusinessLogic.Model;
using PagedList;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Net.Http.Headers;
using Newtonsoft.Json;
using System.Text;
using System.Diagnostics;
using SharpRaven.Data;
using MailApplication.Models;

namespace MailApplication.Controllers
{
    [Authorize(Roles = "USER, SUPER USER")]
    public class TemplateTestController : Controller
    {
        // GET: TemplateTest
        public ViewResult Index(int? page)
        {
            using (DatabaseContext db = new DatabaseContext())
            {
                int pageSize = 20;
                int pageNumber = (page ?? 1);

                IQueryable<TemplateTest> query = db.TemplateTest;

                var result = query.OrderByDescending(q => q.CreatedAt).ToPagedList(pageNumber, pageSize);

                return View(result);
            }
        }

        public ActionResult New()
        {
            using (DatabaseContext db = new DatabaseContext())
            {
                return View();
            }

        }

        [ValidateInput(false)]
        public ActionResult Create(String campaignID, String name, String subject, String textBody, String to, String html)
        {
            using (DatabaseContext db = new DatabaseContext())
            {
                var tolist = to.Split(',');

                foreach (var mail in tolist)
                {
                    TemplateTest template = new TemplateTest();
                    template.Name = name;
                    template.Id = Guid.NewGuid();
                    template.CampaignId = campaignID;
                    template.Subject = subject;
                    template.BodyText = textBody;
                    template.To = mail.Trim();
                    template.HTML = html;
                    template.CreatedAt = DateTime.Now;
                    template.Result = "No data";

                    db.TemplateTest.Add(template);
                    db.SaveChanges();

                    SendMailAPIAsync(template);

                }
            }

            return Redirect("/TemplateTest/Index");

        }

        public void SendMailAPIAsync(TemplateTest template)
        {
            var json = new
            {
                token = "33fff4b6-50c6-429d-93e0-9af45210851f",
                email = template.To,
                subject = template.Subject,
                html = template.HTML,
                text = template.BodyText,
                campaignid = template.CampaignId,
                trackingid = template.Id,
                headerval = "Sent-from-Seeder;" + template.Id
            };

            HttpClient client = new HttpClient();

            var data = new StringContent(JsonConvert.SerializeObject(json), Encoding.UTF8, "application/json");

            var response = client.PostAsync("http://template.direct-market.com/GA/seederOut", data).Result;
            var result = response.Content.ReadAsStringAsync();

        }

        public ActionResult Show(Guid id)
        {
            TemplateTestShowViewModel templateShowView = new TemplateTestShowViewModel();
            using (DatabaseContext db = new DatabaseContext())
            {
                var template = db.TemplateTest.Find(id);

                if (template != null && template.Mail != null)
                {
                    List<Header> headers = new List<Header>();
                    
                    headers = db.Header.Where(h => h.MailHeaders.Any(mh => mh.Mail.Id == template.Mail.Id)).ToList();

                    templateShowView.Template = template;
                    templateShowView.MailHeaders = headers;
                    return View(templateShowView);
                }
                return Redirect("/TemplateTest/Index");
            }

        }

        public ActionResult Delete(Guid id)
        {
            using (DatabaseContext db = new DatabaseContext())
            {
                var template = db.TemplateTest.Find(id);

                if (template != null)
                {
                    db.TemplateTest.Remove(template);
                    db.SaveChanges();
                }

                return Redirect("/TemplateTest/Index");
            }

        }

        public ActionResult Clone(Guid id)
        {
            using (DatabaseContext db = new DatabaseContext())
            {
                var template = db.TemplateTest.Find(id);

                if (template != null)
                    return View(template);

                return Redirect("/TemplateTest/Index");
            }
        }

        public ActionResult RunAll()
        {
            using (var db = new DatabaseContext())
            {
                try
                {
                    //call process
                    Process p = new Process();
                    String seedsIds = "";

                    var maxStartDate = db.RunLog.Where(r => r.Status == "Start").OrderByDescending(d => d.RunTime).Select(s => s.RunTime).FirstOrDefault();
                    var maxEndDate = db.RunLog.Where(r => r.Status == "End").OrderByDescending(d => d.RunTime).Select(s => s.RunTime).FirstOrDefault();

                    if (maxEndDate > maxStartDate)
                    {
                        var mailsTemplateTest = db.TemplateTest.Select(t => t.To).Distinct().ToList();

                        var count = mailsTemplateTest.Count();
                        foreach (var mail in mailsTemplateTest)
                        {
                            var seed = db.Seed.Where(u => u.UserName == mail).FirstOrDefault();

                            if (seed != null)
                            {
                                if (count == 1)
                                    seedsIds += seed.Id;
                                else
                                    seedsIds += seed.Id + " ";
                            }
                            count--;
                        }

                        p.StartInfo.Arguments = seedsIds;


                        p.StartInfo.FileName = "C:\\inetpub\\mailapp\\mailprocess\\MailProcess.exe";
                        p.Start();
                    }
                }
                catch (Exception ex)
                {
                    var ravenClient = Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                }

                return Redirect("/TemplateTest/Index");
            }
        }

    }
}