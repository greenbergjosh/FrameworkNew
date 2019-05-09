using System;

namespace QueueProcessorLib
{
    internal sealed class QueueItem
    {
        public long Id { get; }
        public string Discriminator { get; }
        public string Payload { get; }
        public DateTime CreateDate { get; }

        public QueueItem(long id, string discriminator, string payload, DateTime createDate)
        {
            Id = id;
            Discriminator = discriminator;
            Payload = payload;
            CreateDate = createDate;
        }
    }
}
