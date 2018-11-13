using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using SharpRaven;
using SharpRaven.Data;
using MailApplication.Models;
using BusinessLogic;
using BusinessLogic.Model;
using NReco.ImageGenerator;
using PagedList;
using System.Diagnostics;

namespace MailApp.Controllers
{
    [Authorize(Roles = "USER, SUPER USER")]
    public class MailController : Controller
    {
        public ViewResult Index(Guid? seedId, int? page, int? pageSize, DateTime? startDate, DateTime? endDate, String tableSort, String sortOrder, String searchId, String searchSenderDomain, String searchFrom, String searchSubject, String searchFolder, String visibilityId, String seedUserName, String campaignName, String templateName, String inReplayTo, String resentMessageId, String datefilter, String seedISP)
        {
            using (DatabaseContext db = new DatabaseContext())
            {
                try
                {
                    if (pageSize == null)
                    {
                        pageSize = 20;

                    }

                    ViewBag.pageSize = pageSize;

                    int pageNumber = (page ?? 1);

                    var query = MailQueryWithFilters(db, seedId, startDate, endDate, searchId, searchSenderDomain, searchFrom, searchSubject, searchFolder, seedUserName, campaignName, templateName, inReplayTo, resentMessageId, datefilter, seedISP);


                    IPagedList<Mail> messages;
                    if (sortOrder == null)
                    {
                        sortOrder = "DESC";
                        ViewBag.sortOrder = sortOrder;
                    }


                    //Sort
                    query = SortMailQuery(db, sortOrder, query, tableSort, visibilityId);

                    messages = query.ToPagedList(pageNumber, (int)pageSize);

                    //Seeds
                    var seeds = db.Seed;
                    List<Seed> accounts = seeds.ToList();


                    MailViewModel mailViewModel = new MailViewModel { Messages = messages, Accounts = accounts };


                    return View(mailViewModel);

                }
                catch (Exception ex)
                {
                    RavenClient ravenClient = Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                    return View();
                }

            }
        }

        public ActionResult Show(Guid id)
        {
            using (DatabaseContext db = new DatabaseContext())
            {
                MailShowViewModel mailShowView = new MailShowViewModel();
                try
                {

                    IQueryable<Mail> query = db.Mail.Where(m => m.Id == id);
                    List<Mail> mails = query.ToList();

                    List<Header> headers = db.Header.Where(h => h.MailHeaders.Any(mh => mh.Mail.Id == id)).ToList();

                    mailShowView.Messages = mails.First();
                    mailShowView.Headers = headers;


                }
                catch (Exception ex)
                {
                    RavenClient ravenClient = Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                    return View();
                }

                return View(mailShowView);
            }
        }

        public IQueryable<Mail> MailQueryWithFilters(DatabaseContext db, Guid? seedId, DateTime? startDate, DateTime? endDate, String searchId, String searchSenderDomain, String searchFrom, String searchSubject, String searchFolder, String seedUserName, String campaignName, String templateName, String inReplayTo, String resentMessageId, String datefilter, String seedISP)
        {

            String startDateFormated = null;
            String endDateFormated = null;

            //Search
            ViewBag.accountId = null;
            ViewBag.startDate = null;
            ViewBag.endDate = null;
            ViewBag.seedName = null;

            ViewBag.searchFrom = null;
            ViewBag.searchSubject = null;
            ViewBag.searchId = null;
            ViewBag.searchSenderDomain = null;
            ViewBag.searchFolder = null;
            ViewBag.searchSeed = null;
            ViewBag.campaignName = null;
            ViewBag.templateName = null;
            ViewBag.importance = null;
            ViewBag.inReplayTo = null;
            ViewBag.resentMessageId = null;
            ViewBag.datefilter = null;
            ViewBag.ISP = null;


            if (!NullOrEmpty(datefilter))
            {
                var dates = datefilter.Split('-');
                startDate = Convert.ToDateTime(dates[0].Trim());
                endDate = Convert.ToDateTime(dates[1].Trim());
                ViewBag.datefilter = datefilter;

            }
            //IQueryable<Mail> query = query = db.Mail.OrderByDescending(m => m.Date).Where(m => m.FromSeeder != true);

            IQueryable<Mail> query = query = db.Mail.Include("Seed").OrderByDescending(m => m.Date).Where(m => m.FromSeeder != true);

            if (seedId != null)
            {
                query = query.Where(m => m.Seed.Id == seedId);
                ViewBag.seedId = seedId;

                if (query.ToList().Count() > 0)
                    ViewBag.seedName = query.First().Seed.UserName;
            }

            if (startDate != null)
            {
                query = query.Where(m => m.Date >= startDate);
                startDateFormated = startDate.Value.Year + "/" + startDate.Value.Month + "/" + startDate.Value.Day;
                ViewBag.startDate = startDateFormated;

            }

            if (endDate != null)
            {
                query = query.Where(m => m.Date <= endDate);
                endDateFormated = endDate.Value.Year + "/" + endDate.Value.Month + "/" + endDate.Value.Day;
                ViewBag.endDate = endDateFormated;
            }

            if (!NullOrEmpty(searchFrom))
            {
                query = query.Where(m => m.From.Contains(searchFrom));
                ViewBag.searchFrom = searchFrom;
            }

            if (!NullOrEmpty(searchSubject))
            {
                query = query.Where(m => m.Subject.Contains(searchSubject));
                ViewBag.searchSubject = searchSubject;
            }

            if (!NullOrEmpty(searchId))
            {
                query = query.Where(m => m.TrackingId.Contains(searchId));
                ViewBag.searchId = searchId;
            }

            if (!NullOrEmpty(searchSenderDomain))
            {
                query = query.Where(m => m.SenderDomain.Contains(searchSenderDomain));
                ViewBag.searchSenderDomain = searchSenderDomain;
            }

            if (!NullOrEmpty(searchFolder))
            {
                query = query.Where(m => m.FolderName.Contains(searchFolder));
                ViewBag.searchFolder = searchFolder;
            }

            if (!NullOrEmpty(seedUserName))
            {
                query = query.Where(m => m.Seed.UserName.Contains(seedUserName));
                ViewBag.seedUserName = seedUserName;
            }

            if (!NullOrEmpty(campaignName))
            {
                query = query.Where(m => m.CampaignName.Contains(campaignName));
                ViewBag.campaignName = campaignName;
            }

            if (!NullOrEmpty(templateName))
            {
                query = query.Where(m => m.TemplateName.Contains(templateName));
                ViewBag.templateName = templateName;
            }

            if (!NullOrEmpty(inReplayTo))
            {
                query = query.Where(m => m.InReplayTo.Contains(inReplayTo));
                ViewBag.inReplayTo = inReplayTo;
            }

            if (!NullOrEmpty(resentMessageId))
            {
                query = query.Where(m => m.ResentMessageId.Contains(resentMessageId));
                ViewBag.resentMessageId = resentMessageId;
            }

            if (!NullOrEmpty(seedISP))
            {
                query = query.Where(m => m.ISP.Contains(seedISP));
                ViewBag.ISP = seedISP;
            }


            return query;
        }

