using System;
using System.Collections.Generic;
using System.Runtime.Loader;
using System.Reflection;
using Microsoft.Extensions.DependencyModel;
using Microsoft.Extensions.DependencyModel.Resolution;
using System.Collections.Concurrent;
using System.IO;
using System.Linq;

namespace Utility
{
    public class AssemblyResolver : IDisposable
    {
        private static readonly object _dllCacheLock = new object();
        private static readonly ConcurrentDictionary<string, Assembly> _dllCache = new ConcurrentDictionary<string, Assembly>();
        private static readonly ConcurrentDictionary<Tuple<string, string, string>, MethodInfo> _cache = new ConcurrentDictionary<Tuple<string, string, string>, MethodInfo>();

        private readonly ICompilationAssemblyResolver assemblyResolver;
        private readonly DependencyContext dependencyContext;
        private readonly AssemblyLoadContext loadContext;

        public AssemblyResolver(string path, IEnumerable<string> additionalAssemblyPaths)
        {
            path = Path.GetFullPath(path);
            Assembly = AssemblyLoadContext.Default.LoadFromAssemblyPath(path);
            dependencyContext = DependencyContext.Load(Assembly);

            assemblyResolver = new CompositeCompilationAssemblyResolver
                                    (new ICompilationAssemblyResolver[]
            {
            new AppBaseCompilationAssemblyResolver(Path.GetDirectoryName(path)),
            new ReferenceAssemblyPathResolver(),
            new PackageCompilationAssemblyResolver()
            });

            loadContext = AssemblyLoadContext.GetLoadContext(Assembly);
            loadContext.Resolving += OnResolving;
            var assemblyDirs = new List<DirectoryInfo> { new FileInfo(path).Directory };

            if (additionalAssemblyPaths?.Any() == true)
            {
                assemblyDirs.AddRange(additionalAssemblyPaths.Select(p =>
                {
                    try { return new DirectoryInfo(Path.GetFullPath(p)); }
                    catch (Exception) { return null; }
                }).Where(p => p != null));
            }

            AppDomain.CurrentDomain.AssemblyResolve += (_, args) => ResolveAssemblyFromPath(args, assemblyDirs);
        }


        // Modified From: https://stackoverflow.com/questions/5260404/resolve-assembly-references-from-another-folder
        private static Assembly ResolveAssemblyFromPath(ResolveEventArgs args, IEnumerable<DirectoryInfo> assemblyDirs)
        {
            try
            {
                var referencedAssembly = Array.Find(Assembly.GetExecutingAssembly().GetReferencedAssemblies(), a => a.Name == args.Name);

                if (referencedAssembly != null) return Assembly.LoadFrom(referencedAssembly.CodeBase);

                var libFileName = args.Name.Substring(0, args.Name.IndexOf(",")) + ".dll";

                foreach (var d in assemblyDirs)
                {
                    try
                    {
                        var copiedDependencyAssemblyPath = Path.Combine(d.FullName, libFileName);

                        if (File.Exists(copiedDependencyAssemblyPath)) return Assembly.LoadFrom(copiedDependencyAssemblyPath);
                    }
                    catch
                    {
                    }
                }

                return null;
            }
            catch (Exception)
            {
                return null;
            }
        }


        public Assembly Assembly { get; }

        public void Dispose()
        {
            loadContext.Resolving -= OnResolving;
            GC.SuppressFinalize(this);
        }

        private Assembly OnResolving(AssemblyLoadContext context, AssemblyName name)
        {
            bool NamesMatch(RuntimeLibrary runtime)
            {
                return string.Equals(runtime.Name, name.Name, StringComparison.OrdinalIgnoreCase);
            }

            var library =
                dependencyContext.RuntimeLibraries.FirstOrDefault(NamesMatch);
            if (library != null)
            {
                var wrapper = new CompilationLibrary(
                    library.Type,
                    library.Name,
                    library.Version,
                    library.Hash,
                    library.RuntimeAssemblyGroups.SelectMany(g => g.AssetPaths),
                    library.Dependencies,
                    library.Serviceable);

                var assemblies = new List<string>();
                assemblyResolver.TryResolveAssemblyPaths(wrapper, assemblies);
                if (assemblies.Count > 0)
                {
                    return loadContext.LoadFromAssemblyPath(assemblies[0]);
                }
            }

            return null;
        }

        public static void PrintTypes(Assembly assembly)
        {
            foreach (var type in assembly.DefinedTypes)
            {
                Console.WriteLine(type.Name);
                foreach (var property in type.DeclaredProperties)
                {
                    var attributes = string.Join(
                        ", ",
                        property.CustomAttributes.Select(a => a.AttributeType.Name));

                    if (!string.IsNullOrEmpty(attributes))
                    {
                        Console.WriteLine("    [{0}]", attributes);
                    }
                    Console.WriteLine("    {0} {1}", property.PropertyType.Name, property.Name);
                }
            }
        }

        public static MethodInfo GetMethod(string dllPath, string className, string methodName, IEnumerable<string> assemblyPaths)
        {
            var t = new Tuple<string, string, string>(dllPath, className, methodName);
            if (_cache.TryGetValue(t, out var mi)) return mi;

            Assembly a;
            lock (_dllCacheLock)
            {
                a = _dllCache.GetOrAdd(dllPath, _ =>
                {
                    using var dynamicContext = new AssemblyResolver(dllPath, assemblyPaths);
                    return dynamicContext.Assembly;
                });
            }

            return _cache.GetOrAdd(t, _ =>
            {
                return a.GetType(className).GetMethod(methodName);
            });
        }
    }
}
