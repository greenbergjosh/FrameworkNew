using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Utility.Entity
{
    public static class Extensions
    {
        public static async Task<IEnumerable<Entity>> Where(this IEnumerable<Entity> source, Func<Entity, Task<bool>> predicate)
        {
            var found = new List<Entity>();

            foreach (var entity in source)
            {
                if (await predicate(entity))
                {
                    found.Add(entity);
                }
            }

            return found;
        }

        public static async Task<Entity> SingleOrDefault(this IEnumerable<Entity> source, Func<Entity, Task<bool>> predicate)
        {
            Entity found = default;

            foreach (var entity in source)
            {
                if (await predicate(entity))
                {
                    if (found != default)
                    {
                        return default;
                    }

                    found = default;
                }
            }

            return found;
        }
    }
}
