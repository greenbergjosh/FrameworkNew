namespace RedisScheduler
{
    internal static class Program
    {
        private static void Main(string[] args)
        {
            var command = Constants.Consumer;
            var nbThreads = 1;
            var nbMessages = 100;

            if (args.Length > 0)
                command = args[0].ToLowerInvariant();

            if (args.Length > 1)
                int.TryParse(args[1], out nbThreads);

            if (args.Length > 2)
                int.TryParse(args[2], out nbMessages);

            FastConsole.Start();

            RedisTaskRunner.Run((mp, db, lockFactory, eventLock) =>
            {
                switch (command)
                {
                    case Constants.Producer:
                        Producer.Run(db, nbThreads, nbMessages);
                        break;

                    case Constants.Consumer:
                    default:
                        Consumer.Run(mp, db, lockFactory, eventLock);
                        break;
                }
            });

            FastConsole.Wait();
        }
    }
}
