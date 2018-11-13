using BusinessLogic;
using BusinessLogic.Model;
using System;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Linq.Expressions;
using System.Linq.Dynamic;
using MailApp.Controllers;
using Spire.Xls;

namespace MailApplication.Controllers
{
    [Authorize(Roles = "USER, SUPER USER")]
    public class ReportController : Controller
    {

        public void ExportExcel(DateTime? startDate, DateTime? endDate, Guid? seedId, String seedUserName, String searchId, String searchSenderDomain, String searchFrom, String searchSubject, String searchFolder, String columns, String datefilter, String seedISP)
        {

            using (DatabaseContext db = new DatabaseContext())
            {

                String startDateFormated = null;
                String endDateFormated = null;

                var campaignName = "";
                var templateName = "";
                var inReplayTo = "";
                var resentMessageId = "";

                MailController mailController = new MailController();
                var query = mailController.MailQueryWithFilters(db, seedId, startDate, endDate, searchId, searchSenderDomain, searchFrom, searchSubject, searchFolder, seedUserName, campaignName, templateName, inReplayTo, resentMessageId, datefilter, seedISP);

                String[] filenameComposition = { "STReport", startDateFormated, endDateFormated, seedUserName };

                String filename = String.Join("_", filenameComposition.Where(s => !String.IsNullOrEmpty(s))) + ".xls";


                //var mailList = query.AsEnumerable();

                //var stmt = CreateNewStatement(columns);

                //var selectList = mailList.Select(stmt);

                var props = typeof(Mail).GetProperties();
                var dt = new System.Data.DataTable();
                dt.Columns.AddRange(props.Select(p => new DataColumn(p.Name, p.PropertyType)).ToArray());

                var queryList = query.ToList();
                
                db.Configuration.LazyLoadingEnabled = false;

                queryList.ForEach(i => dt.Rows.Add(props.Select(p => p.GetValue(i, null)).ToArray()));
                

                createExcel(dt, columns, filename);
                
            }
        }

        Func<Mail, Mail> CreateNewStatement(string fields)
        {
            // input parameter "o"
            var xParameter = Expression.Parameter(typeof(Mail), "o");

            // new statement "new Data()"
            var xNew = Expression.New(typeof(Mail));

            // create initializers
            var bindings = fields.Split(',').Select(o => o.Trim())
                .Select(o =>
                {

                    // property "Field1"
                    var mi = typeof(Mail).GetProperty(o);

                    // original value "o.Field1"
                    var xOriginal = Expression.Property(xParameter, mi);

                    // set value "Field1 = o.Field1"
                    return Expression.Bind(mi, xOriginal);
                }
            );

            // initialization "new Data { Field1 = o.Field1, Field2 = o.Field2 }"
            var xInit = Expression.MemberInit(xNew, bindings);

            // expression "o => new Data { Field1 = o.Field1, Field2 = o.Field2 }"
            var lambda = Expression.Lambda<Func<Mail, Mail>>(xInit, xParameter);

            // compile to Func<Data, Data>
            return lambda.Compile();
        }

        public int getColumnIndex(DataTable dt, String column)
        {
            int z = -1;
            for (z = 0; z < dt.Columns.Count; z++)
            {
                if (dt.Columns[z].ColumnName == column)
                {
                    return z;
                }
            }
            return z;
        }

        public void createExcel(DataTable dt, String columns, String filename)
        {
            //----------------------------------------------------------------------------------------------
            string attachment = "attachment; filename=" + filename;
            Response.ClearContent();
            Response.AddHeader("content-disposition", attachment);
            Response.ContentType = "application/vnd.ms-excel";

            string tab = "";
            var arrayCols = columns.Split(',');

            foreach (var dc in arrayCols)
            {
                if (dt.Columns.Contains(dc))
                {
                    Response.Write(tab + dc);
                    tab = "\t";
                }
            }
            Response.Write("\n");

            foreach (DataRow dr in dt.Rows)
            {
                tab = "";
                foreach (var dc in arrayCols)
                {
                    var z = getColumnIndex(dt, dc);
                    if (dt.Columns[z].ColumnName == "Seed")
                    {
                        Seed seed = (Seed)dr[z];
                        Response.Write(tab + seed.UserName.ToString());
                    }
                    else
                    {
                        Response.Write(tab + dr[z].ToString());
                    }

                    tab = "\t";

                }
                Response.Write("\n");

            }

            Response.End();
        }

        public void ExportExcelTemplateTest()
        {
            using (DatabaseContext db = new DatabaseContext())
            {
                String[] filenameComposition = { "STReportTemplateTest"};

                String filename = String.Join("_", filenameComposition.Where(s => !String.IsNullOrEmpty(s))) + ".xls";

                String columns = "Name,CreatedAt,CampaignId,Subject,Result,To";

                var query = db.TemplateTest.OrderByDescending(q => q.CreatedAt);
                var props = typeof(TemplateTest).GetProperties();
                var dt = new DataTable();
                dt.Columns.AddRange(props.Select(p => new DataColumn(p.Name, p.PropertyType)).ToArray());

                query.ToList().ForEach(i => dt.Rows.Add(props.Select(p => p.GetValue(i, null)).ToArray()));

                createExcel(dt, columns, filename);
            }
        }
    }
}