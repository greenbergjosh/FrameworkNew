//using System;
//using System.Collections.Generic;
//using System.Diagnostics;
//using System.IO;
//using System.Threading;
//using System.Threading.Tasks;
//using Fs = Utility.FileSystem;

//namespace Utility
//{
//    public static class ProcessWrapper
//    {
//        public static async Task<int> StartProcess(
//            string filename,
//            string arguments,
//            string workingDirectory = null,
//            int? timeout = null,
//            TextWriter outputTextWriter = null,
//            TextWriter errorTextWriter = null,
//            Stream input = null)
//        {
//            using (var process = new Process()
//            {
//                StartInfo = new ProcessStartInfo()
//                {
//                    CreateNoWindow = true,
//                    Arguments = arguments,
//                    FileName = filename,
//                    RedirectStandardInput = input != null,
//                    RedirectStandardOutput = outputTextWriter != null,
//                    RedirectStandardError = errorTextWriter != null,
//                    UseShellExecute = false,
//                    WorkingDirectory = workingDirectory
//                }
//            })
//            {
//                process.Start();
//                var cancellationTokenSource = timeout.HasValue ?
//                    new CancellationTokenSource(timeout.Value) :
//                    new CancellationTokenSource();

//                var tasks = new List<Task>(3) { process.WaitForExitAsync(cancellationTokenSource.Token) };
//                if (outputTextWriter != null)
//                {
//                    tasks.Add(ReadAsync(
//                        x =>
//                        {
//                            process.OutputDataReceived += x;
//                            process.BeginOutputReadLine();
//                        },
//                        x => process.OutputDataReceived -= x,
//                        outputTextWriter,
//                        cancellationTokenSource.Token));
//                }

//                if (errorTextWriter != null)
//                {
//                    tasks.Add(ReadAsync(
//                        x =>
//                        {
//                            process.ErrorDataReceived += x;
//                            process.BeginErrorReadLine();
//                        },
//                        x => process.ErrorDataReceived -= x,
//                        errorTextWriter,
//                        cancellationTokenSource.Token));
//                }

//                if (input != null)
//                {
//                    //await input.CopyToAsync(process.StandardInput.BaseStream);
//                    input.CopyTo(process.StandardInput.BaseStream);
//                    process.StandardInput.BaseStream.Close();
//                }

//                await Task.WhenAll(tasks).ConfigureAwait(continueOnCapturedContext: false);
//                return process.ExitCode;
//            }
//        }

//        /// <summary>
//        /// Waits asynchronously for the process to exit.
//        /// </summary>
//        /// <param name="process">The process to wait for cancellation.</param>
//        /// <param name="cancellationToken">A cancellation token. If invoked, the task will return
//        /// immediately as cancelled.</param>
//        /// <returns>A Task representing waiting for the process to end.</returns>
//        public static Task WaitForExitAsync(
//            this Process process,
//            CancellationToken cancellationToken = default(CancellationToken))
//        {
//            process.EnableRaisingEvents = true;

//            var taskCompletionSource = new TaskCompletionSource<object>();

//            EventHandler handler = null;
//            handler = (sender, args) =>
//            {
//                process.Exited -= handler;
//                taskCompletionSource.TrySetResult(null);
//            };
//            process.Exited += handler;

//            if (cancellationToken != default(CancellationToken))
//            {
//                cancellationToken.Register(
//                    () =>
//                    {
//                        process.Exited -= handler;
//                        taskCompletionSource.TrySetCanceled();
//                    });
//            }

//            return taskCompletionSource.Task;
//        }

//        /// <summary>
//        /// Reads the data from the specified data recieved event and writes it to the
//        /// <paramref name="textWriter"/>.
//        /// </summary>
//        /// <param name="addHandler">Adds the event handler.</param>
//        /// <param name="removeHandler">Removes the event handler.</param>
//        /// <param name="textWriter">The text writer.</param>
//        /// <param name="cancellationToken">The cancellation token.</param>
//        /// <returns>A task representing the asynchronous operation.</returns>
//        public static Task ReadAsync(
//            this Action<DataReceivedEventHandler> addHandler,
//            Action<DataReceivedEventHandler> removeHandler,
//            TextWriter textWriter,
//            CancellationToken cancellationToken = default(CancellationToken))
//        {
//            var taskCompletionSource = new TaskCompletionSource<object>();

//            DataReceivedEventHandler handler = null;
//            handler = new DataReceivedEventHandler(
//                (sender, e) =>
//                {
//                    if (e.Data == null)
//                    {
//                        removeHandler(handler);
//                        taskCompletionSource.TrySetResult(null);
//                    }
//                    else
//                    {
//                        textWriter.WriteLine(e.Data);
//                    }
//                });

//            addHandler(handler);

//            if (cancellationToken != default(CancellationToken))
//            {
//                cancellationToken.Register(
//                    () =>
//                    {
//                        removeHandler(handler);
//                        taskCompletionSource.TrySetCanceled();
//                    });
//            }

//            return taskCompletionSource.Task;
//        }

//        static (string sh, string pre, string cmd) ShellPrep(string cmd, string platform)
//        {
//            switch (platform ?? Environment.OSVersion.Platform.ToString())
//            {
//                case "Win32NT":
//                    return (@"C:\\Windows\\System32\\cmd.exe", @"/c", cmd.Replace("\"", "\\\""));
//                case "Unix":
//                    return ("/bin/bash", "-c", cmd);
//                default:
//                    throw new ArgumentException("Cannot exec in shell for an unknown platform");
//            }
//        }

//        public static async Task<string> Shell(this string cmd, string platform = null)
//        {
//            var x = ShellPrep(cmd, platform);

//            var process = new Process()
//            {
//                StartInfo = new ProcessStartInfo
//                {
//                    FileName = x.sh,
//                    Arguments = $"{x.pre} \"{x.cmd}\"",
//                    UseShellExecute = false,
//                    CreateNoWindow = true,
//                    RedirectStandardError = true
//                }
//            };
//            process.Start();
//            await process.WaitForExitAsync();
//            var error = process.StandardError.ReadToEnd();
//            return error;
//        }
//    }
//}