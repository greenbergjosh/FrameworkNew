﻿using Newtonsoft.Json;
using System;

namespace Framework.Core.EDW.Queueing
{
    public class PostingQueueEntry
    {
        public string PostType;
        public DateTime PostDate;
        [JsonConverter(typeof(RawJsonConverter))]
        public string Payload;


        public PostingQueueEntry(string postingType, DateTime postingDate, string payload)
        {
            PostType = postingType;
            PostDate = postingDate;
            Payload = payload;
        }

        public override string ToString() => JsonConvert.SerializeObject(this);
    }
}