        public IQueryable<Mail> SortMailQuery(DatabaseContext db, String sortOrder, IQueryable<Mail> query, String tableSort, String visibilityId)
        {
            //Sort
            //Set hidden all the arrows
            ViewBag.fromDESC = "hidden";
            ViewBag.fromASC = "hidden";

            ViewBag.idDESC = "hidden";
            ViewBag.idASC = "hidden";

            ViewBag.subjectDESC = "hidden";
            ViewBag.subjectASC = "hidden";

            ViewBag.folderDESC = "hidden";
            ViewBag.folderASC = "hidden";

            ViewBag.seedDESC = "hidden";
            ViewBag.seedASC = "hidden";

            ViewBag.dateDESC = "hidden";
            ViewBag.dateASC = "hidden";

            ViewBag.sendDomainDESC = "hidden";
            ViewBag.sendDomainASC = "hidden";

            ViewBag.campaignNameDESC = "hidden";
            ViewBag.campaignNameASC = "hidden";

            ViewBag.templateNameDESC = "hidden";
            ViewBag.templateNameASC = "hidden";

            ViewBag.seedISPDESC = "hidden";
            ViewBag.seedISPASC = "hidden";

            //Columns visibility
            if (visibilityId == "hidden")
                ViewBag.visibilityColumnId = "hidden";
            else
                ViewBag.visibilityColumnId = "visible";

            ViewBag.visibilityColumnSenderDomain = "visible";
            ViewBag.visibilityColumnFrom = "visible";
            ViewBag.visibilityColumnSubject = "visible";
            ViewBag.visibilityColumnFolder = "visible";
            ViewBag.visibilityColumnDate = "visible";
            ViewBag.visibilityColumnSeed = "none";
            ViewBag.visibilityColumnISP = "none";

            switch (tableSort)
            {
                case "Id":
                    if (sortOrder == "DESC")
                    {
                        query = query.OrderByDescending(o => o.FolderName);
                        ViewBag.sortOrder = "DESC";
                        ViewBag.idDESC = "visible";
                    }
                    else
                    {
                        query = query.OrderBy(o => o.FolderName);
                        ViewBag.sortOrder = "ASC";
                        ViewBag.idASC = "visible";
                    }
                    ViewBag.sort = "Id";
                    break;

                case "Folder":
                    if (sortOrder == "DESC")
                    {
                        query = query.OrderByDescending(o => o.FolderName);
                        ViewBag.sortOrder = "DESC";
                        ViewBag.folderDESC = "Visible";
                    }
                    else
                    {
                        query = query.OrderBy(o => o.FolderName);
                        ViewBag.sortOrder = "ASC";
                        ViewBag.folderASC = "Visible";
                    }

                    ViewBag.sort = "Folder";
                    break;

                case "From":
                    if (sortOrder == "DESC")
                    {
                        query = query.OrderByDescending(o => o.From);
                        ViewBag.sortOrder = "DESC";
                        ViewBag.fromDESC = "visible";

                    }
                    else
                    {
                        query = query.OrderBy(o => o.From);
                        ViewBag.sortOrder = "ASC";
                        ViewBag.fromASC = "Visible";
                    }

                    ViewBag.sort = "From";
                    break;

                case "Subject":
                    if (sortOrder == "DESC")
                    {
                        query = query.OrderByDescending(o => o.Subject);
                        ViewBag.sortOrder = "DESC";
                        ViewBag.subjectDESC = "Visible";
                    }
                    else
                    {
                        query = query.OrderBy(o => o.Subject);
                        ViewBag.sortOrder = "ASC";
                        ViewBag.subjectASC = "Visible";
                    }
                    ViewBag.sort = "Subject";
                    break;

                case "Seed":
                    if (sortOrder == "DESC")
                    {
                        query = query.OrderByDescending(o => o.Seed.UserName);
                        ViewBag.sortOrder = "DESC";
                        ViewBag.seedDESC = "Visible";
                    }
                    else
                    {
                        query = query.OrderBy(o => o.Seed.UserName);
                        ViewBag.sortOrder = "ASC";
                        ViewBag.seedASC = "Visible";
                    }

                    ViewBag.sort = "Seed";
                    break;

                case "SendDomain":
                    if (sortOrder == "DESC")
                    {
                        query = query.OrderByDescending(o => o.SenderDomain);
                        ViewBag.sortOrder = "DESC";
                        ViewBag.sendDomainDESC = "Visible";
                    }
                    else
                    {
                        query = query.OrderBy(o => o.Seed.UserName);
                        ViewBag.sortOrder = "ASC";
                        ViewBag.sendDomainASC = "Visible";
                    }

                    ViewBag.sort = "SendDomain";
                    break;

                case "CampaignName":
                    if (sortOrder == "DESC")
                    {
                        query = query.OrderByDescending(o => o.CampaignName);
                        ViewBag.sortOrder = "DESC";
                        ViewBag.campaignNameDESC = "Visible";
                    }
                    else
                    {
                        query = query.OrderBy(o => o.CampaignName);
                        ViewBag.sortOrder = "ASC";
                        ViewBag.campaignNameASC = "Visible";
                    }

                    ViewBag.sort = "CampaignName";
                    break;

                case "TemplateName":
                    if (sortOrder == "DESC")
                    {
                        query = query.OrderByDescending(o => o.TemplateName);
                        ViewBag.sortOrder = "DESC";
                        ViewBag.templateNameDESC = "Visible";
                    }
                    else
                    {
                        query = query.OrderBy(o => o.TemplateName);
                        ViewBag.sortOrder = "ASC";
                        ViewBag.templateNameASC = "Visible";
                    }

                    ViewBag.sort = "TemplateName";
                    break;

                case "ISP":
                    if (sortOrder == "DESC")
                    {
                        query = query.OrderByDescending(o => o.ISP);
                        ViewBag.sortOrder = "DESC";
                        ViewBag.seedISPDESC = "Visible";
                    }
                    else
                    {
                        query = query.OrderBy(o => o.ISP);
                        ViewBag.sortOrder = "ASC";
                        ViewBag.seedISPASC = "Visible";
                    }

                    ViewBag.sort = "ISP";
                    break;


                default:
                    if (sortOrder == "DESC")
                    {
                        query = query.OrderByDescending(o => o.Date);
                        ViewBag.sortOrder = "DESC";
                        ViewBag.dateDESC = "Visible";
                    }
                    else
                    {
                        query = query.OrderBy(o => o.Date);
                        ViewBag.sortOrder = "ASC";

                        ViewBag.dateASC = "Visible";
                    }

                    ViewBag.sort = "Date";
                    break;
            }

            return query;
        }

        public ActionResult RunAll()
        {
            using (var db = new DatabaseContext())
            {
                try
                {
                    //call process
                    Process p = new Process();

                    var maxStartDate = db.RunLog.Where(r => r.Status == "Start").OrderByDescending(d => d.RunTime).Select(s => s.RunTime).FirstOrDefault();
                    var maxEndDate = db.RunLog.Where(r => r.Status == "End").OrderByDescending(d => d.RunTime).Select(s => s.RunTime).FirstOrDefault();

                    if (maxEndDate > maxStartDate)
                    {
                        p.StartInfo.FileName = "C:\\inetpub\\mailapp\\mailprocess\\MailProcess.exe";
                        p.Start();
                    }
                }
                catch (Exception ex)
                {
                    var ravenClient = Sentry.Instance;
                    ravenClient.Capture(new SentryEvent(ex));
                }

                return Redirect("/Mail/Index");
            }
        }

        public Boolean NullOrEmpty(String str)
        {
            return (str == "" || str == null);
        }
    }
}