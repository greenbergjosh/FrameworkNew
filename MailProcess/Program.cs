using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessLogic;
using BusinessLogic.Model;
using SharpRaven.Data;
using System.Data.Entity;
using NLog;

namespace mail_app_process
{
    class Program
    {
        public static void Main(string[] args)
        {
            try
            {
                using (var db = new DatabaseContext())
                {
                    var configuration = LogManager.Configuration;
                    Logger logger = LogManager.GetCurrentClassLogger();
                    logger.Info("Start Seeder");

                    MailStorage runLog = new MailStorage();
                    runLog.CreateRunLogEntry("Start", "Start to load mails");

                    //Create list of seeds per provider
                    List<Seed> gmailSeeds = new List<Seed>();
                    List<Seed> outlookSeeds = new List<Seed>();
                    List<Seed> aolSeeds = new List<Seed>();
                    List<Seed> yahooSeeds = new List<Seed>();

                    if (args.Length > 0)
                    {
                        foreach (var seedId in args)
                        {
                            Seed s = db.Seed.Find(Guid.Parse(seedId));

                            if (s != null)
                            {
                                if (s.Provider.Name.ToLower() == "gmail")
                                    gmailSeeds.Add(s);
                                if (s.Provider.Name.ToLower() == "outlook")
                                    outlookSeeds.Add(s);
                                if (s.Provider.Name.ToLower() == "aol")
                                    aolSeeds.Add(s);
                                if (s.Provider.Name.ToLower() == "yahoo")
                                    yahooSeeds.Add(s);
                            }
                        }
                    }
                    else
                    {
                        gmailSeeds = db.Seed.Include(c => c.Provider).Where(p => p.Provider.Name.ToLower() == "gmail").ToList();

                        outlookSeeds = db.Seed.Include(c => c.Provider).Where(p => p.Provider.Name.ToLower() == "outlook").ToList();

                        aolSeeds = db.Seed.Include(c => c.Provider).Where(p => p.Provider.Name.ToLower() == "aol").ToList();

                        yahooSeeds = db.Seed.Include(c => c.Provider).Where(p => p.Provider.Name.ToLower() == "yahoo").ToList();


                    }
                    AsyncController ac = new AsyncController();
                    Task run = ac.AsyncLoadData(gmailSeeds, outlookSeeds, aolSeeds, yahooSeeds);

                    run.Wait();
                    logger.Info("End Seeder");
                    runLog.CreateRunLogEntry("End", "End of messages load");
                }
            }
            catch (Exception ex)
            {
                var ravenClient = Sentry.Instance;
                ravenClient.Capture(new SentryEvent(ex));
            }


        }
    }
}
