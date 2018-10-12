using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using GenericEntity;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;
using Jw = Utility.JsonWrapper;

namespace SeleniumSandbox
{
    class Program
    {
        public static async Task Main(string[] args)
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
            string cs = configuration.GetConnectionString("DefaultConnection");

            await SqlWrapper.InsertErrorLog(cs, 1, "UnsubJob",
                           "Main", "Starting...", "");

            IGenericEntity pas = await GetPostmasterAccounts(cs);

            foreach (var ps in pas.GetL(""))
            {
                string pmAcctId = ps.GetS("Id");
                string username = ps.GetS("Credentials/Username");
                string password = ps.GetS("Credentials/Password");
                string url = ps.GetS("Credentials/Url");
                string type = ps.GetS("Credentials/Type");

                if (type == "Hotmail")
                {
                    string apiKey = ps.GetS("Credentials/ApiKey");
                    await DoHotmail(cs, pmAcctId, username, password, url, apiKey);
                }
                else if (type == "Gmail")
                {
                    await DoGmail(cs, pmAcctId, username, password, url);
                }
            }
        }

        public static async Task DoHotmail(string cs, string pmAcctId, string username, string password,
            string url, string apiKey)
        {
            // Get standard data - go back to prior days and update
            string dataUrl = "https://sendersupport.olc.protection.outlook.com/snds/data.aspx?";
            string finalDataUrl = dataUrl + "&key=" + apiKey;
            DateTime now = DateTime.Now.AddDays(-1);
            for (int i = 0; i < 14; i++)
            {
                string rqstDate = now.AddDays(-1 * i).ToString("MMddyy");

                string ret1 = (string)await Utility.ProtocolClient.DownloadPage(finalDataUrl + "&date=" + rqstDate, null, null, null);

                string retj1 = Utility.JsonWrapper.ConvertCsvToJson(ret1,
                    new List<string> { "ip", "sap", "eap", "rcpt", "data", "mrc", "fr", "cr",
                                        "tmps", "tmpe", "thc", "helo", "from", "cmnt"});

                await SqlWrapper.SqlServerProviderEntry(cs,
                        "InsertData",
                        Jw.Json(new { PostmasterAccountId = pmAcctId }),
                        retj1);
            }

            // Get active ips
            string ips = await SqlWrapper.SqlServerProviderEntry(cs,
                            "SelectIps",
                            Jw.Json(new { ActiveWithinDays = 14 }),
                            "");
            IGenericEntity ipge = new GenericEntityJson();
            var state = JsonConvert.DeserializeObject(ips);
            ipge.InitializeEntity(null, null, state);

            // Get blacklist emails
            foreach (var ip in ipge.GetL(""))
            {
                for (int i = 0; i < 14; i++)
                {
                    string rqstDate = now.AddDays(-1 * i).ToString("MMddyy");

                    string baseStr = "https://sendersupport.olc.protection.outlook.com/snds/data.aspx?" + "&key=" + apiKey;
                    string trapStr = baseStr + "&ip=" + ip.GetS("Ip") + "&sampletype=trap&date=" + rqstDate;
                    string compStr = baseStr + "&ip=" + ip.GetS("Ip") + "&sampletype=complaint&date=" + rqstDate;
                    string ret3 = (string)await Utility.ProtocolClient.DownloadPage(trapStr, null, null, null);
                    string ret4 = (string)await Utility.ProtocolClient.DownloadPage(compStr, null, null, null);

                    if (!string.IsNullOrEmpty(ret3))
                    {
                        var trapEmail = ParseEmail(ret3);

                        await SqlWrapper.SqlServerProviderEntry(cs,
                            "InsertBlacklist",
                            Jw.Json(new
                            {
                                PostmasterAccountId = pmAcctId,
                                IpAddress = ip.GetS("Ip"),
                                ComplaintType = "trap",
                                ComplaintDate = now.AddDays(-1 * i),
                                Content = Utility.Hashing.EncodeTo64(ret3),
                                ParsedOriginalRecipient = trapEmail.Item2,
                                ParsedTo = trapEmail.Item1
                            }),
                            "");
                    }

                    if (!string.IsNullOrEmpty(ret4))
                    {
                        var compEmail = ParseEmail(ret4);

                        await SqlWrapper.SqlServerProviderEntry(cs,
                            "InsertBlacklist",
                            Jw.Json(new
                            {
                                PostmasterAccountId = pmAcctId,
                                IpAddress = ip.GetS("Ip"),
                                ComplaintType = "complaint",
                                ComplaintDate = now.AddDays(-1 * i),
                                Content = Utility.Hashing.EncodeTo64(ret4),
                                ParsedOriginalRecipient = compEmail.Item2,
                                ParsedTo = compEmail.Item1
                            }),
                            "");
                    }
                }
            }

            // IP Status - PK includes date called
            string ipStatusUrl = "https://sendersupport.olc.protection.outlook.com/snds/ipStatus.aspx?";
            string finalIpStatusUrl = ipStatusUrl + "key=" + apiKey;

            string ret2 = (string)await Utility.ProtocolClient.DownloadPage(finalIpStatusUrl, null, null, null);

            string retj2 = Utility.JsonWrapper.ConvertCsvToJson(ret2,
                new List<string> { "fip", "lip", "blk", "det" });

            await SqlWrapper.SqlServerProviderEntry(cs,
                    "InsertIpStatus",
                    Jw.Json(new { PostmasterAccountId = pmAcctId }),
                    retj2);
        }

