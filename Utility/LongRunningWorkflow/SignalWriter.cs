using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace Utility.LongRunningWorkflow
{
    public class SignalWriter
    {
        private readonly List<Signal> _signals = new();

        public void AddSignal(string discriminator, object payload) => AddSignal(Guid.NewGuid(), DateTime.UtcNow, discriminator, payload);

        public void AddSignal(Guid id, DateTime ts, string discriminator, object payload) => _signals.Add(new Signal(id, ts, discriminator, payload));

        private record Signal(Guid Id, DateTime Ts, string Discriminator, object Payload);

        public override string ToString() => JsonSerializer.Serialize(new
        {
            LRW = new[] { new { payload = new { signals = _signals.Select(s => new { id = s.Id, ts = s.Ts, discriminator = s.Discriminator, payload = s.Payload }) } } }
        });
    }
}