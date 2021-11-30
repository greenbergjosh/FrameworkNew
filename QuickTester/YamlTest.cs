using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YamlDotNet.RepresentationModel;

namespace QuickTester
{
    class YamlTest
    {
        public static async void Run()
        {
            string filename = @"yaml2.txt";

            using (StreamReader reader = File.OpenText(filename))
            {
                var yaml = new YamlStream();
                yaml.Load(reader);

                // Examine the stream
                var mapping =
                    (YamlMappingNode)yaml.Documents[0].RootNode;

                foreach (var entry in mapping.Children)
                {
                    Console.WriteLine(((YamlScalarNode)entry.Key).Value);
                }

                // List all the items
                var items = (YamlSequenceNode)mapping.Children[new YamlScalarNode("items")];
                foreach (YamlMappingNode item in items)
                {
                    Console.WriteLine(
                        "{0}\t{1}",
                        item.Children[new YamlScalarNode("part_no")],
                        item.Children[new YamlScalarNode("descrip")]
                    );
                }
            }

            // Load the stream
            
        }
    }
}