        public static Tuple<string, string> ParseEmail(string message)
        {
            string oremail = "";
            string toemail = "";
            using (StringReader reader = new StringReader(message))
            {
                string line;
                while ((line = reader.ReadLine()) != null)
                {
                    try
                    {
                        if (line.StartsWith("X-HmXmrOriginalRecipient:"))
                        {
                            oremail = line.Substring(line.IndexOf('<') + 1,
                                line.IndexOf('>') - line.IndexOf('<') - 1);
                        }

                        if (line.StartsWith("To:"))
                        {
                            toemail = line.Substring(line.IndexOf('<') + 1,
                                line.IndexOf('>') - line.IndexOf('<') - 1);
                        }
                    }
                    catch (Exception parseException) { }
                }
            }

            return new Tuple<string, string>(toemail, oremail);
        }

        public static async Task<IGenericEntity> GetPostmasterAccounts(string conString)
        {
            string network = await SqlWrapper.SqlServerProviderEntry(conString,
                    "SelectPostmasterAccounts",
                    "",
                    "");
            IGenericEntity ge = new GenericEntityJson();
            var state = JsonConvert.DeserializeObject(network);
            ge.InitializeEntity(null, null, state);
            return ge;
        }

        public static async Task DoGmail(string cs, string pmAcctId, string username, string pswd,
            string url)
        {
            try
            {
                // Log in
                IWebDriver driver = new ChromeDriver(@"C:\inetpub\wwwroot\PostMasterTool\chromedriver_win32");
                driver.Navigate().GoToUrl(url);
                driver.Manage().Timeouts().ImplicitWait = new TimeSpan(0, 0, 2);
                IWebElement email_phone = driver.FindElement(By.XPath("//input[@id='identifierId']"));
                email_phone.SendKeys(username);
                driver.FindElement(By.Id("identifierNext")).Click();
                IWebElement password = driver.FindElement(By.XPath("//input[@name='password']"));
                WebDriverWait wait = new WebDriverWait(driver, new TimeSpan(0, 0, 10));
                var element = wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementToBeClickable(password));
                password.SendKeys(pswd);
                driver.FindElement(By.Id("passwordNext")).Click();

                // Read list of domains - wait until table stops getting new rows
                IList<IWebElement> tableRows = null;
                int lastCount = 0;
                while (true)
                {
                    tableRows = driver.FindElements(By.XPath("//div[@role='row']"));

                    if (tableRows.Count > 1 && tableRows.Count == lastCount) break;
                    else
                    {
                        lastCount = tableRows.Count;
                        Wait(driver, 1000, 500);
                    }
                }

                List<Tuple<string, string, string>> domains = new List<Tuple<string, string, string>>();
                foreach (IWebElement row in tableRows)
                {
                    IList<IWebElement> rowCells = row.FindElements(By.XPath(".//div[@role='gridcell']"));
                    if (rowCells.Count == 0) continue;
                    // domain, status, added
                    domains.Add(new Tuple<string, string, string>(rowCells[0].Text, rowCells[1].Text, rowCells[2].Text));
                }

                string jsdoms = Utility.JsonWrapper.JsonTuple<Tuple<string, string, string>>
                    (domains, new List<string>() { "nm", "st", "dp" },
                    new bool[] { true, true, true });

                string doms = await SqlWrapper.SqlServerProviderEntry(cs,
                   "InsertGmailDomainStatus",
                   Jw.Json(new { PostmasterAccountId = pmAcctId }),
                   jsdoms);
                IGenericEntity gedoms = new GenericEntityJson();
                var state = JsonConvert.DeserializeObject(doms);
                gedoms.InitializeEntity(null, null, state);

                List<string> sections = new List<string>()
                {
                    "userReportedSpamRate",
                    "ipReputation-Ugly%2CipReputation-Bad%2CipReputation-Good%2CipReputation-Beautiful",
                    "domainReputation",
                    "feedbackLoopAverageCampaignSpamRate%2CfeedbackLoopCampaignCount",
                    "dkimRate%2CspfRate%2CdmarcRate",
                    "inboundTLSRate%2CoutboundTLSRate",
                    "inboundDeliveryErrorRate"
                };

                foreach (var domain in gedoms.GetL(""))
                {
                    string domId = domain.GetS("Id");
                    string dom1 = domain.GetS("Name");
                    string pre = "https://postmaster.google.com/dashboards#do=";
                    string post = "&dr=7";
                    string dompart = dom1;

                    // Section 0
                    try
                    {
                        driver.Navigate().GoToUrl(pre + dompart + "&st=" + sections[0] + post);
                        Wait(driver, 4000, 500);

                        if (!driver.PageSource.Contains("No data to display at this time"))
                        {
                            IList<IWebElement> dateCells = driver.FindElements(By.XPath("//td[starts-with(@class,'google-visualization-table-type-date')]"));
                            IList<IWebElement> numberCells = driver.FindElements(By.XPath("//td[starts-with(@class,'google-visualization-table-type-number')]"));

                            List<Tuple<string, string, string>> spamRate = new List<Tuple<string, string, string>>();
                            for (int i = 0; i < dateCells.Count; i++)
                            {
                                string date = dateCells[i].Text;
                                string num = numberCells[i].Text;
                                spamRate.Add(new Tuple<string, string, string>(domId, date, num));
                            }

                            string jsSpam = Utility.JsonWrapper.JsonTuple<Tuple<string, string, string>>
                                (spamRate, new List<string>() { "id", "sd", "sr" },
                                new bool[] { true, true, true });

                            await SqlWrapper.SqlServerProviderEntry(cs,
                               "InsertDomainSpamRate",
                               "",
                               jsSpam);
                        }
                    }
                    catch (Exception ex)
                    {
                        await SqlWrapper.InsertErrorLog(cs, 1000, "Postmaster", "DoGmail",
                            "Section 0 Exception", ex.ToString());
                    }


                    // Section 1
                    try
                    {

                        driver.Navigate().GoToUrl(pre + dompart + "&st=" + sections[1] + post);
                        Wait(driver, 2000, 500);

                        if (!driver.PageSource.Contains("No data to display at this time"))
                        {
                            IWebElement chart = driver.FindElement(By.XPath("//*[name()='svg']//*[name()='g' and starts-with(@clip-path,'url')]"));
                            IList<IWebElement> bars = chart.FindElements(By.XPath("(./*[name()='g'])[2]/*[name()='rect' and @fill='#f2a600']"));

                            List<Tuple<string, string, DateTime, string>> domIpRep
                                        = new List<Tuple<string, string, DateTime, string>>();
                            foreach (var bar in bars)
                            {
                                Actions actions = new Actions(driver);
                                actions.MoveToElement(bar).Click().Build().Perform();
                                Wait(driver, 500, 500);

                                IWebElement ipHdr = driver.FindElement(By.XPath("//tr[@class='google-visualization-table-tr-head']/th"));
                                string[] hdrParts = ipHdr.Text.Split(' ');
                                string reputation = hdrParts[0];
                                DateTime repDate = ParseDateFromHeader(hdrParts);

                                IList<IWebElement> ips = driver.FindElements(By.XPath("//table[@class='google-visualization-table-table']/tbody/tr/td"));
                                foreach (var ip in ips)
                                {
                                    string ipaddr = ip.Text;
                                    domIpRep.Add(new Tuple<string, string, DateTime, string>
                                        (domId, ipaddr, repDate, reputation));
                                }

                            }

                            string jsIpRep = Utility.JsonWrapper.JsonTuple<Tuple<string, string, DateTime, string>>
                                (domIpRep, new List<string>() { "id", "ip", "rd", "rp" },
                                new bool[] { true, true, true, true });

                            await SqlWrapper.SqlServerProviderEntry(cs,
                               "InsertDomainIpReputation",
                               "",
                               jsIpRep);
                        }
                    }
                    catch (Exception ex)
                    {
                        await SqlWrapper.InsertErrorLog(cs, 1000, "Postmaster", "DoGmail",
                            "Section 1 Exception", ex.ToString());
                    }

                    // Section 2
                    try
                    {
                        driver.Navigate().GoToUrl(pre + dompart + "&st=" + sections[2] + post);
                        Wait(driver, 4000, 500);

                        if (!driver.PageSource.Contains("No data to display at this time"))
                        {
                            List<Tuple<string, string, string>> domRep
                                    = new List<Tuple<string, string, string>>();
                            //IList<IWebElement> domreprows = driver.FindElements(By.XPath("//table[@class='google-visualization-table-table']/tbody/tr"));
                            IList<IWebElement> domreprows = driver.FindElements(By.XPath("//table[@class='google-visualization-table-table']/tbody/*"));


                            foreach (var domreprow in domreprows)
                            {
                                string domrepdate = domreprow.FindElement(By.XPath("td[starts-with(@class,'google-visualization-table-type-date')]")).Text;
                                string domrep = domreprow.FindElement(By.XPath("td[starts-with(@class,'google-visualization-table-type-number')]")).Text;
                                domRep.Add(new Tuple<string, string, string>
                                            (domId, domrepdate, domrep));
                            }

                            string jsDomRep = Utility.JsonWrapper.JsonTuple<Tuple<string, string, string>>
                                (domRep, new List<string>() { "id", "rd", "rp" },
                                new bool[] { true, true, true });

                            await SqlWrapper.SqlServerProviderEntry(cs,
                               "InsertDomainReputation",
                               "",
                               jsDomRep);
                        }
                    }
                    catch (Exception ex)
                    {
                        await SqlWrapper.InsertErrorLog(cs, 1000, "Postmaster", "DoGmail",
                            "Section 2 Exception", ex.ToString());
                    }

                    // Section 3
                    try
                    {
                        driver.Navigate().GoToUrl(pre + dompart + "&st=" + sections[3] + post);
                        Wait(driver, 4000, 500);

                        if (!driver.PageSource.Contains("No data to display at this time"))
                        {
                            IWebElement chart2 = driver.FindElement(By.XPath("//*[name()='svg']//*[name()='g' and starts-with(@clip-path,'url')]"));
                            IList<IWebElement> bars2 = chart2.FindElements(By.XPath("(./*[name()='g'])[2]/*[name()='rect']"));

                            List<Tuple<string, string, string, DateTime>> domFb
                                        = new List<Tuple<string, string, string, DateTime>>();
                            foreach (var bar in bars2)
                            {
                                Actions actions = new Actions(driver);
                                actions.MoveToElement(bar).Click().Build().Perform();
                                Wait(driver, 500, 500);

                                try
                                {
                                    IWebElement ipHdr = driver.FindElement(By.XPath("//tr[@class='google-visualization-table-tr-head']/th"));
                                    string[] hdrParts = ipHdr.Text.Split(' ');
                                    DateTime fbDate = ParseDateFromHeader(hdrParts);
                                    IList<IWebElement> fbrows = driver.FindElements(By.XPath("//table[@class='google-visualization-table-table']/tbody/tr"));
                                    foreach (var fbrow in fbrows)
                                    {
                                        string fbid = fbrow.FindElement(By.XPath("td[1]")).Text;
                                        string fbspamrate = fbrow.FindElement(By.XPath("td[2]")).Text;
                                        domFb.Add(new Tuple<string, string, string, DateTime>
                                            (domId, fbid, fbspamrate, fbDate));
                                    }
                                }
                                catch (Exception ex)
                                { }
                            }

                            string jsFb = Utility.JsonWrapper.JsonTuple<Tuple<string, string, string, DateTime>>
                                (domFb, new List<string>() { "id", "fbid", "sr", "fd" },
                                new bool[] { true, true, true, true });

                            await SqlWrapper.SqlServerProviderEntry(cs,
                               "InsertDomainFeedbackLoop",
                               "",
                               jsFb);
                        }
                    }
                    catch (Exception ex)
                    {
                        await SqlWrapper.InsertErrorLog(cs, 1000, "Postmaster", "DoGmail",
                            "Section 3 Exception", ex.ToString());
                    }

                    // Section 4
                    try
                    {
                        driver.Navigate().GoToUrl(pre + dompart + "&st=" + sections[4] + post);
                        Wait(driver, 4000, 500);

                        if (!driver.PageSource.Contains("No data to display at this time"))
                        {
                            IList<IWebElement> authtrafrows = driver.FindElements(By.XPath("//table[@class='google-visualization-table-table']/tbody/tr"));

                            List<Tuple<string, string, string, string, string>> domAuth
                                        = new List<Tuple<string, string, string, string, string>>();
                            foreach (var authtrafrow in authtrafrows)
                            {
                                string authdate = authtrafrow.FindElement(By.XPath("td[1]")).Text;
                                string authdkimsuccrate = authtrafrow.FindElement(By.XPath("td[2]")).Text;
                                string authspfsuccrate = authtrafrow.FindElement(By.XPath("td[3]")).Text;
                                string authdmarcsuccrate = authtrafrow.FindElement(By.XPath("td[4]")).Text;
                                domAuth.Add(new Tuple<string, string, string, string, string>
                                            (domId, authdate, authdkimsuccrate, authspfsuccrate, authdmarcsuccrate));
                            }

                            string jsAuth = Utility.JsonWrapper.JsonTuple<Tuple<string, string, string, string, string>>
                                (domAuth, new List<string>() { "id", "ad", "dkim", "spf", "dmarc" },
                                new bool[] { true, true, true, true, true });

                            await SqlWrapper.SqlServerProviderEntry(cs,
                               "InsertDomainAuth",
                               "",
                               jsAuth);
                        }
                    }
                    catch (Exception ex)
                    {
                        await SqlWrapper.InsertErrorLog(cs, 1000, "Postmaster", "DoGmail",
                            "Section 4 Exception", ex.ToString());
                    }

                    // Section 5
                    try
                    {
                        driver.Navigate().GoToUrl(pre + dompart + "&st=" + sections[5] + post);
                        Wait(driver, 2000, 500);

                        if (!driver.PageSource.Contains("No data to display at this time"))
                        {
                            IList<IWebElement> encryptrows = driver.FindElements(By.XPath("//table[@class='google-visualization-table-table']/tbody/tr"));

                            List<Tuple<string, string, string, string>> domEnc
                                        = new List<Tuple<string, string, string, string>>();
                            foreach (var encryptrow in encryptrows)
                            {
                                string encdate = encryptrow.FindElement(By.XPath("td[1]")).Text;
                                string inboundtls = encryptrow.FindElement(By.XPath("td[2]")).Text;
                                string outboundtls = encryptrow.FindElement(By.XPath("td[3]")).Text;
                                domEnc.Add(new Tuple<string, string, string, string>
                                            (domId, encdate, inboundtls, outboundtls));
                            }

                            string jsEnc = Utility.JsonWrapper.JsonTuple<Tuple<string, string, string, string>>
                                (domEnc, new List<string>() { "id", "ed", "itls", "otls" },
                                new bool[] { true, true, true, true });

                            await SqlWrapper.SqlServerProviderEntry(cs,
                               "InsertDomainEnc",
                               "",
                               jsEnc);
                        }
                    }
                    catch (Exception ex)
                    {
                        await SqlWrapper.InsertErrorLog(cs, 1000, "Postmaster", "DoGmail",
                            "Section 5 Exception", ex.ToString());
                    }

                    // Section 6
                    try
                    {
                        driver.Navigate().GoToUrl(pre + dompart + "&st=" + sections[6] + post);
                        Wait(driver, 2000, 500);

                        if (!driver.PageSource.Contains("No data to display at this time"))
                        {

                            IList<IWebElement> circleG = driver.FindElements(By.XPath("//*[name()='svg']//*[name()='g' and starts-with(@clip-path,'url')]/following-sibling::*[name()='g']"));
                            IList<IWebElement> startCircles = circleG[0].FindElements(By.XPath("./*[name()='circle']"));
                            List<Tuple<string, DateTime, string, string, string>> domErr
                                        = new List<Tuple<string, DateTime, string, string, string>>();
                            int initialCircleCount = startCircles.Count;
                            for (int i = 0; i < initialCircleCount; i++)
                            {
                                Actions a2 = new Actions(driver);
                                int circlePos = 0;
                                if (i == 0 || i == 1) circlePos = 0;
                                else circlePos = i - 1;
                                a2.MoveToElement(startCircles[circlePos]).Click().Build().Perform();

                                IList<IWebElement> clickableCircles = null;
                                try
                                {
                                    circleG = driver.FindElements(By.XPath("//*[name()='svg']//*[name()='g' and starts-with(@clip-path,'url')]/following-sibling::*[name()='g']"));
                                    clickableCircles = circleG[0].FindElements(By.XPath("./*[name()='g']/*[name()='circle']"));
                                    Actions actions = new Actions(driver);
                                    actions.MoveToElement(clickableCircles[0]).Click().Build().Perform();
                                }
                                catch (Exception noDataExc)
                                { }

                                try
                                {
                                    DateTime errdate = DateTime.Now;
                                    IList<IWebElement> erHdr = driver.FindElements(By.XPath("//tr[@class='google-visualization-table-tr-head']/th"));
                                    if (erHdr.Count > 0)
                                    {
                                        string hdr = erHdr[0].Text;
                                        errdate = ParseDateFromHeader(hdr.Split(' '));
                                        IList<IWebElement> fbrows = driver.FindElements(By.XPath("//table[@class='google-visualization-table-table']/tbody/tr"));
                                        foreach (var fbrow in fbrows)
                                        {
                                            string errType = fbrow.FindElement(By.XPath("td[1]")).Text;
                                            string reason = fbrow.FindElement(By.XPath("td[2]")).Text;
                                            string percentage = fbrow.FindElement(By.XPath("td[3]")).Text;
                                            domErr.Add(new Tuple<string, DateTime, string, string, string>
                                                (domId, errdate, errType, reason, percentage));
                                        }
                                    }
                                }
                                catch (Exception ex)
                                { }

                                circleG = driver.FindElements(By.XPath("//*[name()='svg']//*[name()='g' and starts-with(@clip-path,'url')]/following-sibling::*[name()='g']"));
                                startCircles = circleG[0].FindElements(By.XPath("./*[name()='circle']"));

                                var button = driver.FindElement(By.Id("a0-i"));
                                button.Click();
                                button.Click();
                            }

                            if (domErr.Count > 0)
                            {
                                string jsErr = Utility.JsonWrapper.JsonTuple<Tuple<string, DateTime, string, string, string>>
                                                                (domErr, new List<string>() { "id", "ed", "et", "er", "p" },
                                                                new bool[] { true, true, true, true, true });

                                await SqlWrapper.SqlServerProviderEntry(cs,
                                   "InsertDomainDeliveryError",
                                   "",
                                   jsErr);
                            }


                        }
                    }
                    catch (Exception ex)
                    {
                        await SqlWrapper.InsertErrorLog(cs, 1000, "Postmaster", "DoGmail",
                            "Section 6 Exception", ex.ToString());
                    }
                }

                driver.Quit();
            }
            catch (Exception ex)
            {
                int i = 0;
            }

        }

        public static DateTime ParseDateFromHeader(string[] hdrParts)
        {
            string dayNumber = hdrParts[hdrParts.Length - 1];
            string month = hdrParts[hdrParts.Length - 2];
            DateTime repDate = DateTime.Now;
            if ((DateTime.Now.Month >= 1 && DateTime.Now.Month <= 6)
                && ((month == "December") || (month == "November") || (month == "October")
                        || (month == "September")))
            {
                repDate = new DateTime(DateTime.Now.AddYears(-1).Year,
                    Utility.DateWrapper.MonthFullNameToNumber[month], Int32.Parse(dayNumber));
            }
            else
            {
                repDate = new DateTime(DateTime.Now.Year,
                    Utility.DateWrapper.MonthFullNameToNumber[month], Int32.Parse(dayNumber));
            }
            return repDate;
        }

        public static void Wait(IWebDriver driver, double delay, double interval)
        {
            // Causes the WebDriver to wait for at least a fixed delay
            var now = DateTime.Now;
            var wait = new WebDriverWait(driver, TimeSpan.FromMilliseconds(delay));
            wait.PollingInterval = TimeSpan.FromMilliseconds(interval);
            wait.Until(wd => (DateTime.Now - now) - TimeSpan.FromMilliseconds(delay) > TimeSpan.Zero);
        }

        public static void Hover(IWebDriver driver, IWebElement webElement)
        {
            string javaScript = "var evObj = document.createEvent('MouseEvents');" +
                "evObj.initMouseEvent(\"mouseover\",true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);" +
                "arguments[0].dispatchEvent(evObj);";

            IJavaScriptExecutor executor = driver as IJavaScriptExecutor;
            executor.ExecuteScript(javaScript, webElement);
        }

        public static void Nothing()
        {
            //IWebDriver driver = new ChromeDriver(@"E:\Workspace\Postmaster");
            //string url = "https://postmaster.live.com/snds/data.aspx";
            //driver.Navigate().GoToUrl(url);
            //driver.Manage().Timeouts().ImplicitWait = new TimeSpan(0, 0, 2);
            ////string ss = driver.PageSource;
            //IWebElement email_phone = driver.FindElement(By.XPath("//input[@type='email']"));
            //email_phone.SendKeys("pmdirectmarket@hotmail.com");
            //driver.FindElement(By.XPath("//input[@value='Next']")).Click();
            //IWebElement password = driver.FindElement(By.XPath("//input[@type='password']"));
            //WebDriverWait wait = new WebDriverWait(driver, new TimeSpan(0, 0, 10));
            //var element = wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementToBeClickable(password));
            //password.SendKeys("P@ndora714!");
            //driver.FindElement(By.XPath("//input[@value='Sign in']")).Click();


            //driver.Quit();


            //IList<IWebElement> children = domreprow.FindElements(By.XPath("*"));
            //foreach (var child in children)
            //{
            //    string tag = child.TagName;
            //}
        }
    }
}
