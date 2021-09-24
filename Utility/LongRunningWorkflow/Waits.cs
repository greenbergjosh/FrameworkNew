using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Utility.GenericEntity;

namespace Utility.LongRunningWorkflow
{
    public enum WaitType
    {
        Signal,
        Interrupt
    }

    public class Wait
    {
        [JsonProperty("name")]
        public string Name;

        [JsonProperty("discriminator_payload")]
        public IGenericEntity Payload;

        [JsonProperty("type")]
        [JsonConverter(typeof(StringEnumConverter), true)]
        public WaitType Type;
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