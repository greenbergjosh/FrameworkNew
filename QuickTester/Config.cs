using System.Collections.Generic;
using System.Linq;
using Utility.GenericEntity;

namespace QuickTester
{
    internal class Config
    {
        private static readonly string testJson = @"
{
   ""terms"":[
      {
         ""A"":{
            ""#"": {""id"": ""1""},
            ""config"": { ""name"":""a"", ""x"":""1"" },
            ""LeftHandsAndFeet"":{
               ""#"": { ""id"": ""2""},
               ""config"": { ""name"":""leftHandsAndFeet"" },
               ""args"":{
                  ""#"": { ""id"": ""3"" },
                  ""config"": { ""configOfargs"":"""" }
               },
               ""result"":{
                  ""#"": { ""id"": ""4"" },
                  ""config"": { ""configOfresult"":"""" },
                  ""HandsAndFeet"":{
                     ""#"": { ""id"": ""5"" },
                     ""config"": { ""name"":""handsAndFeet"" },
                     ""1"": {
                        ""#"": { ""id"": ""6"" },
                        ""config"": { ""configOfi1"":"""" },
                        ""HandAndFoot"":{
                           ""#"": { ""id"": ""7"" },
                           ""config"": { ""name"":""handAndFoot"" },
                           ""p1"":{
                              ""#"": { ""id"": ""8"" },
                              ""config"": { ""configofp1"":"""" },
                              ""B"":{
                                 ""#"": { ""id"": ""9"" },
                                 ""config"": { ""name"":""b"", ""z"":""1"" }
                              }
                           },
                           ""p2"":{
                              ""#"": { ""id"": ""10"" },
                              ""C"":{
                                 ""#"": { ""id"": ""11"" },
                                 ""config"": { ""name"":""c"", ""t"":""1"" }
                              }
                           }
                        }
                     }
                  }
               }
            },
            ""AIsAE"":{
               ""#"": { ""id"": ""12"" },
               ""config"": { ""name"":""a is e"" },
               ""this"": { ""#"": { ""id"": ""13"" }, ""config"": { ""configOfthis"":"""" } },
               ""that"":{
                  ""#"": { ""id"": ""14"" },
                  ""config"": { ""configOfthat"":""3478"" },
                  ""*E"":{
                     ""#"": { ""#id"": ""15"" },
                     ""config"": { ""name"":""e"", ""m"":""1"" }
                  }
               }
            }
         }
      }
   ]
}
";
        public static void Test()
        {
            IGenericEntity ge = GenericEntityJson.Parse(testJson);
            BuildInsertsFromJson(ge);
        }
        /*
         * Inserts
        SimpleType *T1(id1) { c1, c2, ->1, ->2, isA1, isA2 }    -- parent_id=id1
           {id: id1, type: T1, config: { c1, c2 }, edges: [] }

        ->::T2(id2) {id: id2, type: T2, config: { c1, c2 }, edges: [
          /args(id3)  {"id": id3, "dest_id": parent_id, "config" : { "name":"args", "configOfargs": "" } }  -- source is id2
          /result(id4){"id": id4, "dest_id": /result/*T3(id5), "config" : { "name":"result", "configOfresult": "" } }  -- source is id2
          ]

        IsA::T3(id6) {id: id6, type: T3, config: { c1, c2 }, edges: [
          /this(id7)   {"id": id7, "dest_id": parent_id, "config" : { "name":"args", "configOfthis": "" } }  -- source is id6
          /that(id8)   {"id": id8, "dest_id": /that/*T4(id9), "config" : { "name":"result", "configOfresult": "" } }  -- source is id6
          ]

        x::T5(id10) {id: id10, type: T5, config: { c1, c2 }, edges: [
          /p1(id11)  {"id": id11, "dest_id": /p1/*T6(id12), "config" : { "name":"args", "configOfargs": "" } }  -- source is id10
          /p2(id13)  {"id": id13, "dest_id": /p1/*T7(id14), "config" : { "name":"args", "configOfargs": "" } }  -- source is id10  
          ]

        +::T8(15) {id: id15, type: T8, config: { c1, c2 }, edges: [
          /i1(id16)  {"id": id16, "dest_id": /p1/*T9(id17), "config" : { "name":"args", "configOfargs": "" } }  -- source is id15
          ]

        List::T10(id18) {id: id18, type: T10, config: { c1, c2 }, edges: [
          /1(id19)  {"id": id19, "dest_id": /1/*T11(id20), "config" : { "name":"args", "configOfargs": "" } }  -- source is id18
          /2(id21)  {"id": id21, "dest_id": /2/*T12(id20), "config" : { "name":"args", "configOfargs": "" } }  -- source is id18

         */

        public static void BuildInsertsFromJson(IGenericEntity ge)
        {
            foreach (var x in ge.GetL("terms"))
            {
                var level = x.GetDe("").First();
                var typeName = level.key;
                BuildInserts(level.entity, null, typeName, new List<string>());
            }
        }

        public static Dictionary<int, string> typeConstructorCache = new Dictionary<int, string>()
        {
            { 0, "Id" },
            { 1, "->" },
            { 2, "x" },
            { 3, "+" },
            { 4, "List" },
            { 5, "isA" }
        };

        public static Dictionary<string, int> typeCache = new Dictionary<string, int>()
        {
            { "A", 0 },
            { "B", 0 },
            { "C", 0 },
            { "E", 0 },
            { "LeftHandsAndFeet", 1 },
            { "HandsAndFeet", 4 },
            { "HandAndFoot", 2 }
        };

        public static void BuildInserts(IGenericEntity ge, string parentId, string typeName, List<string> inserts)
        {
            var f = ge.GetE("#");
            var id = f.GetS("id");
            var nextParentId = id;
            var c = ge.GetE("config");

            switch (typeConstructorCache[typeCache[typeName]])
            {
                case "Id":
                    inserts.Add("{id: " + id + ", type:" + typeName + ", config:" + ge.GetS("config") + "}");
                    foreach (var child in ge.GetDe(""))
                    {
                        if (child.key != "#" && child.key != "config")
                        {
                            BuildInserts(child.entity, nextParentId, child.key, inserts);
                        }
                    }
                    break;
                case "->":
                    var str = "{id: " + id + ", type:" + typeName + ", config:" + ge.GetS("config") + ", edges: [";
                    var args = ge.GetE("args");
                    // need to add name:args into config
                    str += "{id: " + args.GetE("#").GetS("id") + ", dest_id: " + parentId + ", config:" + args.GetS("config") + "}";
                    var rslt = ge.GetE("result");
                    // need to add name:result into config
                    str += "{id: " + rslt.GetE("#").GetS("id") + ", dest_id: " + GetChildEntityId(rslt) + ", config:" + args.GetS("config") + "}";
                    str += "]}";
                    inserts.Add(str);

                    // Better to ask the type for the names of the edges in edges[]
                    // There are two cases:
                    //   (1) the edge from the type has the name and the dest_type:from_parent indicator
                    //   (2) the type itself has the dest_type:from_parent indicator
                    // We enumerate all non-config, non-# children and if there is a matching type edge we use the type edge indicator,
                    // otherwise we use the type indicator.
                    // This way, all constructions are the same

                    break;
                case "x":
                    break;
                case "+":
                    break;
                case "List":
                    break;
                case "isA":
                    break;
                default:
                    break;
            }             

            

           // SimpleType* T1(id1) { c1, c2, ->1, ->2, isA1, isA2 }
           // --parent_id = id1
           //{ id: id1, type: T1, config: { c1, c2 }, edges:[] }
        }

        public static string GetChildEntityId(IGenericEntity ge)
        {
            foreach (var child in ge.GetDe(""))
            {
                if (child.key != "#" && child.key != "config")
                {
                    return child.entity.GetE("#").GetS("id");
                }
            }

            return null;
        }
    }
}
