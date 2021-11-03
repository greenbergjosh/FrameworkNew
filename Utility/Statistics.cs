using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace Utility
{
    public interface IStatsProvider
    {
        IStatInstance StartNewInstance(string name, TimeSpan timeToLive);
        IEnumerable<StatsResult> GetResults();
    }

    public interface IStatInstance
    {
        void Completed();

        TimeSpan GetElapsed();
    }

    public abstract class BaseStatsProvider : IStatsProvider
    {
        public abstract IStatInstance StartNewInstance(string name, TimeSpan timeToLive);

        public abstract IEnumerable<StatsResult> GetResults();
    }

    public struct StatsResult
    {
        public StatsResult(string name, List<StatInstance> instance)
        {
            Name = name;

            Weight = instance.Count;

            var completed = instance.Where(s => s.IsCompleted).ToArray();

            AverageTime = completed.Any() ? new TimeSpan(0, 0, 0, 0, (int) completed.Average(s => s.GetElapsed().TotalMilliseconds)) : TimeSpan.Zero;

            Incomplete = instance.Count(s => !s.IsCompleted);
        }

        public string Name { get; }
        public TimeSpan AverageTime { get; }
        public int Weight { get; }
        public int Incomplete { get; }
    }

    #region Active Stats Provider

    public class StatsProvider : BaseStatsProvider
    {
        private ConcurrentDictionary<string, List<StatInstance>> _stats = new();
        private readonly object _locker = new();
        private DateTime _lastCleaned = DateTime.MinValue;

        private void CleanUp()
        {
            lock (_locker)
            {
                if (_lastCleaned < DateTime.Now.AddMilliseconds(-500))
                {
                    _stats.SelectMany(s => s.Value).Where(v => v.Expired && !v.IsCompleted).ToList().ForEach(v => v.Completed());
                    _stats = new ConcurrentDictionary<string, List<StatInstance>>(_stats
                        .Select(s => new KeyValuePair<string, List<StatInstance>>(s.Key, s.Value.Where(v => !v.Expired).ToList()))
                        .Where(s => s.Value.Any()));

                    _lastCleaned = DateTime.Now;
                }
            }
        }

        public override IStatInstance StartNewInstance(string name, TimeSpan timeToLive)
        {
            CleanUp();
            var stat = new StatInstance(Stopwatch.StartNew(), timeToLive);

            _stats.GetOrAdd(name, s => new List<StatInstance>()).Add(stat);

            return stat;
        }

        public IDictionary<string, List<StatInstance>> Raw => _stats;

        public override IEnumerable<StatsResult> GetResults()
        {
            CleanUp();
            return _stats.Select(kvp => new StatsResult(kvp.Key, kvp.Value)).ToArray();
        }
    }

    public class StatInstance : IStatInstance
    {
        private readonly Stopwatch _stopwatch;
        private readonly DateTime _expires;

        public StatInstance(Stopwatch stopwatch, TimeSpan timeToLive)
        {
            _stopwatch = stopwatch;
            _expires = DateTime.Now.Add(timeToLive);
        }

        public void Completed() => _stopwatch.Stop();

        public TimeSpan GetElapsed() => _stopwatch.Elapsed;

        public bool Expired => _expires < DateTime.Now;

        public void Start() => _stopwatch.Start();

        public bool IsCompleted => !_stopwatch.IsRunning;
    }

    #endregion

    #region NullStats

    public class NullStatsProvider : BaseStatsProvider
    {
        private static readonly NullStatInstance NullStat = new();

        public override IStatInstance StartNewInstance(string name, TimeSpan timeToLive) => NullStat;

        public override IEnumerable<StatsResult> GetResults() => new List<StatsResult>();
    }

    public class NullStatInstance : IStatInstance
    {
        public NullStatInstance() { }

        public void Completed() { }

        public TimeSpan GetElapsed() => default;

        public static void Start() { }

        public static bool IsCompleted => true;
    }

    #endregion
}