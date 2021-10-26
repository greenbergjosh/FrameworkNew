using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace QuickTester
{
    public static class LinqToTreeExtensions
    {
        #region primary Linq methods

        /// <summary>
        /// Returns a collection of descendant elements.
        /// </summary>
        public static IEnumerable<ILinqToTree<T>> Descendants<T>(this ILinqToTree<T> adapter)
        {
            foreach (var child in adapter.Children())
            {
                yield return child;

                foreach (var grandChild in child.Descendants())
                {
                    yield return grandChild;
                }
            }
        }

        /// <summary>
        /// Returns a collection of ancestor elements.
        /// </summary>
        public static IEnumerable<ILinqToTree<T>> Ancestors<T>(this ILinqToTree<T> adapter)
        {
            var parent = adapter.Parent;
            while (parent != null)
            {
                yield return parent;
                parent = parent.Parent;
            }
        }

        /// <summary>
        /// Returns a collection of child elements.
        /// </summary>
        public static IEnumerable<ILinqToTree<T>> Elements<T>(this ILinqToTree<T> adapter)
        {
            foreach (var child in adapter.Children())
            {
                yield return child;
            }
        }

        #endregion

        #region 'AndSelf' implementations

        /// <summary>
        /// Returns a collection containing this element and all child elements.
        /// </summary>
        public static IEnumerable<ILinqToTree<T>> ElementsAndSelf<T>(this ILinqToTree<T> adapter)
        {
            yield return adapter;

            foreach (var child in adapter.Elements())
            {
                yield return child;
            }
        }

        /// <summary>
        /// Returns a collection of ancestor elements.
        /// </summary>
        public static IEnumerable<ILinqToTree<T>> AncestorsAndSelf<T>(this ILinqToTree<T> adapter)
        {

            yield return adapter;

            foreach (var child in adapter.Ancestors())
            {
                yield return child;
            }
        }

        /// <summary>
        /// Returns a collection containing this element and all descendant elements.
        /// </summary>
        public static IEnumerable<ILinqToTree<T>> DescendantsAndSelf<T>(this ILinqToTree<T> adapter)
        {
            yield return adapter;

            foreach (var child in adapter.Descendants())
            {
                yield return child;
            }
        }

        #endregion

        #region Method which take type parameters

        /// <summary>
        /// Returns a collection of descendant elements.
        /// </summary>
        public static IEnumerable<ILinqToTree<T>> Descendants<T, K>(this ILinqToTree<T> adapter) => adapter.Descendants().Where(i => i.Item is K);


        #endregion
    }
    public static class LinqToTreeEnumerableExtensions
    {
        /// <summary>
        /// Applies the given function to each of the items in the supplied
        /// IEnumerable.
        /// </summary>
        private static IEnumerable<ILinqToTree<T>> DrillDown<T>(this IEnumerable<ILinqToTree<T>> items,
            Func<ILinqToTree<T>, IEnumerable<ILinqToTree<T>>> function)
        {
            foreach (var item in items)
            {
                foreach (ILinqToTree<T> itemChild in function(item))
                {
                    yield return itemChild;
                }
            }
        }

        /// <summary>
        /// Returns a collection of descendant elements.
        /// </summary>
        public static IEnumerable<ILinqToTree<T>> Descendants<T>(this IEnumerable<ILinqToTree<T>> items) => items.DrillDown(i => i.Descendants());

        /// <summary>
        /// Returns a collection containing this element and all descendant elements.
        /// </summary>
        public static IEnumerable<ILinqToTree<T>> DescendantsAndSelf<T>(this IEnumerable<ILinqToTree<T>> items) => items.DrillDown(i => i.DescendantsAndSelf());

        /// <summary>
        /// Returns a collection of ancestor elements.
        /// </summary>
        public static IEnumerable<ILinqToTree<T>> Ancestors<T>(this IEnumerable<ILinqToTree<T>> items) => items.DrillDown(i => i.Ancestors());

        /// <summary>
        /// Returns a collection containing this element and all ancestor elements.
        /// </summary>
        public static IEnumerable<ILinqToTree<T>> AncestorsAndSelf<T>(this IEnumerable<ILinqToTree<T>> items) => items.DrillDown(i => i.AncestorsAndSelf());

        /// <summary>
        /// Returns a collection of child elements.
        /// </summary>
        public static IEnumerable<ILinqToTree<T>> Elements<T>(this IEnumerable<ILinqToTree<T>> items) => items.DrillDown(i => i.Elements());

        /// <summary>
        /// Returns a collection containing this element and all child elements.
        /// </summary>
        public static IEnumerable<ILinqToTree<T>> ElementsAndSelf<T>(this IEnumerable<ILinqToTree<T>> items) => items.DrillDown(i => i.ElementsAndSelf());

    }
    public interface ILinqToTree<T>
    {
        /// <summary>
        /// Obtains all the children of the Item.
        /// </summary>
        /// <returns></returns>
        IEnumerable<ILinqToTree<T>> Children();

        /// <summary>
        /// The parent of the Item.
        /// </summary>
        ILinqToTree<T> Parent { get; }

        /// <summary>
        /// The item being adapted.
        /// </summary>
        T Item { get; }
    }

    public interface ILinqTree<T>
    {
        IEnumerable<T> Children();

        T Parent { get; }
    }

    public static class TreeExtensions
    {
        /// <summary>
        /// Returns a collection of descendant elements.
        /// </summary>
	    public static IEnumerable<DirectoryInfo> Descendants(this DirectoryInfo item)
        {
            ILinqTree<DirectoryInfo> adapter = new FileSystemTreeAdapter(item);
            foreach (var child in adapter.Children())
            {
                yield return child;

                foreach (var grandChild in child.Descendants())
                {
                    yield return grandChild;
                }
            }
        }

        /// <summary>
        /// Returns a collection containing this element and all descendant elements.
        /// </summary>
        public static IEnumerable<DirectoryInfo> DescendantsAndSelf(this DirectoryInfo item)
        {
            yield return item;

            foreach (var child in item.Descendants())
            {
                yield return child;
            }
        }

        /// <summary>
        /// Returns a collection of ancestor elements.
        /// </summary>
        public static IEnumerable<DirectoryInfo> Ancestors(this DirectoryInfo item)
        {
            ILinqTree<DirectoryInfo> adapter = new FileSystemTreeAdapter(item);

            var parent = adapter.Parent;
            while (parent != null)
            {
                yield return parent;
                adapter = new FileSystemTreeAdapter(parent);
                parent = adapter.Parent;
            }
        }

        /// <summary>
        /// Returns a collection containing this element and all ancestor elements.
        /// </summary>
        public static IEnumerable<DirectoryInfo> AncestorsAndSelf(this DirectoryInfo item)
        {
            yield return item;

            foreach (var ancestor in item.Ancestors())
            {
                yield return ancestor;
            }
        }

        /// <summary>
        /// Returns a collection of child elements.
        /// </summary>
        public static IEnumerable<DirectoryInfo> Elements(this DirectoryInfo item)
        {
            ILinqTree<DirectoryInfo> adapter = new FileSystemTreeAdapter(item);
            foreach (var child in adapter.Children())
            {
                yield return child;
            }
        }

        /// <summary>
        /// Returns a collection of the sibling elements before this node, in document order.
        /// </summary>
        public static IEnumerable<DirectoryInfo> ElementsBeforeSelf(this DirectoryInfo item)
        {
            if (item.Ancestors().FirstOrDefault() == null)
                yield break;
            foreach (var child in item.Ancestors().First().Elements())
            {
                if (child.FullName == item.FullName)
                    break;
                yield return child;
            }
        }

        /// <summary>
        /// Returns a collection of the elements after this node, in document order.
        /// </summary>
        public static IEnumerable<DirectoryInfo> ElementsAfterSelf(this DirectoryInfo item)
        {
            if (item.Ancestors().FirstOrDefault() == null)
                yield break;
            bool afterSelf = false;
            foreach (var child in item.Ancestors().First().Elements())
            {
                if (afterSelf)
                    yield return child;

                if (child.FullName == item.FullName)
                    afterSelf = true;
            }
        }

        /// <summary>
        /// Returns a collection containing this element and all child elements.
        /// </summary>
        public static IEnumerable<DirectoryInfo> ElementsAndSelf(this DirectoryInfo item)
        {
            yield return item;

            foreach (var child in item.Elements())
            {
                yield return child;
            }
        }

        /// <summary>
        /// Returns a collection of descendant elements which match the given type.
        /// </summary>
        public static IEnumerable<DirectoryInfo> Descendants<T>(this DirectoryInfo item) => item.Descendants().Where(i => i is T).Cast<DirectoryInfo>();



        /// <summary>
        /// Returns a collection of the sibling elements before this node, in document order
        /// which match the given type.
        /// </summary>
        public static IEnumerable<DirectoryInfo> ElementsBeforeSelf<T>(this DirectoryInfo item) => item.ElementsBeforeSelf().Where(i => i is T).Cast<DirectoryInfo>();

        /// <summary>
        /// Returns a collection of the after elements after this node, in document order
        /// which match the given type.
        /// </summary>
        public static IEnumerable<DirectoryInfo> ElementsAfterSelf<T>(this DirectoryInfo item) => item.ElementsAfterSelf().Where(i => i is T).Cast<DirectoryInfo>();

        /// <summary>
        /// Returns a collection containing this element and all descendant elements
        /// which match the given type.
        /// </summary>
	    public static IEnumerable<DirectoryInfo> DescendantsAndSelf<T>(this DirectoryInfo item) => item.DescendantsAndSelf().Where(i => i is T).Cast<DirectoryInfo>();

        /// <summary>
        /// Returns a collection of ancestor elements which match the given type.
        /// </summary>
        public static IEnumerable<DirectoryInfo> Ancestors<T>(this DirectoryInfo item) => item.Ancestors().Where(i => i is T).Cast<DirectoryInfo>();

        /// <summary>
        /// Returns a collection containing this element and all ancestor elements
        /// which match the given type.
        /// </summary>
        public static IEnumerable<DirectoryInfo> AncestorsAndSelf<T>(this DirectoryInfo item) => item.AncestorsAndSelf().Where(i => i is T).Cast<DirectoryInfo>();

        /// <summary>
        /// Returns a collection of child elements which match the given type.
        /// </summary>
        public static IEnumerable<DirectoryInfo> Elements<T>(this DirectoryInfo item) => item.Elements().Where(i => i is T).Cast<DirectoryInfo>();

        /// <summary>
        /// Returns a collection containing this element and all child elements.
        /// which match the given type.
        /// </summary>
        public static IEnumerable<DirectoryInfo> ElementsAndSelf<T>(this DirectoryInfo item) => item.ElementsAndSelf().Where(i => i is T).Cast<DirectoryInfo>();
    }

    public static class EnumerableTreeExtensions
    {
        /// <summary>
        /// Applies the given function to each of the items in the supplied
        /// IEnumerable.
        /// </summary>
        private static IEnumerable<DirectoryInfo> DrillDown(this IEnumerable<DirectoryInfo> items,
            Func<DirectoryInfo, IEnumerable<DirectoryInfo>> function)
        {
            foreach (var item in items)
            {
                foreach (var itemChild in function(item))
                {
                    yield return itemChild;
                }
            }
        }




        /// <summary>
        /// Returns a collection of descendant elements.
        /// </summary>
        public static IEnumerable<DirectoryInfo> Descendants(this IEnumerable<DirectoryInfo> items) => items.DrillDown(i => i.Descendants());

        /// <summary>
        /// Returns a collection containing this element and all descendant elements.
        /// </summary>
        public static IEnumerable<DirectoryInfo> DescendantsAndSelf(this IEnumerable<DirectoryInfo> items) => items.DrillDown(i => i.DescendantsAndSelf());

        /// <summary>
        /// Returns a collection of ancestor elements.
        /// </summary>
        public static IEnumerable<DirectoryInfo> Ancestors(this IEnumerable<DirectoryInfo> items) => items.DrillDown(i => i.Ancestors());

        /// <summary>
        /// Returns a collection containing this element and all ancestor elements.
        /// </summary>
        public static IEnumerable<DirectoryInfo> AncestorsAndSelf(this IEnumerable<DirectoryInfo> items) => items.DrillDown(i => i.AncestorsAndSelf());

        /// <summary>
        /// Returns a collection of child elements.
        /// </summary>
        public static IEnumerable<DirectoryInfo> Elements(this IEnumerable<DirectoryInfo> items) => items.DrillDown(i => i.Elements());

        /// <summary>
        /// Returns a collection containing this element and all child elements.
        /// </summary>
        public static IEnumerable<DirectoryInfo> ElementsAndSelf(this IEnumerable<DirectoryInfo> items) => items.DrillDown(i => i.ElementsAndSelf());

    }
    public static class DirectoryInfoExtensions
    {
        /// <summary>
        /// An enumeration of files within a directory.
        /// </summary>
        /// <param name="dir"></param>
        /// <returns></returns>
        public static IEnumerable<FileInfo> Files(this DirectoryInfo dir) => dir.GetFiles().AsEnumerable();
    }

    /// <summary>
    /// Adapts a DirectoryInfo to provide methods required for generate
    /// a Linq To Tree API
    /// </summary>
    internal class FileSystemTreeAdapter : ILinqTree<DirectoryInfo>
    {
        private readonly DirectoryInfo _dir;

        public FileSystemTreeAdapter(DirectoryInfo dir) => _dir = dir;

        public IEnumerable<DirectoryInfo> Children()
        {
            DirectoryInfo[] dirs = null;
            try
            {
                dirs = _dir.GetDirectories();
            }
            catch (Exception)
            { }

            if (dirs == null)
            {
                yield break;
            }
            else
            {
                foreach (var item in dirs)
                    yield return item;
            }
        }

        public DirectoryInfo Parent => _dir.Parent;

    }

    internal class LinqToFilesystem
    {
        public static void Test()
        {
            var dir = new DirectoryInfo(@"C:\Users\green\Downloads");

            //var dirsWithTXT =
            //    from d in dir.Descendants().Where(d => true).Descendants()
            //    let xmlCount = d.Files().Where(i => i.Extension == ".txt").Count()
            //    where xmlCount > 0
            //    select new { Directory = d, XmlCount = xmlCount };

            //foreach (var d in dirsWithTXT)
            //{
            //    Console.WriteLine($"{d.Directory.FullName} {d.XmlCount}");
            //}

            var dirsWithTXT =
                dir.Descendants().SelectMany(d => d.Files().Where(i => i.Extension == ".txt"));

            foreach (var d in dirsWithTXT)
            {
                Console.WriteLine($"{d.Name}");
            }

            //// output a tree!
            //string tree = dir.DescendantsAndSelf().Aggregate("",
            //    (bc, n) => bc + n.Ancestors().Aggregate("", (ac, m) => (m.ElementsAfterSelf().Any() ? "| " : "  ") + ac,
            //    ac => ac + (n.ElementsAfterSelf().Any() ? "+-" : "\\-")) + n.Name + "\n");

            //Console.WriteLine(tree);


            //// find all directories that contain projects checked into SVN
            //var dirs = dir.Descendants()
            //              .Where(d => d.Elements().Any(i => i.Name == ".svn"))
            //              .Where(d => !d.Ancestors().FirstOrDefault().Elements().Any(i => i.Name == ".svn"));

            //foreach (var d in dirs)
            //{
            //    Console.WriteLine(d.FullName);
            //}


            //// find all directories that contain XML files, and output
            //// the number of XML files they contain.            
            //var dirsWithXML =
            //    from d in dir.Descendants().Where(d => d.Name == "bin").Descendants()
            //    let xmlCount = d.Files().Where(i => i.Extension == ".xml").Count()
            //    where xmlCount > 0
            //    select new { Directory = d, XmlCount = xmlCount };


            //foreach (var d in dirsWithXML)
            //{
            //    Console.WriteLine(d.Directory.FullName + " [" + d.XmlCount + "]");
            //}

        }
    }
}
