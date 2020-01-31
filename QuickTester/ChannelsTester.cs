using System;
using System.Collections.Generic;
using System.Threading.Channels;
using System.Threading.Tasks;

namespace QuickTester
{
    class ChannelsTester
    {
        public static async Task SingleProduceMultipleConsumers()
        {
            var channel = Channel.CreateUnbounded<string>();

            // In this example, multiple consumers are needed to keep up with a fast producer

            var producer1 = new Producer(channel.Writer, 1, 100);
            var consumer1 = new Consumer(channel.Reader, 1, 1500);
            var consumer2 = new Consumer(channel.Reader, 2, 1500);
            var consumer3 = new Consumer(channel.Reader, 3, 1500);

            Task consumerTask1 = consumer1.ConsumeData(); // begin consuming
            Task consumerTask2 = consumer2.ConsumeData(); // begin consuming
            Task consumerTask3 = consumer3.ConsumeData(); // begin consuming

            Task producerTask1 = producer1.BeginProducing();

            await producerTask1.ContinueWith(_ => channel.Writer.Complete());

            await Task.WhenAll(consumerTask1, consumerTask2, consumerTask3);
        }

        public static async Task MultiProducerSingleConsumer()
        {
            var channel = Channel.CreateUnbounded<string>();

            // In this example, a single consumer easily keeps up with two producers

            var producer1 = new Producer(channel.Writer, 1, 2000);
            var producer2 = new Producer(channel.Writer, 2, 2000);
            var consumer1 = new Consumer(channel.Reader, 1, 250);

            Task consumerTask1 = consumer1.ConsumeData(); // begin consuming

            Task producerTask1 = producer1.BeginProducing();

            await Task.Delay(500); // stagger the producers

            Task producerTask2 = producer2.BeginProducing();

            await Task.WhenAll(producerTask1, producerTask2)
                .ContinueWith(_ => channel.Writer.Complete());

            await consumerTask1;
        }

        public static async Task MultiProduceMultipleConsumers()
        {
            var channel = Channel.CreateUnbounded<string>(new UnboundedChannelOptions()
            {
                SingleWriter = false,
                SingleReader = false,
                AllowSynchronousContinuations = false // the default
            });

            // In this example, multiple consumers are needed to keep up with a fast producer

            var producer1 = new Producer(channel.Writer, 1, 100);
            var producer2 = new Producer(channel.Writer, 2, 100);
            var producer3 = new Producer(channel.Writer, 3, 100);
            var consumer1 = new Consumer(channel.Reader, 1, 100);
            var consumer2 = new Consumer(channel.Reader, 2, 100);
            var consumer3 = new Consumer(channel.Reader, 3, 100);

            Task consumerTask1 = consumer1.ConsumeData(); // begin consuming
            Task consumerTask2 = consumer2.ConsumeData(); // begin consuming
            Task consumerTask3 = consumer3.ConsumeData(); // begin consuming

            Task producerTask1 = producer1.BeginProducing();
            Task producerTask2 = producer2.BeginProducing();
            Task producerTask3 = producer3.BeginProducing();

            await Task.WhenAll(producerTask1, producerTask2, producerTask3)
                .ContinueWith(_ => channel.Writer.Complete());

            await Task.WhenAll(consumerTask1, consumerTask2, consumerTask3);
        }

        //var channel = Channel.CreateUnbounded<string>(new UnboundedChannelOptions()
        //{
        //    SingleWriter = false,
        //    SingleReader = false,
        //    AllowSynchronousContinuations = false // the default
        //});
        // CreateChannel(1, 3, "oN", produce into next channel)
        // CreateChannel(3, 3, "oN + sN", produce into next channel)
        // CreateChannel(3, 3, "oN + sN + tN", just write output)

