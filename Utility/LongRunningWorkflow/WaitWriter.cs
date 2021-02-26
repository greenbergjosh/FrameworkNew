using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace Utility.LongRunningWorkflow
{
    public class WaitWriter
    {
        private readonly List<Wait> _waits = new List<Wait>();

        public Guid Id { get; init; } = Guid.NewGuid();
        public DateTime Timestamp { get; init; } = DateTime.UtcNow;
        public Guid ThreadId { get; init; }
        public Guid ApartmentId { get; set; }
        public bool Exclusive { get; set; }
        public object Payload { get; set; }
        public Guid PayloadRunnerEntityId { get; set; }
        public bool HasWaits => _waits.Any();

        public WaitWriter(Guid threadId, Guid apartmentId, bool exclusive, Guid payloadRunnerEntityId, object payload = null)
        {
            ThreadId = threadId;
            ApartmentId = apartmentId;
            Exclusive = exclusive;
            Payload = payload;
            PayloadRunnerEntityId = payloadRunnerEntityId;
        }

        public WaitWriter(Guid id, DateTime timestamp, Guid threadId, Guid apartmentId, bool exclusive, Guid payloadRunnerEntityId, object payload = null) : this(threadId, apartmentId, exclusive, payloadRunnerEntityId, payload)
        {
            Id = id;
            Timestamp = timestamp;
        }

        public override string ToString() => JsonConvert.SerializeObject(new
        {
            waits = new[] {
                new
                {
                    id = Id,
                    ts = Timestamp,
                    payload = new { waits = _waits, payload = Payload, payloadRunnerEntityId = PayloadRunnerEntityId },
                    thread_id = ThreadId,
                    apartment_id = ApartmentId,
                    exclusive = Exclusive
                }
            }
        });

        public void AddWait(Wait wait)
        {
            _waits.Add(wait);
        }

        public void RemoveWait(Wait wait) => _waits.Remove(wait);

        public bool RemoveWait(string waitName)
        {
            var wait = _waits.FirstOrDefault(wait => wait.Name == waitName);
            if (wait is not null)
            {
                return _waits.Remove(wait);
            }

            return false;
        }
    }
}