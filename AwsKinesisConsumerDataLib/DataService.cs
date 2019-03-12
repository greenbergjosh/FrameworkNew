using Amazon.Kinesis.ClientLibrary;
using Amazon.Kinesis.ClientLibrary.Bootstrap;
using Microsoft.AspNetCore.Http;
using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using Utility;

namespace AwsKinesisConsumerDataLib
{
    public class DataService
    {
        private FrameworkWrapper _fw;
        private string[] _args;
        private bool _isConsumer;
        private Process _javaProcess;
        private bool _exiting;

        public void Config(string[] args, FrameworkWrapper fw)
        {
            _fw = fw;
            _args = args;
            _isConsumer = fw.StartupConfiguration.GetS("Config/Mode") == "consumer";
        }

        public void OnStart()
        {
            if (_isConsumer)
            {
                RunConsumer();
            }
            else
            {
                RunBootstrap();
            }
        }

        private void RunBootstrap()
        {
            var kclArgs = new string[] { "-p", AppDomain.CurrentDomain.BaseDirectory + "Consumer.properties", "--jar-folder", AppDomain.CurrentDomain.BaseDirectory + "jars" };

            _fw.Trace("RunBootstrap", $"AwsKinesisConsumerWindowsService started with arguments: [{string.Join(",", kclArgs)}]");

            _javaProcess = Bootstrap.RunAsService(_fw, kclArgs);
            _javaProcess.Exited += _javaProcess_Exited;
        }

        private void _javaProcess_Exited(object sender, EventArgs e)
        {
            if (!_exiting)
            {
                _javaProcess = null;
                Environment.FailFast("AwsKinesisConsumerWindowsService: Java Process exited unexpectedly.");
            }
        }

        private void RunConsumer()
        {
            var consumer = new Thread(() =>
            {
                try
                {
                    KclProcess.Create(new AwsKinesisConsumer(_fw)).Run();
                }
                catch (Exception ex)
                {
                    _fw.Error("RunConsumer", ex.ToString());
                }
            });
            consumer.IsBackground = true;
            consumer.Start();
        }

        public void OnStop()
        {
            _exiting = true;
            try
            {
                _javaProcess?.Kill();
            }
            catch
            {
            }
        }

        public Task<string> HandleHttpRequest(HttpContext ctx) => Task.FromResult("OK");
    }
}
