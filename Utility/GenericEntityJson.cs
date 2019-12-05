﻿using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;

namespace Utility
{
    public class GenericEntityJson : GenericEntityBase
    {
        public JToken _root;

        public GenericEntityJson() { }

        public override void InitializeEntity(RoslynWrapper rw, object configuration, object data)
        {
            this.rw = rw;
            if (data is JObject || data is JToken || data is JArray) _root = (data as JToken);
            else _root = JObject.Parse(@"{}");
        }

        private string ConvertPath(string path)
        {
            if (path == "") path = "$";
            else
            {
                path = "$." + path;
                path = path.Replace('/', '.');
            }
            return path;
        }

        public override object this[string path]
        {
            get
            {
                return _root.SelectToken(ConvertPath(path));
            }
        }

        public override IEnumerable<IGenericEntity> GetL(string path)
        {
            foreach (JToken item in _root.SelectTokens(ConvertPath(path)).Children())
            {
                GenericEntityJson entity = new GenericEntityJson();
                entity.InitializeEntity(this.rw, null, item);
                yield return entity;
            }
        }

        public override IGenericEntity GetE(string path)
        {
            GenericEntityJson entity = new GenericEntityJson();
            entity.InitializeEntity(this.rw, null, _root.SelectToken(ConvertPath(path)));
            return entity;
        }

        public override IEnumerable<Tuple<string, string>> GetD(string path)
        {
            GenericEntityJson entity = new GenericEntityJson();
            entity.InitializeEntity(this.rw, null, _root.SelectToken(ConvertPath(path)));
            foreach (var je in entity._root.AsJEnumerable())
            {
                yield return new Tuple<string, string>(((JProperty)je).Name, 
                    ((JProperty)je).Value.ToString());
            }
        }

        //public override IEnumerable<Tuple<string, string>> GetArrTuples(string path)
        //{
        //    GenericEntityJson entity = new GenericEntityJson();
        //    entity.InitializeEntity(this.rw, null, _root.SelectToken(ConvertPath(path)));
        //    foreach (var je in entity._root.AsJEnumerable())
        //    {
        //        yield return new Tuple<string, string>(((JProperty)((JObject)je).First).Name,
        //            ((JProperty)((JObject)je).First).Value.ToString());
        //    }
        //}
    }
}