using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessLogic;
using BusinessLogic.Model;
using System.Web.Mvc;
using SharpRaven.Data;
using System.Data.Entity;
using SharpRaven;
using PagedList;
//using PagedList.Mvc;

namespace MailApp.Controllers
{
    [Authorize(Roles = "SUPER USER")]
    public class ProviderController : Controller
    {
        public ViewResult Index(int? page)
        {
            using (DatabaseContext db = new DatabaseContext())
            {

                int pageSize = 20;
                int pageNumber = (page ?? 1);

                IQueryable<Provider> query = db.Provider;

                var result = query.OrderByDescending(q => q.Id).ToPagedList(pageNumber, pageSize);

                return View(result);
            }
        }

        public ActionResult New()
        {
            List<String> type = new List<string>();

            type.Add("IMAP");
            SelectList providerList = new SelectList(type);
            ViewBag.items = providerList;
            return View();

        }

        public ActionResult Create(string name, int port, string server, string type, string smtpServer, int smtpPort)
        {
            if (HttpContext.Request.HttpMethod == "POST")
            {
                using (DatabaseContext db = new DatabaseContext())
                {
                    try
                    {
                        Provider provider = new Provider
                        {
                            Id = Guid.NewGuid(),
                            Name = name,
                            Server = server,
                            Port = port,
                            Type = type,
                            SMTPport = smtpPort,
                            SMTPServer= smtpServer

                        };

                        if (!provider.Name.Equals(""))
                        {
                            db.Provider.Add(provider);
                            db.SaveChanges();
                        }


                    }
                    catch (Exception ex)
                    {
                        RavenClient ravenClient = Sentry.Instance;
                        ravenClient.Capture(new SentryEvent(ex));
                    }
                }
                return Redirect("Index");
            }
            return View();

        }

        public ActionResult Edit(Guid id)
        {
            using (var db = new DatabaseContext())
            {
                List<String> type = new List<string>();

                Provider provider = db.Provider.Find(id);

                type.Add("IMAP");
                SelectList providerList = new SelectList(type);
                ViewBag.items = providerList;


                return View(provider);
            }
        }

        [HttpPost]
        public ActionResult Update(Guid idProvider, string name, string server, int port, string type, string smtpServer, int smtpPort)
        {

            using (DatabaseContext db = new DatabaseContext())
            {

                try
                {
                    Provider provider = db.Provider.Find(idProvider);
                    provider.Name = name;
                    provider.Server = server;
                    provider.Port = port;
                    provider.Type = type;
                    provider.SMTPServer = smtpServer;
                    provider.SMTPport = smtpPort;

                    db.SaveChanges();
                }
                catch (Exception ex)
                {
                    RavenClient ravenClient = BusinessLogic.Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                }
                return Redirect("Index");
            }
        }

        public ActionResult Delete(Guid id)
        {
            using (DatabaseContext db = new DatabaseContext())
            {

                try
                {
                    Provider provider = db.Provider.Find(id);
                    db.Provider.Remove(provider);

                    db.SaveChanges();
                }
                catch (Exception ex)
                {

                    var ravenClient = BusinessLogic.Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                }

                return Redirect("/Provider/Index");
            }

        }
    }
}