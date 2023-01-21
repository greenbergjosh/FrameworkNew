using System;

using Framework.Core.Entity;
using Framework.Core.Entity.Implementations;
using Framework.Core.Evaluatable;
using Framework.Core.Evaluatable.EvalProviders;
using Framework.Core.Evaluatable.MemoryProviders;
using System.Diagnostics;
using System.Text.Json;

namespace LeetCode
{
    //public class FindMedianSortedArraysFunctional7
    //{
    //    // The next iteration is putting a meme in place and letting evaluatables store state in the meme
    //    // Create a closure dynamically by capturing variables from a generated outer scope. The variables
    //    //   will be exactly those variables mapped from the global state. This should allow a single transition
    //    //   function that does init and generates the actual transition function by capturing the scope from
    //    //   the init.
    //    //  This lets us recover the beauty of the closure generated init and transition, but still eliminate the
    //    //   loop and maintain composability for the Traverser.
    //    public static async Task<double> FindMedianSortedArrays(int[] A, int[] B)
    //    {
    //        if (A.Length > B.Length)
    //            return await FindMedianSortedArrays(B, A);

    //        // var m = new Meme(); // place A and B in scope
    //        dynamic meme = await _entity["config://37aba1f7-fc25-418c-b0b3-a08d53058d74"];

    //        // Evaluate config entity that defines binding between median and traversal
    //        // Here, the config entity is just known - not exposing it outside of this method (e.g. as web endpoint)

    //        return st.median;
    //    }

    //}

    //// The GenericTraverser becomes the evaluator
    //// The connection between the median and the traversal must be declared (config)
    ////   This connection can be a third object - it is this third object that is initially evaluated by the evaluator
    ////   The third object may just be config and its evalaution delegates to the other two code objects
    ////
    //// Need to create example of running Roslyn from a file
    //// Need to create example of evaluating a config and a code
    //// Need to create example of using global state to build and compile a closure so init scope and global scope get captured
    ////   in the transition method and so that the transition method gets called the first, and subsequent times
    //public class Evaluator
    //{
    //    public static object Evaluate<T>(Guid entityId, Meme meme)
    //    {
    //        while (evaluate)
    //        {

    //        }
    //    }
    //}

    //public class Meme
    //{
    //    public Dictionary<string, object> state = new();
    //    public Meme() { }
    //}
}

