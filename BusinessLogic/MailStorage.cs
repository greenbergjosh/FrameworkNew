using SharpRaven.Data;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using BusinessLogic.Model;
using SharpRaven;
using System.Linq;
using System.Data.Entity;
using MongoDB.Driver;
using MongoDB.Bson;
using NLog;

namespace BusinessLogic
{
    public class MailStorage
    {
        public async Task SaveMessageAsync(MailAdapter mailAdapter, Guid accountId)
        {
            using (var db = new DatabaseContext())
            {
                try
                {
                    //Store New Mail
                    var account = db.Seed.Find(accountId);
                    Mail newMail = new Mail(mailAdapter, account);
                    db.Mail.Add(newMail);

                    //Store Content
                    Content content = new Content(mailAdapter.HtmlBody, mailAdapter.TextBody, newMail);
                    db.Content.Add(content);

                    //Store Mail Headers and Headers
                    int seq = 0;
                    foreach (MimeKit.Header mailClientHeader in mailAdapter.Headers)
                    {
                        //Create mailHeader
                        MailHeader mailHeader = new MailHeader(newMail, mailClientHeader, seq);
                        db.MailHeader.Add(mailHeader);

                        //Create New Header and add it a MailHeader
                        Header newheader = new Header(mailClientHeader);
                        newheader.MailHeaders.Add(mailHeader);
                        db.Header.Add(newheader);

                        newMail.MailHeaders.Add(mailHeader);

                        seq++;
                    }

                    //Update Template Test
                    if (newMail.FromSeeder)
                    {
                        Guid templateID = Guid.Parse(newMail.TemplateTestID);
                        var templateTest = db.TemplateTest.Find(templateID);

                        if (templateTest != null)
                        {
                            templateTest.Result = newMail.FolderName;
                            templateTest.Mail = newMail;
                        }

                    }

                    await db.SaveChangesAsync().ConfigureAwait(continueOnCapturedContext: false);

                    Logger logger = LogManager.GetCurrentClassLogger();
                    logger.Info("End Load Seed: " + account.UserName + " Folder: " + mailAdapter.FolderName);

                }
                catch (Exception ex)
                {
                    RavenClient ravenClient = Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                }
            }
        }

        public String GetLastMailId(Seed account, String folder)
        {
            using (DatabaseContext db = new DatabaseContext())
            {
                try
                {
                    var mId = db.Mail.Where(m => m.Seed.Id.Equals(account.Id) && m.FolderName.Equals(folder)).OrderByDescending(m => m.Date).Take(1).Select(m => m.MessageId);
                    
                    var result = mId.ToList().First();
                    return result;
                }
                catch
                {
                    return "0";
                }
            }

        }

        public static EmailLogValues searchEmailLog(string trackingid)
        {
            //INITIATE OBJECT
            EmailLogValues obj = new EmailLogValues();

            var connectionString = "mongodb://useremail219:+S|WvU$SeU@52.54.178.111:27017/Emailservice";
            //var connectionStringUY = "mongodb://user*212UY:8qjTGF+YY71ousn@54.233.231.217:27017/Emailservice";

            var mongoUrl = MongoUrl.Create(connectionString);
            var client = new MongoClient(connectionString);
            var _database = client.GetDatabase("Emailservice");

            //get collection
            var collection = _database.GetCollection<BsonDocument>("EmailLogs");
            List<BsonDocument> result = new List<BsonDocument>();

            //Create filter
            var builder = Builders<BsonDocument>.Filter;
            var filter = builder.And(
                    builder.Eq("tracking_id", trackingid)
                );
            var leads = collection.Find(filter).ToList();

            if (leads.Count() > 0)
            {
                obj.email = leads[0]["email"].ToString();
                obj.domain_id = leads[0]["domain_id"].ToString();
                obj.lead_code = leads[0]["lead_code"].ToString();
                obj.campaign_id = leads[0]["campaign_id"].ToInt32();
                obj.html_id = leads[0]["html_id"].ToInt32();
            }
            return obj;
        }

        public async Task CreateSeedLogEntry(Guid seed_id, Int32 remainingReplys, Int32 remainingForwards)
        {
            using (var db = new DatabaseContext())
            {
                var today = DateTime.Now.Date;
                var logRegister = db.SeedLog.Where(l => l.LastRun == today && l.Seed_Id == seed_id).FirstOrDefault();

                if (logRegister == null)
                {
                    SeedLog log = new SeedLog(today, seed_id, remainingReplys, remainingForwards);
                    db.SeedLog.Add(log);

                }
                else
                {
                    logRegister.NumForwards = remainingForwards;
                    logRegister.NumReplys = remainingReplys;
                }

                await db.SaveChangesAsync().ConfigureAwait(continueOnCapturedContext: false);
            }
        }

        public int GetRemainingsReplysOrForwards(Seed seed, String remainingType)
        {
            int remainingValue = 0;

            using (var db = new DatabaseContext())
            {
                var today = DateTime.Now.Date;
                var logRegister = db.SeedLog.Where(l => l.LastRun == today && l.Seed_Id == seed.Id).FirstOrDefault();

                if (logRegister != null)
                {
                    if (remainingType == "replys")
                        remainingValue = logRegister.NumReplys;
                    else
                        remainingValue = logRegister.NumForwards;
                }

            }

            return remainingValue;
        }

        public void CreateRunLogEntry(String status, String message)
        {
            using (var db = new DatabaseContext())
            {
                DateTime now = DateTime.Now;
                Guid id = Guid.NewGuid();

                RunLog runLogEntry = new RunLog();

                runLogEntry.Id = id;
                runLogEntry.RunTime = now;
                runLogEntry.Status = status;
                runLogEntry.Description = message;

                db.RunLog.Add(runLogEntry);
                db.SaveChanges();
            }
        }
    }
}
