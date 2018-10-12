using BusinessLogic;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using BusinessLogic.Model;
using SharpRaven.Data;
using SharpRaven;
using NLog;

namespace mail_app_process
{
    internal class AsyncController
    {
        public async Task AsyncLoadData(List<Seed> gmailSeeds, List<Seed> outlookSeeds, List<Seed> aolSeeds, List<Seed> yahooSeeds)
        {
            try
            {
                List<Task> tasksAccounts = new List<Task>();

                //load seeds from Gmail
                tasksAccounts.Add(Task.Run(() => LoadSeeds(gmailSeeds)));

                //load seeds from Outlook
                tasksAccounts.Add(Task.Run(() => LoadSeeds(outlookSeeds)));

                //load seeds from AOL
                tasksAccounts.Add(Task.Run(() => LoadSeeds(aolSeeds)));

                //load seeds from Yahoo
                tasksAccounts.Add(Task.Run(() => LoadSeeds(yahooSeeds)));

                await Task.WhenAll(tasksAccounts);

            }

            catch (Exception ex)
            {
                var ravenClient = Sentry.Instance;
                ravenClient.Capture(new SentryEvent(ex));
            }
        }

        public async Task LoadSeeds(List<Seed> seeds)
        {
            while (seeds.Count() > 0)
            {
                var seed = seeds[0];

                //log
                Logger logger = LogManager.GetCurrentClassLogger();
                logger.Info(("---Seed remaining to load " + seed.Provider.Name + ":" + seeds.Count()));

                seeds.RemoveAt(0);
                await LoadSeed(seed);
            }
        }

        public async Task LoadSeed(Seed account)
        {
            String providerName = account.Provider.Name.ToString().ToLower();

            MailAdapter.Dictionary.TryGetValue(providerName, out Dictionary<String, String> mailFolderMapper);

            mailFolderMapper.TryGetValue("Inbox", out String inboxFolder);

            mailFolderMapper.TryGetValue("Spam", out String spamFolder);

            List<Task> tasksAccounts = new List<Task>();

            if (inboxFolder != null && spamFolder != null)
            {
                //Read the Inbox folder on each client
                tasksAccounts.Add(Task.Run(() => new MailClient().GetMessagesAsync(account, inboxFolder, "Inbox")));

                //Read the Spam folder on each client
                tasksAccounts.Add(Task.Run(() => new MailClient().GetMessagesAsync(account, spamFolder, "Spam")));

            }
            else
            {
                RavenClient ravenClient = Sentry.Instance;
                ravenClient.Capture(new SentryEvent("There is no IMAP Client available!"));

                MailStorage runLog = new MailStorage();
                runLog.CreateRunLogEntry("Running", "End Load Seed: " + account.UserName);

            }

            await Task.WhenAll(tasksAccounts);
        }

    }
}