        public static (Task, Task) CreateChannel(int ctProducers, int ctConsumers, Func<Task<IEnumerable<string>>> produce, Func<string, Task> consume)
        {
            var channel = Channel.CreateUnbounded<string>(new UnboundedChannelOptions()
            {
                SingleWriter = false,
                SingleReader = false,
                AllowSynchronousContinuations = false // the default
            });

            async Task BeginProducing()
            {
                foreach (var msg in await produce()) await PublishAsync(msg);
            }

            ValueTask<bool> PublishAsync(string item)
            {
                async Task<bool> AsyncSlowPath(string thing)
                {
                    while (await channel.Writer.WaitToWriteAsync())
                    {
                        if (channel.Writer.TryWrite(thing.ToString())) return true;
                    }
                    return false; // Channel was completed during the wait
                }

                return channel.Writer.TryWrite(item.ToString()) ? new ValueTask<bool>(true) : new ValueTask<bool>(AsyncSlowPath(item));
            }

            async Task ConsumeData()
            {
                string msg = null;
                do
                {
                    await consume(msg = await ConsumeAsync());
                } while (msg != null);
            }

            ValueTask<string> ConsumeAsync()
            {
                string msg = null;
                async Task<string> AsyncSlowPath()
                {
                    while (await channel.Reader.WaitToReadAsync())
                    {
                        if (channel.Reader.TryRead(out msg)) return msg;
                    }
                    return msg; // Channel was completed during the wait
                }

                return channel.Reader.TryRead(out msg) ? new ValueTask<string>(msg) : new ValueTask<string>(AsyncSlowPath());
            }

            List<Task> pTasks = new List<Task>();
            for (int i = 0; i < ctProducers; i++) pTasks.Add(BeginProducing());

            List<Task> cTasks = new List<Task>();
            for (int i = 0; i < ctConsumers; i++) cTasks.Add(ConsumeData());

            return (Task.WhenAll(pTasks).ContinueWith(_ => channel.Writer.Complete()), Task.WhenAll(cTasks));
        }

        public static (Task, Task) Channeler(Channel<string> channel, List<Func<Task<IEnumerable<string>>>> producers, List<Func<string, Task<string>>> consumers, Channel<string> nextChannel)
        {
            async Task BeginProducing(int idx)
            {
                foreach (var msg in await producers[idx]()) await PublishAsync(channel, msg);
            }

            ValueTask<bool> PublishAsync(Channel<string> chan, string item)
            {
                async Task<bool> AsyncSlowPath(string thing)
                {
                    while (await chan.Writer.WaitToWriteAsync())
                    {
                        if (chan.Writer.TryWrite(thing.ToString())) return true;
                    }
                    return false; // Channel was completed during the wait
                }

                return chan.Writer.TryWrite(item.ToString()) ? new ValueTask<bool>(true) : new ValueTask<bool>(AsyncSlowPath(item));
            }

            async Task ConsumeData(int idx)
            {
                string msg = null;
                do
                {
                    msg = await ConsumeAsync();
                    if (msg == null) break;
                    string newMsg = await consumers[idx](msg);
                    if (nextChannel != null) await PublishAsync(nextChannel, newMsg);
                } while (msg != null);
            }

            ValueTask<string> ConsumeAsync()
            {
                string msg = null;
                async Task<string> AsyncSlowPath()
                {
                    while (await channel.Reader.WaitToReadAsync())
                    {
                        if (channel.Reader.TryRead(out msg)) return msg;
                    }
                    return msg; // Channel was completed during the wait
                }

                return channel.Reader.TryRead(out msg) ? new ValueTask<string>(msg) : new ValueTask<string>(AsyncSlowPath());
            }

            List<Task> pTasks = new List<Task>();
            for (int i = 0; i < (producers != null ? producers.Count : 0); i++) pTasks.Add(BeginProducing(i));

            List<Task> cTasks = new List<Task>();
            for (int i = 0; i < (consumers != null ? consumers.Count : 0); i++) cTasks.Add(ConsumeData(i));

            return ((producers != null ? producers.Count : 0) == 0 ? Task.CompletedTask : Task.WhenAll(pTasks).ContinueWith(_ => channel.Writer.Complete()),
                Task.WhenAll(cTasks).ContinueWith(_ => { if (nextChannel != null) nextChannel.Writer.Complete(); }));
        }

