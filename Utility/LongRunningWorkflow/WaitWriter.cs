using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace Utility.LongRunningWorkflow
{
    public class WaitWriter
    {
        private readonly List<Wait> _waits = new();

        public Guid Id { get; init; } = Guid.NewGuid();
        public DateTime Timestamp { get; init; } = DateTime.UtcNow;
        public Guid ProcessId { get; init; }
        public Guid ThreadId { get; init; }
        public Guid ApartmentId { get; set; }
        public bool Exclusive { get; set; }
        public Entity.Entity Payload { get; init; }
        public Guid PayloadRunnerEntityId { get; set; }
        public bool HasWaits => _waits.Any();

        public WaitWriter(Guid processId, Guid threadId, Guid apartmentId, bool exclusive, Guid payloadRunnerEntityId, Entity.Entity payload = null)
        {
            ProcessId = processId;
            ThreadId = threadId;
            ApartmentId = apartmentId;
            Exclusive = exclusive;
            Payload = payload;
            PayloadRunnerEntityId = payloadRunnerEntityId;
        }

        public WaitWriter(Guid id, DateTime timestamp, Guid processId, Guid threadId, Guid apartmentId, bool exclusive, Guid payloadRunnerEntityId, Entity.Entity payload = null) : this(processId, threadId, apartmentId, exclusive, payloadRunnerEntityId, payload)
        {
            Id = id;
            Timestamp = timestamp;
        }

        public override string ToString() => JsonConvert.SerializeObject(new
        {
            LRW = new[] {new
            {
                payload = new
                {
                    waits = new[] {
                        new
                        {
                            id = Id,
                            ts = Timestamp,
                            payload = new { waits = _waits, payloadRunnerEntityId = PayloadRunnerEntityId },
                            process_id = ProcessId,
                            thread_id = ThreadId,
                            apartment_id = ApartmentId,
                            exclusive = Exclusive
                        }
                    }
                }
            }
            }
        });

        public void AddWait(Wait wait) => _waits.Add(wait);

        public bool RemoveWait(Wait wait) => _waits.Remove(wait);

        public bool RemoveWait(string waitName) => _waits.Remove(_waits.FirstOrDefault(wait => wait.Name == waitName));
    }
}