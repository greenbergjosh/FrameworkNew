using System;
using System.Text.Json;

namespace QueueProcessorLib
{
    public sealed class QueueItem
    {
        public long Id { get; }
        public string Discriminator { get; }
        public string Payload { get; }
        public DateTime CreateDate { get; }
        public int RetryNumber { get; }

        public QueueItem(long id, string discriminator, string payload, DateTime createDate, int retryNumber = -1)
        {
            Id = id;
            Discriminator = discriminator;
            Payload = payload;
            CreateDate = createDate;
            RetryNumber = retryNumber;
        }

        public override string ToString() => JsonSerializer.Serialize(this);
    }
}