        public static async Task TestChanneler()
        {
            var channel1 = Channel.CreateUnbounded<string>(new UnboundedChannelOptions()
            {
                SingleWriter = true,
                SingleReader = false,
                AllowSynchronousContinuations = false // the default
            });
            var channel2 = Channel.CreateUnbounded<string>(new UnboundedChannelOptions()
            {
                SingleWriter = false,
                SingleReader = false,
                AllowSynchronousContinuations = false // the default
            });
            var channel3 = Channel.CreateUnbounded<string>(new UnboundedChannelOptions()
            {
                SingleWriter = false,
                SingleReader = false,
                AllowSynchronousContinuations = false // the default
            });
            var pc1 = ChannelsTester.Channeler(channel1, new List<Func<Task<IEnumerable<string>>>>() { () => Task.FromResult(GetStrings(1)), () => Task.FromResult(GetStrings(2)), () => Task.FromResult(GetStrings(3)) },
                new List<Func<string, Task<string>>>() {
                    async (string msg) =>
                    {
                        Random rnd = new Random();
                        int num  = rnd.Next(1, 10);
                        await Task.Delay(250 * num);
                        return $"[1,1] - a{msg}";
                    },
                    async (string msg) =>
                    {
                        Random rnd = new Random();
                        int num  = rnd.Next(1, 10);
                        await Task.Delay(250 * num);
                        return $"[1,2] - a{msg}";
                    },
                    async (string msg) =>
                    {
                        Random rnd = new Random();
                        int num  = rnd.Next(1, 10);
                        await Task.Delay(250 * num);
                        return $"[1,3] - a{msg}";
                    }
                }, channel2);
            var pc2 = ChannelsTester.Channeler(channel2, null,
                new List<Func<string, Task<string>>>() {
                    async (string msg) =>
                    {
                        Random rnd = new Random();
                        int num  = rnd.Next(1, 10);
                        await Task.Delay(250 * num);
                        return $"[2,1] - b{msg}";
                    },
                    async (string msg) =>
                    {
                        Random rnd = new Random();
                        int num  = rnd.Next(1, 10);
                        await Task.Delay(250 * num);
                        return $"[2,2] - b{msg}";
                    },
                    async (string msg) =>
                    {
                        Random rnd = new Random();
                        int num  = rnd.Next(1, 10);
                        await Task.Delay(250 * num);
                        return $"[2,3] - b{msg}";
                    }
                }, channel3);
            var pc3 = ChannelsTester.Channeler(channel3, null,
                new List<Func<string, Task<string>>>() {
                    async (string msg) =>
                    {
                        Random rnd = new Random();
                        int num  = rnd.Next(1, 10);
                        await Task.Delay(250 * num);
                        Console.WriteLine($"[3,1] - c{msg}");
                        return $"[3,1] - c{msg}";
                    },
                    async (string msg) =>
                    {
                        Random rnd = new Random();
                        int num  = rnd.Next(1, 10);
                        await Task.Delay(250 * num);
                        Console.WriteLine($"[3,2] - c{msg}");
                        return $"[3,2] - c{msg}";
                    },
                    async (string msg) =>
                    {
                        Random rnd = new Random();
                        int num  = rnd.Next(1, 10);
                        await Task.Delay(250 * num);
                        Console.WriteLine($"[3,3] - c{msg}");
                        return $"[3,3] - c{msg}";
                    }
                }, null);

            await pc1.Item1;
            await pc1.Item2;
            await pc2.Item1;
            await pc2.Item2;
            await pc3.Item1;
            await pc3.Item2;
        }

