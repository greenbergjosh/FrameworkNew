﻿using Microsoft.CodeAnalysis.Scripting;
using System;
using System.Security.Cryptography;
using System.Text;
using Utility;

namespace Utility
{
    public class ScriptDescriptor
    {
        public Guid Id;
        public string Name;
        public string Code;
        public bool Debug;
        public string DebugDir;

        public ScriptRunner<object> Script;

        public ScriptDescriptor(Guid id, string name, string code, bool debug, string debugDir)
        {
            Id = id;
            Name = name;
            Code = code;
            Debug = debug;
            DebugDir = debugDir;
            _key = null;
        }

        private string _key = null;
        public string Key
        {
            get
            {
                if (_key == null) _key = (Id == null ? null : Id.ToString().ToLower()) ?? 
                        (Name.ToLower() ?? Hashing.Utf8MD5HashAsHexString(Code));
                return _key;
            }
        }
    }
}
