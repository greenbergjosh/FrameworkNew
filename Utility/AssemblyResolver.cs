using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.Loader;
using System.Reflection;
using Microsoft.Extensions.DependencyModel;
using Microsoft.Extensions.DependencyModel.Resolution;
using System.IO;
using System.Linq;
using System.Collections.Concurrent;

namespace Utility
{
    public class AssemblyResolver : IDisposable
    {
        public static object _dllCacheLock = new object();
        public static ConcurrentDictionary<string, Assembly> _dllCache 
            = new ConcurrentDictionary<string, Assembly>();
        public static ConcurrentDictionary<Tuple<string, string, string>, MethodInfo> _cache 
            = new ConcurrentDictionary<Tuple<string, string, string>, MethodInfo>(); 

        private readonly ICompilationAssemblyResolver assemblyResolver;
        private readonly DependencyContext dependencyContext;
        private readonly AssemblyLoadContext loadContext;

        public AssemblyResolver(string path)
        {
            this.Assembly = AssemblyLoadContext.Default.LoadFromAssemblyPath(path);
            this.dependencyContext = DependencyContext.Load(this.Assembly);

            this.assemblyResolver = new CompositeCompilationAssemblyResolver
                                    (new ICompilationAssemblyResolver[]
            {
            new AppBaseCompilationAssemblyResolver(Path.GetDirectoryName(path)),
            new ReferenceAssemblyPathResolver(),
            new PackageCompilationAssemblyResolver()
            });

            this.loadContext = AssemblyLoadContext.GetLoadContext(this.Assembly);
            this.loadContext.Resolving += OnResolving;
            AppDomain.CurrentDomain.AssemblyResolve += new ResolveEventHandler((object sender, ResolveEventArgs args) => ResolveAssemblyFromPath(sender, args, path));
        }


        // Modified From: https://stackoverflow.com/questions/5260404/resolve-assembly-references-from-another-folder
        public static Assembly ResolveAssemblyFromPath(object sender, ResolveEventArgs args, string assemblyPath)
        {
            try
            {
                AssemblyName referencedAssembly = Array.Find<AssemblyName>(Assembly.GetExecutingAssembly().GetReferencedAssemblies(), a => a.Name == args.Name);
                string copiedDependencyAssemblyPath = Path.Combine(new FileInfo(assemblyPath).Directory.FullName, args.Name.Substring(0, args.Name.IndexOf(",")) + ".dll");

                return referencedAssembly != null ? Assembly.LoadFrom(referencedAssembly.CodeBase) :
                       File.Exists(copiedDependencyAssemblyPath) ? Assembly.LoadFrom(copiedDependencyAssemblyPath) :
                       null;
            }
            catch (Exception)
            {
                return null;
            }
        }


        public Assembly Assembly { get; }

        public void Dispose()
        {
            this.loadContext.Resolving -= this.OnResolving;
        }

        private Assembly OnResolving(AssemblyLoadContext context, AssemblyName name)
        {
            bool NamesMatch(RuntimeLibrary runtime)
            {
                return string.Equals(runtime.Name, name.Name, StringComparison.OrdinalIgnoreCase);
            }

            RuntimeLibrary library =
                this.dependencyContext.RuntimeLibraries.FirstOrDefault(NamesMatch);
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
                this.assemblyResolver.TryResolveAssemblyPaths(wrapper, assemblies);
                if (assemblies.Count > 0)
                {
                    return this.loadContext.LoadFromAssemblyPath(assemblies[0]);
                }
            }

            return null;
        }

        public static void PrintTypes(Assembly assembly)
        {
            foreach (TypeInfo type in assembly.DefinedTypes)
            {
                Console.WriteLine(type.Name);
                foreach (PropertyInfo property in type.DeclaredProperties)
                {
                    string attributes = string.Join(
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

        public static MethodInfo GetMethod(string dllPath, string className, string methodName)
        {
            MethodInfo mi;
            var t = new Tuple<string, string, string>(dllPath, className, methodName);
            if (_cache.TryGetValue(t, out mi)) return mi;

            Assembly a;
            lock(_dllCacheLock)
            {
                a = _dllCache.GetOrAdd(dllPath, _ =>
                {
                    using (var dynamicContext = new Utility.AssemblyResolver(dllPath))
                    {
                        return dynamicContext.Assembly;
                    }
                });
            }
            
            return _cache.GetOrAdd(t, _ =>
            {
                    return a.GetType(className).GetMethod(methodName);
            });
        }
    }
}