        //public static async Task<Channel> CreateChannel<T>(int ctProducers, int ctConsumers, Func<IEnumerable<T>> produce, Action<T> consume)
        //{
        //    var channel = Channel.CreateUnbounded<string>(new UnboundedChannelOptions()
        //    {
        //        SingleWriter = false,
        //        SingleReader = false,
        //        AllowSynchronousContinuations = false // the default
        //    });

        //    async Task BeginProducing()
        //    {
        //        foreach (var msg in produce()) await PublishAsync(msg);
        //    }

        //    ValueTask<bool> PublishAsync<U>(U item)
        //    {
        //        async Task<bool> AsyncSlowPath<V>(V thing)
        //        {
        //            while (await channel.Writer.WaitToWriteAsync())
        //            {
        //                if (channel.Writer.TryWrite(thing.ToString())) return true;
        //            }
        //            return false; // Channel was completed during the wait
        //        }

        //        return channel.Writer.TryWrite(item.ToString()) ? new ValueTask<bool>(true) : new ValueTask<bool>(AsyncSlowPath(item));
        //    }

        //    async Task ConsumeData<T>()
        //    {
        //        T msg = default;
        //        do
        //        {
        //            consume(await ConsumeAsync<T>());
        //        } while (msg != null);
        //    }

        //    ValueTask<X> ConsumeAsync<X>()
        //    {
        //        X msg = default;
        //        async Task<X> AsyncSlowPath()
        //        {
        //            while (await channel.Reader.WaitToReadAsync())
        //            {
        //                if (channel.Reader.TryRead(out msg)) return msg;
        //            }
        //            return msg; // Channel was completed during the wait
        //        }

        //        return channel.Reader.TryRead(out msg) ? new ValueTask<X>(msg) : new ValueTask<X>(AsyncSlowPath());
        //    }

        //    List<Task> pTasks = new List<Task>();
        //    for (int i = 0; i < ctProducers; i++) pTasks.Add(BeginProducing());

        //    List<Task> cTasks = new List<Task>();
        //    for (int i = 0; i < ctConsumers; i++) cTasks.Add(ConsumeData());

        //    await Task.WhenAll(pTasks)
        //        .ContinueWith(_ => channel.Writer.Complete());

        //    await Task.WhenAll(cTasks);
        //}








        internal class Producer
        {
            private readonly ChannelWriter<string> _writer;
            private readonly int _identifier;
            private readonly int _delay;

            public Producer(ChannelWriter<string> writer, int identifier, int delay)
            {
                _writer = writer;
                _identifier = identifier;
                _delay = delay;
            }

            public async Task BeginProducing()
            {
                Console.WriteLine($"PRODUCER ({_identifier}): Starting");

                for (var i = 0; i < 10; i++)
                {
                    await Task.Delay(_delay); // simulate producer building/fetching some data

                    var msg = $"M{_identifier * 10 + i} - P{_identifier} - {DateTime.UtcNow:G}";

                    Console.WriteLine($"PRODUCER ({_identifier}): Creating {msg}");

                    //await _writer.WriteAsync(msg);
                    await PublishAsync(msg);
                }

                Console.WriteLine($"PRODUCER ({_identifier}): Completed");
            }

            public ValueTask<bool> PublishAsync<T>(T item)
            {
                async Task<bool> AsyncSlowPath<S>(S thing)
                {
                    while (await _writer.WaitToWriteAsync())
                    {
                        if (_writer.TryWrite(thing.ToString())) return true;
                    }
                    return false; // Channel was completed during the wait
                }

                return _writer.TryWrite(item.ToString()) ? new ValueTask<bool>(true) : new ValueTask<bool>(AsyncSlowPath(item));
            }
        }



        internal class Consumer
        {
            private readonly ChannelReader<string> _reader;
            private readonly int _identifier;
            private readonly int _delay;

