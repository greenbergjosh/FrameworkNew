using BusinessLogic;
using BusinessLogic.Model;
using MailApplication.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MailApplication.Controllers
{
    public class RunLogController : Controller
    {
        // GET: RunLog
        public ActionResult Index()
        {
            RunLogViewModel runlog = new RunLogViewModel();

            using (DatabaseContext db = new DatabaseContext())
            {
                var maxStartDate = db.RunLog.Where(r => r.Status == "Start").OrderByDescending(d => d.RunTime).Select(s => s.RunTime).FirstOrDefault();
                var maxEndDate = db.RunLog.Where(r => r.Status == "End").OrderByDescending(d => d.RunTime).Select(s => s.RunTime).FirstOrDefault();

                List<RunLog> records = new List<RunLog>();
                if (maxEndDate < maxStartDate)
                    records = db.RunLog.Where(r => r.RunTime >= maxStartDate).OrderBy(d => d.RunTime).ToList();

                runlog.Records = records;
            }

            return View(runlog);
        }
    }
}