using System;
using System.Collections.Generic;
using System.Text;

namespace SignalApiLib
{
    public class PostingQueueData
    {
        public PostingQueueData(string key, string payload)
        {
            Key = key;
            Payload = payload;
        }

        public string Key { get; }
        public string Payload { get; }
    }
}