            public Consumer(ChannelReader<string> reader, int identifier, int delay)
            {
                _reader = reader;
                _identifier = identifier;
                _delay = delay;
            }

            public async Task ConsumeData()
            {
                Console.WriteLine($"CONSUMER ({_identifier}): Starting");

                //while (await _reader.WaitToReadAsync())
                //{
                //    if (_reader.TryRead(out var timeString))
                //    {
                //        await Task.Delay(_delay); // simulate processing time

                //        Console.WriteLine($"CONSUMER ({_identifier}): Consuming {timeString}");
                //    }
                //}

                string timeString = null;
                do
                {
                    timeString = await ConsumeAsync();
                    await Task.Delay(_delay); // simulate processing time
                    Console.WriteLine($"CONSUMER ({_identifier}): Consuming {timeString}");
                } while (timeString != null);


                Console.WriteLine($"CONSUMER ({_identifier}): Completed");


            }

            public ValueTask<string> ConsumeAsync()
            {
                string msg = null;
                async Task<string> AsyncSlowPath()
                {
                    while (await _reader.WaitToReadAsync())
                    {
                        if (_reader.TryRead(out msg)) return msg;
                    }
                    return msg; // Channel was completed during the wait
                }

                return _reader.TryRead(out msg) ? new ValueTask<string>(msg) : new ValueTask<string>(AsyncSlowPath());
            }
        }

        public static IEnumerable<string> GetStrings()
        {
            for (int i = 0; i < 5; i++)
            {
                Task.Delay(250).GetAwaiter().GetResult();
                yield return i.ToString();
            }
        }

        public static IEnumerable<string> channelProducer()
        {
            return GetStrings();
        }

        public static async Task channelConsumer(string msg)
        {
            await Task.Delay(250);
            Console.WriteLine($"{msg}");
        }

        public static IEnumerable<string> GetStrings(int channel)
        {
            string prefix = "";
            if (channel == 1) prefix = "a";
            else if (channel == 2) prefix = "b";
            else prefix = "c";

            for (int i = 0; i < 5; i++)
            {
                Task.Delay(250).GetAwaiter().GetResult();
                yield return $" - {prefix}" + i.ToString();
            }
        }

        //public static IEnumerable<string> GetStrings2(int channel)
        //{
        //    string prefix = "";
        //    if (channel == 1) prefix = "a";
        //    else if (channel == 2) prefix = "b";
        //    else prefix = "c";

        //    for (int i = 0; i < 5; i++)
        //    {
        //        Task.Delay(250).GetAwaiter().GetResult();
        //        yield return $" - {prefix}" + i.ToString();
        //    }
        //}

        //public static IEnumerable<string> GetStrings3(int channel)
        //{
        //    string prefix = "";
        //    if (channel == 1) prefix = "a";
        //    else if (channel == 2) prefix = "b";
        //    else prefix = "c";

        //    for (int i = 0; i < 5; i++)
        //    {
        //        Task.Delay(250).GetAwaiter().GetResult();
        //        yield return $" - {prefix}" + i.ToString();
        //    }
        //}

        //public static async Task<IEnumerable<string>> channel1Producer()
        //{
        //    return GetStrings1(1);
        //}

        //public static async Task<IEnumerable<string>> channel2Producer()
        //{
        //    return GetStrings2(2);
        //}

        //public static async Task<IEnumerable<string>> channel3Producer()
        //{
        //    return GetStrings3(3);
        //}

        //public static async Task channel1Consumer(string msg)
        //{
        //    await Task.Delay(250);
        //    Console.WriteLine($"[1] - {msg}");
        //}

        //public static async Task channel2Consumer(string msg)
        //{
        //    await Task.Delay(250);
        //    Console.WriteLine($"[2] - {msg}");
        //}

        //public static async Task channel3Consumer(string msg)
        //{
        //    await Task.Delay(250);
        //    Console.WriteLine($"[3] - {msg}");
        //}

    }
}
