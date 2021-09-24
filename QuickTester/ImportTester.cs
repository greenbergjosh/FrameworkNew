using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuickTester
{
    class ImportTester
    {
        /*
FileSetWorkflow: ([(sourceEndpoint, filepattern, filecmd/curlcmd(sourceEndpoint), workspaceEndpoint, destFileNames/Locations(workspaceEndpoint))], schedule/workflow, raiseSignalName)
  (Identify) Identify the files to be obtained - grammar, per-source/group
  (Obtain)   Obtain the files, may be a TPL - grammar, per-source/group
ProcessFileSetWorkflow(listenSignalNameFileSetWorkflow, schedule/workflow, copyFileSetBit, raiseSignalName)  -- default copies all files to own workspace, bit says if not necessary

ProcessFileSeriesWorkflow(listenSignalNameFromProcessFileSetWorkflow, schedule/workflow, copyFileBit, ...
  -- declarative TPL workflow for file processing (for processing each file in the file series)
ProcessFileSeriesResultFilesWorkflow
  -- staging into db
ProcessStagedDataWorkflow (this is an abstraction of what is currently done to run the EDW jobs)
  -- declarative TPL workflow for relation processing
         */

        // I need a way to unsub from any given point in the process
        // I need a way to unsub a specific network, or file, etc.
        // I need unsub to work manually
        // I need to be able to force an unsub

        // In-Memory (TPL), Database (LRW), Files (LRW)
        public static void TplUnsubIdentifyFiles()
        {
            // What is unsub?
            //  1. Inventory (config, not event-like or even signal-like)(exposes a service over inventory)
            //  2. Import/Export (nothing being exported)
            //  3. LRW/TPL
            //  4. Exposes a service over the unsub files (e.g. IsUsub)
            //  5. FileSystem Cache - move this into a library (allows S3 storage, and unix commands)


            // Call console to identify campaigns
            // Call networks to get campaign/offer ids
            // Call networks to convert ids to urls (multiple calls)
            // Call file providers to convert network urls to actual urls
            // Update the unsub inventory database -- side effect
            //   1. Add new campaigns based of result of step 1  (Id, CName, ImportExportLogId
            //   2. Update the pointer to the new unsub file as well as it's recency date
            //          ImportEvents(Id, Date, FileContext, Step) as EDW events
            //          - can we make unsub events fall into generic import events
            // Works for both get the same many times (unsub) and don't ever get the same

            // BusinessApp (e.g. Unsub, Charlie's Data Pulls/Pushes, Other things)
            //    Built using LRW, TPL
            //       Use the Inventory Lib
            //       Use Import/Export Lib in some of their states
   
        }

        public static void IdentifyFilesWorkflow(bool obtainImmediately)
        {
            // Unsub
            //TplUnsubIdentifyFiles()
            
            // SIG (List of URLs)

            // Ftp
            // File pattern that dictates matching files
            // Identify all files that match

            // SIG (List of Files)
        }

        // I think thisCampaignManually is replaced by calling IdentifyFilesWorkflow to determine the url for the file
        // and then ObtainFilesWorkflow to get the files
        public static void ObtainFilesWorkflow(List<(string, string)> urls, string thisCampaignManually)
        {
            // PureData, Unsub, Ftp, etc. - source could also be database
            // (string SourceName, string SourceContextJson) 
            // Parallelize calls to get urls
            // SIGRAISE (string FileName, string FileContextJson, string SourceContextJson) 
            // SIGCREATE Thread
        }

        // Why do SIGCREATE vs SIGRAISE? I don't know the subscribers, so I wouldn't know who to SIGCREATE.
        //   Daemon - SIGRAISE
        //   One-Off - SIGCREATE, but this assumes that in the one-off case I know all listeners
        // It would be bad, if somehow the expected listener were not listening. How do we avoid this?
        //     This is where you have the idea of supervisors (who can SIGCREATE).
        //     This is also related to there being no listeners which means the job maybe should shut down
        //     The supervisor could be integrated with the LRW (LRW notifies supervisor of certain events)
        //     Alternatively, the supervisor could work manually along with apps to identify failures. E.g.
        //       apps would write events and supervisor would know which event to look for and raise issues
        //       when those events are not found.
        // There may be use-case where we want to store the fact of the one-off in workflow state so the
        // daemon thread instances can later do whatever processing they may need.

        public static void ObtainData(List<(string, string)> urls)
        {
            // Get data from some source and immediately put to a destination without intermediary files
            // TPL
        }

        // We can have many such flows, running one after the next, or in parallel
        // Bind some different config to each instance
        // Call this ProcessFiles
        public static void FilesystemWorkflow(List<(string, string)> files, bool copySources)
        {
            // input: SIG List<(file, context)> files
            // output: SIG List<(file, context)> files
        }
        
        public static void StagingWorkflow(List<(string, string)> files)
        {
            // input: SIG List<(file, context)> files
            // output: SIG List<(table, context)> tables

            // note: unstaging is simply ObtainFilesWorkflow where protocol is query
        }

        // We can have many such flows, running one after the next, or in parallel
        // Bind some different config to each instance
        public static void DatabaseWorkflow(List<(string, string)> tables)
        {
            // input: SIG List<(file, context)> tables
            // output: SIG List<(table, context)> tables
        }

        ///// Export

        // This requires an endpoint to export the files to
        public static void ExportFileWorkflow(List<(string, string)> files)
        {
            // unstaging: moving data from files to external destination
        }

        public static void ExportData(List<(string, string)> urls)
        {
            // Move data from database to files
        }


    }
}
