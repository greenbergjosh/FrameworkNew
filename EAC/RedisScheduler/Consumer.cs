using RedLockNet.SERedis;
using StackExchange.Redis;
using System;
using System.IO;
using System.Linq;
using System.Reactive.Linq;
using System.Threading;

namespace RedisScheduler
{
    public static class Consumer
    {
        static byte[] scriptHash = null;

        public static void Run(ConnectionMultiplexer mp, IDatabase db, RedLockFactory lockFactory, ReaderWriterLockSlim eventLock)
        {
            FastConsole.WriteLine("Consumer Running");

            LoadLuaScript(db);

            // At boot time, the queue might not be empty, process it.
            while (ReadMessage(db, lockFactory)) ;

            // Then subscribe to changes and process on demand
            mp.GetSubscriber().Subscribe(Constants.Messages, delegate
            {
                // Use a lock to protect against async events entering while we are still processing.
                if (eventLock.TryEnterWriteLock(0))
                {
                    try
                    {
                        while (ReadMessage(db, lockFactory)) ;
                    }
                    finally
                    {
                        eventLock.ExitWriteLock();
                    }
                }
            });
        }

        static void LoadLuaScript(IDatabase db)
        {
            using (var stream = typeof(Consumer).Assembly.GetManifestResourceStream(
                "RedisScheduler.MsgToThread.lua"))
            {
                using (var sr = new StreamReader(stream))
                {
                    var script = sr.ReadToEnd();
                    LuaScript s = LuaScript.Prepare(script);
                    foreach (var endpoint in db.Multiplexer.GetEndPoints())
                        scriptHash = s.Load(db.Multiplexer.GetServer(endpoint)).Hash;
                }
            }
        }

        static bool ReadMessage(IDatabase db, RedLockFactory redlockFactory)
        {
            var parts = (string[])db.ScriptEvaluate(scriptHash,  null);
            if (parts == null)
                return false;

            if (parts.Length == 3)
            {
                var id = parts[0];
                var type = parts[1];
                var value = parts[2];

                // Pushes request, signal or interrupt on a specific thread
                db.ListLeftPush($"{id}:{type}", value);
                FastConsole.WriteLine($"P {type.ToUpperInvariant().FirstOrDefault()} {id} {value}");

                // Try to run the thread. This will block the consumer for the duration of the execution.
                RunThread(db, redlockFactory, id);
            }
            else if (parts.Length == 2)
            {
                FastConsole.WriteLine($"Wrong message format: {parts[1]}");
            }
            else
            {
                return false;
            }

            return true;
        }

        static void RunThread(IDatabase db, RedLockFactory redlockFactory, string id)
        {
            var timeout = TimeSpan.FromMinutes(5); // Lock timeout for a threads evaluation. 
                                                   // Need to find a way to extend it for long running task

            using (var redLock = redlockFactory.CreateLock(id, timeout))
            {
                // make sure we got the lock
                if (!redLock.IsAcquired)
                    return;

                // Get the thread state
                var immediatePaused = (bool)db.HashGet(id, Constants.ImmediatePaused);
                var signalsPaused = (bool)db.HashGet(id, Constants.SignalsPaused);

                RedisValue immediate = RedisValue.Null;
                RedisValue signal = RedisValue.Null;
                RedisValue interrupt = RedisValue.Null;

                while (true)
                {
                    if (!immediatePaused)
                        immediate = db.ListRightPop($"{id}:{Constants.Immediate}");

                    if (!signalsPaused && !immediate.HasValue)
                        signal = db.ListRightPop($"{id}:{Constants.Signal}");

                    if (!immediate.HasValue && !signal.HasValue)
                        interrupt = db.ListRightPop($"{id}:{Constants.Interrupt}");

                    if (!immediate.HasValue && !signal.HasValue && !interrupt.HasValue)
                    {
                        if (signalsPaused)
                        {
                            signalsPaused = false;
                            db.HashSet(id, Constants.SignalsPaused, signalsPaused);
                            continue;
                        }
                        else if (immediatePaused)
                        {
                            immediatePaused = false;
                            db.HashSet(id, Constants.ImmediatePaused, immediatePaused);
                            continue;
                        }

                        return;
                    }

                    if (immediate.HasValue)
                    {
                        FastConsole.WriteLine($"R D {id} {immediate}");
                        immediate = RedisValue.Null;

                        // Thread.Sleep(500); // Fake processing
                    }
                    else if (signal.HasValue)
                    {
                        FastConsole.WriteLine($"R S {id} {signal}");
                        signal = RedisValue.Null;
                        immediatePaused = true;
                        db.HashSet(id, Constants.ImmediatePaused, immediatePaused);

                        // Thread.Sleep(500); // Fake processing
                    }
                    else if (interrupt.HasValue)
                    {
                        FastConsole.WriteLine($"R I {id} {interrupt}");
                        interrupt = RedisValue.Null;
                        signalsPaused = true;
                        db.HashSet(id, Constants.SignalsPaused, signalsPaused);

                        // Thread.Sleep(500); // Fake processing
                    }
                    else
                    {
                        return;
                    }
                }
            }
        }
    }
}
