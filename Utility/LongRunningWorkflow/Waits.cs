using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Utility.LongRunningWorkflow
{
    public class Wait
    {
        [JsonProperty("name")]
        public string Name;

        [JsonProperty("payload")]
        public object Payload;
    }

    public class WaitOne : Wait
    {
        [JsonProperty("discriminator")]
        public string Discriminator;

        [JsonProperty("lookback_period")]
        public string LookbackPeriod;
    }

    public class WaitTimedOne : WaitOne
    {
        [JsonProperty("raise_at")]
        public DateTime RaiseAt;

        [JsonProperty("raise_payload")]
        public object RaisePayload;
    }

    public abstract class WaitGroup : Wait
    {
        [JsonProperty("logic")]
        public abstract string Logic { get; }

        [JsonProperty("waits")]
        public List<Wait> Waits = new List<Wait>();

        protected WaitGroup(Wait[] children)
        {
            if (children?.Length == 0)
            {
                throw new ArgumentException($"{nameof(children)} cannot be empty", nameof(children));
            }

            Waits.AddRange(children);
        }
    }

    public class WaitAll : WaitGroup
    {
        public override string Logic => "all";

        public WaitAll(string name, params Wait[] children) : this(children)
        {
            Name = name;
        }

        public WaitAll(params Wait[] children) : base(children)
        {
        }
    }

    public class WaitAny : WaitGroup
    {
        public override string Logic => "any";

        public WaitAny(string name, params Wait[] children) : this(children)
        {
            Name = name;
        }

        public WaitAny(params Wait[] children) : base(children)
        {
        }
    }
}