﻿using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;

namespace EdwServiceLib
{
    public class Stack : List<KeyValuePair<string, IDictionary<string, JToken>>>
    {
        public void AddStackFrame(string key, IDictionary<string, JToken> value)
        {
            Add(new KeyValuePair<string, IDictionary<string, JToken>>(key, value));
        }

        public bool TryGetValue(string key, out JToken value)
        {
            foreach (var stackFrame in Enumerable.Reverse(this))
            {
                if (stackFrame.Value.TryGetValue(key, out value))
                    return true;
            }

            value = null;
            return false;
        }

        public bool TryGetStackFrame(string key, out IDictionary<string, JToken> value)
        {
            var (s, dictionary) = this.FirstOrDefault(pair => pair.Key == key);
            if (string.IsNullOrEmpty(s))
            {
                value = null;
                return false;
            }

            value = dictionary;
            return true;
        }

        public bool TryGetStackFrameValue(string stackFrameName, string key, out JToken value)
        {
            if (TryGetStackFrame(stackFrameName, out var stackFrame) && 
                stackFrame.TryGetValue(key, out value))
                return true;

            value = null;
            return false;
        }

        public Stack Range(int count)
        {
            var subStack = new Stack();
            for (var i = 0; i < Count && i < count; i++)
                subStack.Add(this[i]);
            return subStack;
        }
    }
}