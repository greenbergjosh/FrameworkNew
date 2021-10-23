using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace RedisScheduler
{
    public static class FastConsole
    {
        private static readonly BlockingCollection<string> buffer = new BlockingCollection<string>();
        private static Task Task = null;

        public static void WriteLine(string str) => buffer.Add($"{DateTime.Now.TimeOfDay} {str}");

        public static void Start() => Task = Task.Factory.StartNew(() =>
                                    {
                                        while (true)
                                        {
                                            if (Console.KeyAvailable)
                                                break;
                                            while (buffer.TryTake(out var msg, 3000))
                                                Console.WriteLine(msg);
                                        }
                                    });

        public static void Wait() => Task.Wait();
    }
}
