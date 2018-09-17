using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using TowerDataFtpLib;

namespace TowerDataFtpTestForm
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        public string cfgConnectionString = "Data Source=.;Initial Catalog=dataMail;Integrated Security=SSPI;";
        public string evtConnectionString = "Data Source=.;Initial Catalog=dataMail;Integrated Security=SSPI;";

        private void Start_Click(object sender, EventArgs e)
        {
            Dictionary<string, string> basicConfig = DataLayer.GetBasicConfig(cfgConnectionString, "SuppressionFileService").GetAwaiter().GetResult();
            int daysBetweenRuns = Utility.GetBasicConfigValue<int>(basicConfig, "DaysBetweenRuns", 7);
            DateTime lastRun = new DateTime(2017, 2, 14, 20, 21, 28);
            double diffDays = lastRun.Subtract(DateTime.UtcNow).TotalDays;
            double diffDays2 = DateTime.Now.Subtract(lastRun).TotalDays;
            int ddd = DateTime.Now.Subtract(lastRun).Days;
            if (diffDays > daysBetweenRuns)
            {
                int iii = 0;
            }


            



                var dataTables = DataLayer.CreateDataTables(cfgConnectionString, evtConnectionString);
            bool x = DataLayer.AlreadyDownloaded(cfgConnectionString, "testfile.txt").GetAwaiter().GetResult();
            int z = 1;
            //Task t = Task.Run(async () => { await TowerDataFtpLib.TowerDataFtpTasks.ExportData(cfgConnectionString, @"d:\TowerDataFtpStore", @"output.csv"); });
            //t.GetAwaiter().GetResult();
            //TowerDataFtpLib.SFTPWrapper.ExportData(cfgConnectionString, @"d:\TowerDataFtpStore", @"output.csv").GetAwaiter().GetResult();

            //string host = "sftp2.towerdata.com";
            //string username = "inboxops";
            //string password = "X5GmZ5";
            //TowerDataFtpTasks sftpWrapper = new TowerDataFtpTasks(host, 22, username, password, "d:\\TowerDataFtpStore");
            //Task t = Task.Run(async () => { await sftpWrapper.DoImport(cfgConnectionString); });
            //t.GetAwaiter().GetResult();
            //int i = 1;

            string host = "sftp2.towerdata.com";
            string username = "inboxops";
            string password = "X5GmZ5";
            //TowerDataFtpTasks sftpWrapper = new TowerDataFtpTasks(host, 22, username, password, "d:\\TowerDataFtpStore");
            Task t = Task.Run(async () => { await TowerDataFtpTasks.DoImport(cfgConnectionString, @"d:\TowerDataFtpStore", @"^3970_.*\.csv\.gz$", host, 22, username, password); });
            t.GetAwaiter().GetResult();
            int i = 1;

            //string host = "cc1141.com";
            //string username = "OpSignals";
            //string password = "Qez85M$m3";
            //TowerDataFtpTasks sftpWrapper = new TowerDataFtpTasks(host, 21, username, password, @"d:\TowerDataFtpStore");
            ////sftpWrapper.BeginOpenWrite(@"d:\TowerDataFtpStore\empty-test.csv", host, username, password);
            ////Task t = Task.Run(async () => { sftpWrapper.BeginOpenWrite(@"d:\TowerDataFtpStore\empty-test.csv", host, username, password); });
            //////Task t = Task.Run(async () => { await sftpWrapper.DoExport(cfgConnectionString); });
            //Task t = Task.Run(async () => { await sftpWrapper.UploadFile(@"d:\TowerDataFtpStore\empty-test.csv", host, username, password); });
            //t.GetAwaiter().GetResult();
            //int i = 1;
        }
    }
}
