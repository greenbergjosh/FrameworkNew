using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;

namespace Utility.LongRunningWorkflow
{
    public enum WaitType
    {
        Signal,
        Interrupt
    }

    public class Wait
    {
        [JsonPropertyName("name")]
        public string Name;

        [JsonPropertyName("discriminator_payload")]
        public Entity.Entity Payload;

        [JsonPropertyName("type")]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public WaitType Type;
    }

    public class WaitOne : Wait
    {
        [JsonPropertyName("discriminator")]
        public string Discriminator;

        [JsonPropertyName("lookback_period")]
        public string LookbackPeriod;
    }

    public class WaitTimedOne : WaitOne
    {
        [JsonPropertyName("raise_at")]
        public DateTime RaiseAt;

        [JsonPropertyName("raise_payload")]
        public object RaisePayload;
    }

    public abstract class WaitGroup : Wait
    {
        [JsonPropertyName("logic")]
        public abstract string Logic { get; }

        [JsonPropertyName("waits")]
        public List<Wait> Waits { get; } = new();

        protected WaitGroup(Wait[] children)
        {
            if (children?.Length == 0)
            {
                throw new ArgumentException($"{nameof(children)} cannot be empty", nameof(children));
            }

            Waits.AddRange(children);
        }

        public void AddWait(Wait wait) => Waits.Add(wait);

        public bool RemoveWait(Wait wait) => Waits.Remove(wait);

        public bool RemoveWait(string waitName) => Waits.Remove(Waits.FirstOrDefault(w => w.Name == waitName));
    }

    public class WaitAll : WaitGroup
    {
        public override string Logic => "all";

        public WaitAll(string name, params Wait[] children) : this(children) => Name = name;

        public WaitAll(params Wait[] children) : base(children)
        {
        }
    }

    public class WaitAny : WaitGroup
    {
        public override string Logic => "any";

        public WaitAny(string name, params Wait[] children) : this(children) => Name = name;

        public WaitAny(params Wait[] children) : base(children)
        {
        }
    }
}