//using System;
//using System.Collections.Generic;
//using System.IO;
//using System.Text;

//namespace QuickTester
//{
//    // The FileCache pulls files from an external source and caches those files locally.
//    // The external source can be accessed via FTP, HTTP, FILE or any other protocol
//    // The FileCache will copy the files to the CacheDirectory
//    // The FileCache will recognize if a file is presently being copied and will block other requests to copy that file
//    //  with the same destFileName - different destFileName requests for the same source will proceed
//    // Since two different sources could be copied to the same destFileName, blocking is actually done on the destFileName
//    // If the destFileName is null then the srcFileName will be used as the destFileName
//    // The default destination directory is CacheDirectory, but it can be overridden on every call if desired

//    // If we allow different files to land in the same destination then we cannot ever know if we already have the file - so one-to-one
//    // Should be able to force a file out of the cache
//    // Should be able to force a file that is in the cache to be renewed

//    // First check if the file is there - check destFile
//    // If it is there, we are done, return
//    // Try to create and open exclusively a lock file with the name destFile.lck
//    // If n threads try to do this simultaneously, only one will get the exclusive lock, the others will wait
//    //   So, we know the file was not there - since we did not find destFile, and we have one thread creating the file and the others waiting
//    // Create the file as destFile.dwnld - otherwise, the check for the file will succeed when the file may be only partially downloaded
//    // After the download has completed, rename the *.dwnld file without the extension
//    // Delete the .lck file
//    // The thread the completed the download can now return 
//    // The threads that were waiting can be released when the .lck file gets deleted
//    // If we cannot establish a watch on the .lck after failing to get an exclusive lock on the .lck then that means the download is done
//    public class FileCache
//    {
//        string CacheDirectory;
//        long CacheSizeInBytes;

//        public async Task<bool> CacheFile(CurlRequest curlRequest)
//        {
//            string destLocation = curlRequest.FullDestinationFileLocation;

//            if (File.Exists(destLocation)) return true;
//            bool lockFileCreater = false;
//            try
//            {
//                using (FileStream fs = File.Open(destLocation + ".lck", FileMode.Open, FileAccess.Write, FileShare.None))
//                {
//                    lockFileCreater = true;
//                    (long fileSize, string filePath) = curlRequest.GetFileSize(true);  // If true, then allow file to be downloaded to filePath to determine size
//                    MakeRoom()
//                }
//            }
//            catch (Exception e)
//            {
//                if (lockFileCreater)
//                {
//                    // We are the lockFileCreater but we had an exception somewhere
//                    // The file cannot be downloaded - all other waiting threads should gracefully fail
//                }
//                else
//                {
//                    // We are not the lockFileCreater - this is simply how we know that
//                }
//            }
            
//                // First check if the file is there - check destFile
//                // If it is there, we are done, return
//                // Try to create and open exclusively a lock file with the name destFile.lck
//                // If n threads try to do this simultaneously, only one will get the exclusive lock, the others will wait
//                //   So, we know the file was not there - since we did not find destFile, and we have one thread creating the file and the others waiting
//                // Create the file as destFile.dwnld - otherwise, the check for the file will succeed when the file may be only partially downloaded
//                // After the download has completed, rename the *.dwnld file without the extension
//                // Delete the .lck file
//                // The thread the completed the download can now return 
//                // The threads that were waiting can be released when the .lck file gets deleted
//                // If we cannot establish a watch on the .lck after failing to get an exclusive lock on the .lck then that means the download is done



//                //if (destLocation is not exclusively locked) return true;
                

           

//            if (!String.IsNullOrEmpty(FileCacheFtpServer) || !String.IsNullOrEmpty(FileCacheDirectory))
//            {
//                var di = new DirectoryInfo(destDir);
//                var files = di.GetFiles(fileName);

//                if (files.Length == 1) return fileName;
//                else if (files.Length == 0)
//                {
//                    var tempFile = new FileInfo($"{destDir}\\{dfileName}{tempSuffix}");
//                    var fileCopyInProgress = false;

//                    try
//                    {
//                        tempFile.Open(FileMode.CreateNew, FileAccess.Write, FileShare.None).Dispose();
//                    }
//                    catch (IOException ex)
//                    {
//                        if (ex.Message.Contains("already exists")) fileCopyInProgress = true;
//                        else
//                        {
//                            await _fw.Error(nameof(GetFileFromFileId), $"Unknown error with temp file: {fileName} {ex.UnwrapForLog()}");
//                            throw;
//                        }
//                    }

