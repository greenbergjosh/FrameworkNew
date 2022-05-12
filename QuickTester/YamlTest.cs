using System;
using System.IO;
using YamlDotNet.RepresentationModel;

namespace QuickTester
{
    class YamlTest
    {
        public static void Run()
        {
            var filename = @"yaml2.txt";

            using var reader = File.OpenText(filename);
            var yaml = new YamlStream();
            yaml.Load(reader);

            // Examine the stream
            var mapping = (YamlMappingNode)yaml.Documents[0].RootNode;

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

            // Load the stream
        }
    }
}
