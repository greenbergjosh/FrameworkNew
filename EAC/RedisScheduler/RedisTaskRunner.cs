using System;
using System.Collections.Generic;
using System.Threading;
using RedLockNet.SERedis;
using RedLockNet.SERedis.Configuration;
using StackExchange.Redis;

namespace RedisScheduler
{
    public class RedisTaskRunner : IDisposable
    {
        private const string ConnectionString = "192.168.99.100:6379";

        private readonly ConfigurationOptions Config = new ConfigurationOptions
        {
            ConnectTimeout = 100000,
            ConnectRetry = 3,
            SyncTimeout = 100000,
            AbortOnConnectFail = false
        };

        private readonly ConnectionMultiplexer _multiplexer;
        private readonly RedLockFactory _lockFactory;
        private readonly ReaderWriterLockSlim _eventLock = new ReaderWriterLockSlim();

        private bool _disposed = false;

        private RedisTaskRunner()
        {
            var endpoints = ConnectionString.Split(';');
            foreach (var endpoint in endpoints)
                Config.EndPoints.Add(endpoint);

            _multiplexer = ConnectionMultiplexer.Connect(Config);
            _lockFactory = RedLockFactory.Create(new List<RedLockMultiplexer> { _multiplexer });
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (_disposed)
                return;

            if (disposing)
            {
                _eventLock.Dispose();
                _lockFactory.Dispose();
                _multiplexer.Dispose();
            }

            _disposed = true;
        }

        ~RedisTaskRunner()
        {
            Dispose(false);
        }

        public static void Run(Action<ConnectionMultiplexer, IDatabase, RedLockFactory, ReaderWriterLockSlim> work)
        {
            using (var runner = new RedisTaskRunner())
            {
                work(runner._multiplexer, runner._multiplexer.GetDatabase(), runner._lockFactory, runner._eventLock);
            }
        }
    }
}
