using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using Newtonsoft.Json.Linq;

namespace Utility
{
    public class MutationConfig
    {
        public enum MutationType
        {
            Standard, Unmutated, DoNotMutate
        }

        public MutationType Type { get; set; }

        public IEnumerable<string> JsonPropertyNames { get; set; }
    }

    public static class DynamicMutations
    {

        public static Dictionary<Type, PropertyInfo[]> KnownTypeInfo = new Dictionary<Type, PropertyInfo[]>();

        /// <summary>
        /// Tries to mutate a JToken into an instance of a static object.
        /// </summary>
        /// <param name="source">Source object</param>
        /// <param name="constructor">Factory for the target object</param>
        /// <param name="mutationConfig">Definitions for property name mapping.
        /// Key is the destination property name, use period to define mutations for collections or classes of properties.
        /// Value describe how to mutate </param>
        public static (TResult result, string[] errors) TryMutateTo<TResult>(this JObject source, Func<TResult> constructor, IDictionary<string, MutationConfig> mutationConfig) where TResult : class
        {
            PropertyInfo[] targetProperties = null;
            var result = constructor();
            var errors = new List<string>();

            if (KnownTypeInfo.ContainsKey(typeof(TResult))) targetProperties = KnownTypeInfo[typeof(TResult)];
            else
            {
                targetProperties = typeof(TResult).GetProperties(BindingFlags.Instance | BindingFlags.Public);
                KnownTypeInfo.Add(typeof(TResult), targetProperties);
            }

            var nestedConfigs = mutationConfig.Where(c => c.Key.Contains(".")).Select(c =>
            {
                var valid = true;
                var targetSplit = c.Key.Split('.', StringSplitOptions.RemoveEmptyEntries);
                var sources = c.Value.JsonPropertyNames.Select(p =>
                {
                    var spl = p.Split('.', StringSplitOptions.RemoveEmptyEntries);

                    if (spl.Length != targetSplit.Length) valid = false;

                    return new
                    {
                        root = spl.First(),
                        path = spl.Skip(1).ToArray()
                    };
                });

                if (valid)
                {
                    return new
                    {
                        targetRoot = targetSplit.First(),
                        targetPath = targetSplit.Skip(1).Join("."),
                        sources,
                        config = c.Value
                    };
                }

                errors.Add($"Mutation config for {c.Key} has unequal path parts:\r\n{c.Value.JsonPropertyNames.Join("\r\n")}");
                return null;
            })
                .Where(c => c != null)
                .GroupBy(c => c.targetRoot)
                .ToDictionary(g => g.Key, g => g.Select(c => new { c.sources, c.targetPath }));

            var propsUsed = new List<string>();

            foreach (var pi in targetProperties)
            {
                if (nestedConfigs.ContainsKey(pi.Name))
                {
                    //var conf = nestedConfigs[pi.Name];
                    //var src = conf.SelectMany(c => c.sources).First(c => source.ContainsKey(c.root));
                    //var mc = conf.ToDictionary(c=>c.targetPath,c=>new MutationConfig(){ Type = MutationConfig.MutationType.Standard, JsonPropertyNames = src.path });
                    //var tgt = null;  // this would need constructors all the way down

                    throw new NotImplementedException();
                }
                else
                {
                    MutationConfig conf = null;

                    if (mutationConfig.ContainsKey(pi.Name)) conf = mutationConfig[pi.Name];
                    else if (source.ContainsKey(pi.Name)) conf = new MutationConfig() { Type = MutationConfig.MutationType.Standard, JsonPropertyNames = new[] { pi.Name } };

                    if (conf != null)
                    {
                        var jprop = conf.JsonPropertyNames.First(source.ContainsKey);

                        if (!jprop.IsNullOrWhitespace())
                        {
                            propsUsed.Add(jprop);

                            try
                            {
                                pi.SetValue(result, source[jprop].ToObject(pi.PropertyType));
                            }
                            catch (Exception e)
                            {
                                errors.Add($"Failed to deserialize value: Source Property: {jprop} Target: {typeof(TResult).FullName}.{pi.Name} Target Type: {pi.PropertyType.FullName}\r\n{e.UnwrapForLog()}");
                            }
                        }
                    }
                }
            }

            throw new NotImplementedException();

            return (result, errors.ToArray());
        }

        public static (TResult result, string[] errors) TryMutateTo<TResult>(this JObject source, IDictionary<string, MutationConfig> mutationConfig)
            where TResult : class, new()
            => source.TryMutateTo(() => new TResult(), mutationConfig);

        public static TResult MutateTo<TResult>(this JObject source, Func<TResult> constructor, IDictionary<string, MutationConfig> mutationConfig)
            where TResult : class
        {
            var res = source.TryMutateTo(constructor, mutationConfig);

            if (res.errors.Any()) throw new Exception($"Mutation errors:\r\n{res.errors.Join("\r\n\r\n")}");

            return res.result;
        }

        public static TResult MutateTo<TResult>(this JObject source, IDictionary<string, MutationConfig> mutationConfig)
            where TResult : class, new()
        {
            var res = source.TryMutateTo(() => new TResult(), mutationConfig);

            if (res.errors.Any()) throw new Exception($"Mutation errors:\r\n{res.errors.Join("\r\n\r\n")}");

            return res.result;
        }

    }
}
