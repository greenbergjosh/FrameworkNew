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
    [Authorize(Roles = "USER, SUPER USER")]
    public class SeedController : Controller
    {
        // GET: MailAccount
        public ViewResult Index(int? page)
        {
            using (DatabaseContext db = new DatabaseContext())
            {

                try
                {
                    int pageSize = 20;
                    int pageNumber = (page ?? 1);


                    IQueryable<Seed> seeds = db.Seed.Include(c => c.Provider);

                    var result = seeds.OrderByDescending(q => q.Id).ToPagedList(pageNumber, pageSize);

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
            using (DatabaseContext db = new DatabaseContext())
            {
                List<Provider> providers = db.Provider.ToList();
                SelectList providerList = new SelectList(providers, "Id", "Name");
                ViewBag.items = providerList;
                return View();
            }
        }

        [HttpPost]
        public ActionResult Create(string name, string userName, string lastName, string password, Guid provider, bool markAsRead, bool moveToInbox, bool replayMail)
        { 
            if (HttpContext.Request.HttpMethod == "POST")
            {
                using (DatabaseContext db = new DatabaseContext())
                {
                    try
                    {
                        Seed seed = new Seed();

                        Provider ObjectProvider = db.Provider.Find(provider);
                        seed.Id = Guid.NewGuid();
                        seed.Name = name;
                        seed.UserName = userName;
                        seed.Password = password;
                        seed.LastName = lastName;
                        seed.Provider = ObjectProvider;
                        seed.CreatedAt = DateTime.Now;
                        seed.UpdatedAt = DateTime.Now;

                        MailClient mailClient = new MailClient();

                        if (mailClient.IsValidSeed(seed))
                        {
                            if (!seed.Name.Equals(""))
                            {
                                db.Seed.Add(seed);
                                db.SaveChanges();
                            }
                        }else
                        {
                            return Redirect("New");
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

        [HttpPost]
        public ActionResult Update(Guid idAccount, string nameAccount, string lastName, string userName, string password, bool markAsRead, bool moveToInbox, bool replayMail)
        {
            using (DatabaseContext db = new DatabaseContext())
            {

                try
                {
                    Seed seed = db.Seed.Find(idAccount);

                    seed.Name = nameAccount;
                    seed.Password = password;
                    seed.LastName = lastName;
                    seed.UserName = userName;
                    seed.UpdatedAt = DateTime.Now;

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
            using (DatabaseContext db = new DatabaseContext())
            {
                Seed result = new Seed();
                try
                {
                    Seed account = db.Seed.Find(id);

                    result = account;

                }
                catch (Exception ex)
                {
                    RavenClient ravenClient = Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                }
                return View(result);
            }
        }

        public ActionResult Delete(Guid id)
        {
            using (DatabaseContext db = new DatabaseContext())
            {
                try
                {
                    Seed account = db.Seed.Find(id);

                    db.Seed.Remove(account);

                    db.SaveChanges();
                }
                catch (Exception ex)
                {
                    RavenClient ravenClient = Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                }

                return Redirect("/Seed/Index");
            }
        }

        public ActionResult LoadSeedsExcel(String file)
        {
            //Read the contents of CSV file.
            string csvData = System.IO.File.ReadAllText(file);

            int rowNum = 0;
            //Execute a loop over the rows.  
            foreach (string row in csvData.Split('\n'))
            {
                if (!string.IsNullOrEmpty(row))
                {
                    if (rowNum > 0)
                    {
                        using (DatabaseContext db = new DatabaseContext())
                        {

                            var line = row.Split(',');
                            var provider = db.Provider.Where(p => p.Name == line[0]).First();

                            Seed seed = new Seed();
                            seed.Provider = provider;
                            seed.UserName = line[1];
                            seed.Password = line[2];

                            db.Seed.Add(seed);
                            db.SaveChanges();
                        }
                    }


                    rowNum++;
                }
            }

            return Redirect("/Seed/Index");
        }
    }
}