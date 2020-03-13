using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace UnsubLib
{
    public static class Walkaway
    {
        public static async Task ExecuteWalkaway(Func<Task> action, IList<int> delaysInMilliseconds)
        {
            var i = 0;
            while (true)
            {
                try
                {
                    await action();
                    return;
                }
                catch
                {
                    if (i == delaysInMilliseconds.Count)
                    {
                        throw;
                    }
                    await Task.Delay(delaysInMilliseconds[i++]);
                }
            }
        }

        public static async Task<T> ExecuteWalkaway<T>(Func<Task<T>> func, IList<int> delaysInMilliseconds)
        {
            var i = 0;
            while (true)
            {
                try
                {
                    return await func();
                }
                catch
                {
                    if (i == delaysInMilliseconds.Count)
                    {
                        throw;
                    }
                    await Task.Delay(delaysInMilliseconds[i++]);
                }
            }
        }
    }
}