//                    if (fileCopyInProgress)
//                    {
//                        await _fw.Trace(nameof(GetFileFromFileId), $"Waiting for in process copy to finish for {finalFile}");
//                        await WaitForFileCopyInProcess(finalFile);

//                        return finalFile.Name;
//                    }
//                    else
//                    {
//                        await _fw.Trace(nameof(GetFileFromFileId), $"Making room for {finalFile}");
//                        success = await MakeRoom(fileName, cacheSize);

//                        if (!success)
//                        {
//                            tempFile.Delete();
//                            await _fw.Error(nameof(GetFileFromFileId), $"Could not make room for file: {fileName}");
//                            throw new Exception("Could not make room for file.");
//                        }

//                        try
//                        {
//                            if (!String.IsNullOrEmpty(FileCacheDirectory))
//                            {
//                                var cacheFile = new FileInfo(Path.Combine(FileCacheDirectory, fileName));

//                                if (!cacheFile.Exists)
//                                {
//                                    var msg = $"Cache file does not exist {cacheFile.FullName}";
//                                    await _fw.Error(nameof(GetFileFromFileId), msg);
//                                    throw new Exception(msg);
//                                }

//                                cacheFile.CopyTo(tempFile.FullName, true);
//                                tempFile.MoveTo(finalFile.FullName);
//                            }
//                            else if (!String.IsNullOrEmpty(FileCacheFtpServer))
//                            {
//                                using (var fs = tempFile.Open(FileMode.Open, FileAccess.Write, FileShare.None))
//                                {
//                                    await ProtocolClient.DownloadFileFtp(
//                                        fs,
//                                        FileCacheFtpServerPath + "/" + fileName,
//                                        FileCacheFtpServer,
//                                        FileCacheFtpUser,
//                                        FileCacheFtpPassword
//                                    );
//                                }

//                                tempFile.MoveTo(finalFile.FullName);
//                            }

//                            files = di.GetFiles(dfileName);

//                            if (files.Length == 1) return dfileName;
//                            else
//                            {
//                                await _fw.Error(nameof(GetFileFromFileId), $"Could not find file in cache: {fileName}");
//                                throw new Exception("Could not find file in cache: " + fileName);
//                            }
//                        }
//                        catch (Exception)
//                        {
//                            tempFile.Refresh();
//                            if (tempFile.Exists) tempFile.Delete();
//                            throw;
//                        }
//                    }
//                }
//                else
//                {
//                    await _fw.Error(nameof(GetFileFromFileId), $"Too many file matches: {fileName}");
//                    throw new Exception("Too many file matches: " + fileName);
//                }
//            }
//            else
//            {
//                var di = new DirectoryInfo(destDir);
//                var fi = di.GetFiles(fileName);

//                fi = di.GetFiles(fileName);

//                if (fi.Length == 1)
//                {
//                    if (destFileName == null)
//                        return fileName;
//                    else
//                    {
//                        fi[0].CopyTo(destFileName);
//                        return destFileName;
//                    }
//                }
//                else
//                {
//                    await _fw.Error(nameof(GetFileFromFileId), $"Could not find file locally: {fileName}");
//                    throw new Exception("Could not find file locally: " + fileName);
//                }
//            }
//        }

//        private async Task WaitForFileCopyInProcess(FileInfo finalFile)
//        {
//            var tcs = new TaskCompletionSource<bool>();
//            var watcher = new FileSystemWatcher(finalFile.Directory.FullName) { EnableRaisingEvents = true };
//            var timer = new System.Timers.Timer(FileCopyTimeout) { AutoReset = false };

//            void dispose()
//            {
//                watcher.Dispose();
//                timer.Dispose();
//            }
//            void renamedHandler(object s, RenamedEventArgs e)
//            {
//                if (e.Name.Equals(finalFile.Name, StringComparison.CurrentCultureIgnoreCase))
//                {
//                    dispose();
//                    tcs.TrySetResult(true);
//                }
//            }
//            async void timerHandler(object s, ElapsedEventArgs e)
//            {
//                dispose();
//                await _fw.Error(nameof(WaitForFileCopyInProcess), $"Timed out waiting for file copy initiated by other request: {finalFile.Name}");
//                tcs.TrySetException(new TimeoutException($"Timed out waiting for other file copy process to finish: {finalFile.Name}"));
//            }

//            timer.Elapsed += timerHandler;
//            watcher.Renamed += renamedHandler;

//            // In case it completed during setup
//            finalFile.Refresh();

//            if (finalFile.Exists)
//            {
//                dispose();
//                tcs.TrySetResult(true);
//            }
//            else timer.Start();

//            await tcs.Task;
//        }
//    }
//}
