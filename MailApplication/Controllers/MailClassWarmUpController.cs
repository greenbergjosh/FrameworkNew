using BusinessLogic;
using SharpRaven;
using System;
using BusinessLogic;
using BusinessLogic.Model;
using SharpRaven;
using SharpRaven.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Entity;
using System.Web.Mvc;
using PagedList;

namespace MailApplication.Controllers
{
    public class MailClassWarmUpController : Controller
    {

        // GET: MailClassWarmUp
        public ActionResult Index(int? page)
        {
            using (DatabaseContext db = new DatabaseContext())
            {

                try
                {
                    int pageSize = 20;
                    int pageNumber = (page ?? 1);


                    IQueryable<MailClassWarmUp> mailClassWarmUp = db.MailClassWarmUp;

                    var result = mailClassWarmUp.OrderByDescending(q => q.Id).ToPagedList(pageNumber, pageSize);

                    return View(result);

                }
                catch (Exception ex)
                {
                    RavenClient ravenClient = Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                    return View();
                }
            }
        }

        public ActionResult New()
        {
            return View();

        }

        public ActionResult Create(String mailClass, String portionMail)
        {
            using (DatabaseContext db = new DatabaseContext())
            {
                try
                {
                    MailClassWarmUp mailClassWarmUp = new MailClassWarmUp
                    {
                        Id = Guid.NewGuid(),
                        MailClass = mailClass,
                        PortionMail = int.Parse(portionMail),
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now

                    };

                    db.MailClassWarmUp.Add(mailClassWarmUp);
                    db.SaveChanges();

                }
                catch (Exception ex)
                {
                    RavenClient ravenClient = Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                }
                return Redirect("Index");

            }
        }

        public ActionResult Edit(Guid id)
        {
            using (var db = new DatabaseContext())
            {

                MailClassWarmUp mailClass = db.MailClassWarmUp.Find(id);

                return View(mailClass);
            }
        }

        public ActionResult Update(Guid idMailClassWarmUp, String mailClass, String portionMail)
        {

            using (DatabaseContext db = new DatabaseContext())
            {

                try
                {
                    MailClassWarmUp mailClassWarmUp = db.MailClassWarmUp.Find(idMailClassWarmUp);
                    mailClassWarmUp.MailClass = mailClass;
                    mailClassWarmUp.UpdatedAt = DateTime.Now;
                    mailClassWarmUp.PortionMail = int.Parse(portionMail);
                    db.SaveChanges();
                }
                catch (Exception ex)
                {
                    RavenClient ravenClient = Sentry.Instance;
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
                    MailClassWarmUp mailClassWarmUp = db.MailClassWarmUp.Find(id);
                    db.MailClassWarmUp.Remove(mailClassWarmUp);

                    db.SaveChanges();
                }
                catch (Exception ex)
                {

                    var ravenClient = Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                }

                return Redirect("/MailClassWarmUp/Index");
            }
        }

    }
}