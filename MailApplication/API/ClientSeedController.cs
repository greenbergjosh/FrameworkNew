using BusinessLogic;
using BusinessLogic.Model;
using SharpRaven;
using SharpRaven.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MailApplication.API
{
    public class ClientSeedController : Controller
    {
        // GET: ClientSeed
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public ActionResult Seed(String apikey, String id)
        {
            try
            {
                using (var db = new DatabaseContext())
                {
                    //Validate existance of seedbucket and client - Authentication
                    Guid uuid = Guid.Parse(id);
                    SeedBucket seedBucket = db.SeedBucket.Where(sb => sb.UUID == uuid).First();
                    ICollection<SeedBucketSeed>[] querySeedBuckets = db.SeedBucket.Where(sb => sb.UUID == uuid).Select(sb => sb.SeedBucketSeed).ToArray();
                    IQueryable<Client> client = db.Client.Where(c => c.ApiKey.ToString() == apikey);

                    if (querySeedBuckets.Count() > 0 && client.Count() > 0)
                    {
                        List<Seed> seeds = AllSeeds(querySeedBuckets, db);
                        List<String> seedIntoJSON = new List<String>();

                        if (seeds.Count() > 0)
                        {
                            foreach (var seed in seeds)
                            {
                                //Create new APILog
                                ClientSeed apiLog = new ClientSeed();
                                apiLog.Id = Guid.NewGuid();
                                apiLog.Client = client.First();
                                apiLog.Seed = seed;
                                apiLog.CreatedAt = DateTime.Now;
                                apiLog.SeedBucket = seedBucket;

                                db.ClientSeed.Add(apiLog);
                                db.SaveChanges();

                                seedIntoJSON.Add(seed.UserName);

                            }
                            //Return Json with mail and createdDate
                            return Json(new { mail = seedIntoJSON }, JsonRequestBehavior.AllowGet);
                        }
                        else
                        {
                            return Json(new { info = "No data available!" }, JsonRequestBehavior.AllowGet);
                        }
                    }

                    return Json(new { info = "The SeedBucketId or APIKey are incorrect!" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                RavenClient ravenClient = Sentry.Instance;
                ravenClient.Capture(new SentryEvent(ex));
                return Json(new { info = ex }, JsonRequestBehavior.AllowGet);
            }
        }

        public Seed SeedSelection(ICollection<SeedBucketSeed>[] querySeedBuckets, IQueryable<Client> client, DatabaseContext db)
        {
            Seed seed = null;

            Boolean insertSeed = false;

            int count = 0;
            int numSeedOnBucket = querySeedBuckets.First().Count();

            while (!insertSeed && numSeedOnBucket != count)
            {
                var seedBucketSeed = querySeedBuckets.First().ElementAt(count);
                seed = db.Seed.Find(seedBucketSeed.Seed.Id);

                Boolean existRecord = db.ClientSeed.Any(sal => sal.Seed.Id == seed.Id);

                if (!existRecord)
                {
                    insertSeed = true;
                }
                else
                {
                    seed = null;
                }

                count++;
            }

            return seed;
        }

        public Seed SeedIncrementalSelection(Guid uuid, DatabaseContext db)
        {

            Seed seed = null;
            var query = ((from cs in db.ClientSeed
                          where cs.SeedBucket.UUID == uuid
                          select cs.Seed).Concat(from sbs in db.SeedBucketSeed
                                                 where sbs.SeedBucket.UUID == uuid
                                                 select sbs.Seed));

            var query2 = query.GroupBy(s => s.Id).Select(lg => new { Seed = lg.Select(se => se.Id), Count = lg.Count() });

            var query3 = query2.OrderBy(o => o.Count);

            Guid id = query3.First().Seed.First();
            seed = db.Seed.Find(id);
            return seed;

        }

        public List<Seed> AllSeeds(ICollection<SeedBucketSeed>[] querySeedBuckets, DatabaseContext db)
        {
            List<Seed> result = new List<Seed>();
            var randomSeeds = querySeedBuckets[0].OrderBy(_ => Guid.NewGuid());
            var count = 0;
            foreach (SeedBucketSeed seedBucket in randomSeeds)
            {
                var seed = db.Seed.Find(seedBucket.Seed.Id);
                result.Add(seed);
                count++;

                if (count > 9)
                    break;

            }
            return result;
        }

        [HttpGet]
        public ActionResult MailClassWarmUp(String mailClass, String apiKey)
        {
            try
            {
                using (var db = new DatabaseContext())
                {
                    var numOfSeeds = db.Seed.Count();
                    IQueryable<Client> client = db.Client.Where(c => c.ApiKey.ToString() == apiKey);

                    if (client.Count() > 0)
                    {
                        var mailClassWarmUp = db.MailClassWarmUp.Where(mc => mc.MailClass == mailClass).FirstOrDefault();

                        if (mailClassWarmUp != null)
                        {
                            Double numSeedsToReturn = numOfSeeds * (mailClassWarmUp.PortionMail / 100.0);
                            int numSeedsAprox = (int)Math.Round(numSeedsToReturn);

                            var seeds = db.Seed.Take(numSeedsAprox).ToList();
                            List<String> seedIntoJSON = new List<String>();
                            if (seeds.Count() > 0)
                            {
                                foreach (var seed in seeds)
                                {
                                    //Create new APILog
                                    ClientSeed apiLog = new ClientSeed();
                                    apiLog.Id = Guid.NewGuid();
                                    apiLog.Client = client.First();
                                    apiLog.Seed = seed;
                                    apiLog.CreatedAt = DateTime.Now;

                                    db.ClientSeed.Add(apiLog);
                                    db.SaveChanges();

                                    seedIntoJSON.Add(seed.UserName);

                                }
                                return Json(new { mail = seedIntoJSON }, JsonRequestBehavior.AllowGet);
                            }
                        }
                        return Json(new { info = "Invalid MailClass!" }, JsonRequestBehavior.AllowGet);

                    }
                    return Json(new { info = "Invalid API key!" }, JsonRequestBehavior.AllowGet);

                }
            }
            catch (Exception ex)
            {
                RavenClient ravenClient = Sentry.Instance;
                ravenClient.Capture(new SentryEvent(ex));
                return Json(new { info = ex }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}