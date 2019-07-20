﻿using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace Utility
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

        public override string ToString()
        {
            return JsonWrapper.Json(new
            {
                t = PostType,
                d = PostDate,
                p = Utility.Hashing.EncodeTo64(Payload)
            });
        }
    }
}