using BusinessLogic;
using BusinessLogic.Model;
using MailApplication.Models;
using PagedList;
using SharpRaven;
using SharpRaven.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data.Entity;
using System.Web.Script.Serialization;
using System.Diagnostics;

namespace MailApplication.Controllers
{
    [Authorize(Roles = "USER, SUPER USER")]
    public class SeedBucketController : Controller
    {
        // GET: SeedBucket
        public ViewResult Index(int? page)
        {
            using (DatabaseContext db = new DatabaseContext())
            {
                int pageSize = 20;
                int pageNumber = (page ?? 1);

                IQueryable<SeedBucket> query = db.SeedBucket;

                var result = query.OrderByDescending(q => q.Id).ToPagedList(pageNumber, pageSize);

                return View(result);
            }
        }

        public ActionResult New()
        {
            using (DatabaseContext db = new DatabaseContext())
            {
                IQueryable<Seed> seeds = db.Seed.Where(s => s.SeedBucket == null);

                return View(seeds.ToList());
            }

        }

        public ActionResult Create(String name, String description, String seeds, String senderDomains, bool markAsRead, bool moveToInbox, bool replyMail, bool forwardMail, bool clickMail)
        {
            if (HttpContext.Request.HttpMethod == "POST")
            {
                using (DatabaseContext db = new DatabaseContext())
                {
                    try
                    {
                        SeedBucket seedBucket = new SeedBucket
                        {
                            Id = Guid.NewGuid(),
                            Name = name,
                            Description = description,
                            CreatedAt = DateTime.Now,
                            UpdatedAt = DateTime.Now,
                            UUID = Guid.NewGuid(),
                            MoveMailToInbox = moveToInbox,
                            MarkMailAsRead = markAsRead,
                            ReplyMail = replyMail,
                            ClickMail = clickMail,
                            ForwardMail = forwardMail,
                            ReplySenderDomain = senderDomains
                        };

                        String[] seedList = seeds.Split(',');

                        if (seeds != "")
                        {
                            foreach (String seedInList in seedList)
                            {
                                //Get the seed asociated to de bucket
                                Seed seed = db.Seed.Find(Guid.Parse(seedInList));

                                //Create a new seedBacketSeed
                                SeedBucketSeed seedBacketSeed = new SeedBucketSeed();
                                seedBacketSeed.Id = Guid.NewGuid();
                                seedBacketSeed.CreatedAt = DateTime.Now;
                                seedBacketSeed.Seed = seed;
                                seedBacketSeed.SeedBucket = seedBucket;

                                //add seedBacketSeed to SeedBucket
                                seedBucket.SeedBucketSeed.Add(seedBacketSeed);

                                //add SeedBucketSeed to SeedBacket
                                seed.SeedBucketSeed.Add(seedBacketSeed);

                                //add seedbucket to Seed
                                seed.SeedBucket = seedBucket;
                            }
                        }

                        if (!seedBucket.Name.Equals(""))
                        {
                            db.SeedBucket.Add(seedBucket);
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
                SeedBucketModelView seedBucketModelView = new SeedBucketModelView();

                try
                {
                    SeedBucket seedBucket = db.SeedBucket.Find(id);

                    seedBucketModelView.SeedBucket = seedBucket;

                    //Find all the seeds into the seedBucket
                    seedBucketModelView.SeedsInBucket = seedBucket.SeedBucketSeed.Select(s => s.Seed.Id).ToArray();

                    var allSeeds = db.Seed.ToList();

                    foreach (var seed in allSeeds)
                    {
                        if (seedBucketModelView.SeedsInBucket.Contains(seed.Id))
                        {
                            seedBucketModelView.AvalibleSeeds.Add(seed, true);
                        }
                        else
                        {
                            if (seed.SeedBucket == null)
                                seedBucketModelView.AvalibleSeeds.Add(seed, false);
                        }
                    }

                }
                catch (Exception ex)
                {
                    RavenClient ravenClient = Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                }
                return View(seedBucketModelView);
            }
        }

        public ActionResult Update(Guid idSeedBucket, String name, String description, String seeds, String senderDomains, bool markAsRead, bool moveToInbox, bool replyMail, bool forwardMail, bool clickMail)
        {
            using (DatabaseContext db = new DatabaseContext())
            {
                try
                {
                    SeedBucket seedBucket = db.SeedBucket.Find(idSeedBucket);
                    seedBucket.Name = name;
                    seedBucket.Description = description;
                    seedBucket.UpdatedAt = DateTime.Now;
                    seedBucket.MarkMailAsRead = markAsRead;
                    seedBucket.MoveMailToInbox = moveToInbox;
                    seedBucket.ReplyMail = replyMail;
                    seedBucket.ForwardMail = forwardMail;
                    seedBucket.ClickMail = clickMail;
                    seedBucket.ReplySenderDomain = senderDomains;

                    List<SeedBucketSeed> seedsBucketSeeds = seedBucket.SeedBucketSeed.ToList();

                    foreach (SeedBucketSeed seedBucketSeed in seedsBucketSeeds)
                    {
                        if (seedBucketSeed.Seed.SeedBucket != null)
                            seedBucketSeed.Seed.SeedBucket = null;

                        db.SeedBucketSeed.Remove(seedBucketSeed);
                    }

                    if (seeds != "")
                    {
                        String[] seedList = seeds.Split(',');

                        foreach (String seedInList in seedList)
                        {
                            //Get the seed asociated to de bucket
                            Seed seed = db.Seed.Find(Guid.Parse(seedInList));

                            //Create a new seedBacketSeed
                            SeedBucketSeed seedBacketSeed = new SeedBucketSeed();
                            seedBacketSeed.Id = Guid.NewGuid();
                            seedBacketSeed.CreatedAt = DateTime.Now;
                            seedBacketSeed.Seed = seed;
                            seedBacketSeed.SeedBucket = seedBucket;

                            //add seedBacketSeed to SeedBucket
                            seedBucket.SeedBucketSeed.Add(seedBacketSeed);

                            //add SeedBucketSeed to SeedBacket
                            seed.SeedBucketSeed.Add(seedBacketSeed);

                            //add seedbucket to Seed
                            seed.SeedBucket = seedBucket;
                        }
                    }

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
                    SeedBucket seedBucket = db.SeedBucket.Find(id);

                    List<SeedBucketSeed> seedsBucketSeeds = seedBucket.SeedBucketSeed.ToList();

                    foreach (SeedBucketSeed seedBucketSeed in seedsBucketSeeds)
                    {
                        db.SeedBucketSeed.Remove(seedBucketSeed);
                    }

                    db.SeedBucket.Remove(seedBucket);

                    db.SaveChanges();
                }
                catch (Exception ex)
                {
                    var ravenClient = Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                }

                return Redirect("/SeedBucket/Index");
            }

        }

        public ActionResult Run(Guid? id)
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
                        if (id != null)
                        {
                            SeedBucket seedBucket = db.SeedBucket.Find(id);

                            var bucketSeeds = seedBucket.SeedBucketSeed;

                            var count = bucketSeeds.Count();
                            foreach (var seed in bucketSeeds)
                            {
                                if (count == 1)
                                    seedsIds += seed.Seed.Id;
                                else
                                    seedsIds += seed.Seed.Id + " ";
                                count--;
                            }

                            p.StartInfo.Arguments = seedsIds;
                        }

                        p.StartInfo.FileName = "C:\\inetpub\\mailapp\\mailprocess\\MailProcess.exe";
                        p.Start();
                    }
                }
                catch (Exception ex)
                {
                    var ravenClient = Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                }

                if (id == null)
                    return Redirect("/Mail/Index");
                else
                    return Redirect("/SeedBucket/Index");
            }
        }
    }

}