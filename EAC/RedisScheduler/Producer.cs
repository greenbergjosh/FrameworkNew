using System;
using System.Linq;
using System.Reactive;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using StackExchange.Redis;

namespace RedisScheduler
{
    public static class Producer
    {
        private static Subject<Unit> s;
        private static int TotalMessages = 0;
        private static int ImmediateId = 0;
        private static int SignalId = 0;
        private static int InterruptId = 0;

        public static void Run(IDatabase db, int nbThreads, int nbMessages)
        {
            var ids = Enumerable.Range(0, nbThreads)
                .Select(t => t.ToString())
                .ToArray();

            var startTime = DateTime.Now.TimeOfDay;

            for (int i = 0; i < nbMessages; i++)
            {
                foreach (var id in ids)
                {
                    ProduceInterrupt(db, id);
                    /*ProduceInterrupt(db, id);
                    ProduceInterrupt(db, id);
                    ProduceImmediate(db, id);
                    ProduceSignal(db, id);
                    ProduceInterrupt(db, id);
                    ProduceSignal(db, id);*/
                }
            }

            var endTime = DateTime.Now.TimeOfDay;

            FastConsole.WriteLine($"{startTime}");
            FastConsole.WriteLine($"{endTime}");
        }

        private static void ProduceImmediate(IDatabase db, string id) => ProduceMessage(db, id, Constants.Immediate, ImmediateId++.ToString());

        private static void ProduceSignal(IDatabase db, string id) => ProduceMessage(db, id, Constants.Signal, SignalId++.ToString());

        private static void ProduceInterrupt(IDatabase db, string id) => ProduceMessage(db, id, Constants.Interrupt, InterruptId++.ToString());

        private static void ProduceMessage(IDatabase db, string id, string type, string value)
        {
            if (s == null)
            {
                var i = 0;
                var last = TotalMessages;
                db.Publish(Constants.Messages, string.Empty);
                s = new Subject<Unit>();
                s.Sample(TimeSpan.FromMilliseconds(1000))
                 .Subscribe(t =>
                 {
                     if (last != TotalMessages)
                     {
                         Console.WriteLine($"event {i++} TotalMessages: {TotalMessages}");
                         db.Publish(Constants.Messages, string.Empty);
                         last = TotalMessages;
                     }
                 });
            }
            // Console.WriteLine($"Produce Message Type: {type} Thread: {id} Value: {value}");
            db.ListLeftPush(Constants.Messages, $"{id};{type};{value}");
            db.Publish(Constants.Messages, string.Empty);
            s.OnNext(Unit.Default);
            TotalMessages++;
        }
    }
}
