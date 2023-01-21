using System;

namespace LeetCode
{
    // BinaryTraversal and Median transition are now more like peers, but not quite.
    // The loop has been removed from both, and moved to the GenericTraverser,
    //   but the BinaryTraversal and Median transition have different signatures 
    public class FindMedianSortedArraysFunctional6
    {
        public static double FindMedianSortedArrays(int[] A, int[] B)
        {
            if (A.Length > B.Length)
                return FindMedianSortedArrays(B, A);

            var medianInitializer = GetMedianInitializer(A, B);

            dynamic st = GenericTraverser.Traverse<int>(A,
                BinaryTraverserInitializer, GetMedianInitializer(A, B));

            return st.median;
        }

        public static object TraverseState(object state, Direction direction)
        {
            dynamic st = state;
            return new
            {
                st.start,
                st.end,
                st.mid,
                direction
            };
        }

        // Don't like to need this function
        // Should have a way to just pass state to the initializer again - we removed it earlier, need it back
        // Also notice the <T> generic type parameter is hardcoded here as int - not good either
        // This function forces the need for the method above, TraverseState, due to no spread operator
        // I don't want this to have to keep returning all of the traversal state that it doesn't change
        // Wouldn't be too bad with a spread operator, but there is none, and even still its ugly
        //   State should be handled by each individual evaluatable
        //   How do we communicate between the evaluatables (e.g. how to pass Left, Right)?
        public static GenericTraverser.TransitionInitializer<int> GetMedianInitializer(int[] A, int[] B)
        {
            var sA = new ExtendedArray<int>(A,
                            (i) => (i == -1) ? Int32.MinValue : (i == A.Length ? Int32.MaxValue : A[i]));
            var sB = new ExtendedArray<int>(B,
                            (i) => (i == -1) ? Int32.MinValue : (i == B.Length ? Int32.MaxValue : B[i]));

            int lenA = sA.Length;
            int lenB = sB.Length;
            int lenM = lenA + lenB;
            int midM = (lenM + 1) / 2;

            return (a) =>
            {
                return (
                    (traverseState, transitionState) => {
                        dynamic traverseSt = traverseState;

                        int ia = traverseSt.mid - 1;
                        int ib = midM - ia - 2;
                        if (Math.Max(A[ia], B[ib]) <= Math.Min(A[ia + 1], B[ib + 1]))
                        {
                            if (lenM % 2 == 0)
                                return (TraverseState(traverseSt, Direction.Done),
                                        new { median = ((Math.Max(A[ia], B[ib]) + Math.Min(A[ia + 1], B[ib + 1])) / 2.0) }, true);
                            return (TraverseState(traverseSt, Direction.Done), new { median = Math.Max(A[ia], B[ib]) }, true);
                        }
                        else if (A[ia] > B[ib + 1]) return (TraverseState(traverseSt, Direction.Left), new { }, false);
                        else return (TraverseState(traverseSt, Direction.Right), new { }, false);
                    },
                    new { },
                    new { }
                );
            };
        }

        // I think I can get rid of direction and just have bool done - (how to do left, right?)
        public enum Direction
        {
            Start = 0,
            Left,
            Right,
            Done
        };

        public static (GenericTraverser.Traverser<T> traverse, object traverseState) BinaryTraverserInitializer<T>(T[] a)
        {
            return ((traverseState) =>
            {
                dynamic travSt = traverseState;
                int start = travSt.start;
                int end = travSt.end;
                bool done = true;

                if (travSt.start <= travSt.end && travSt.direction != Direction.Start)
                {
                    if (travSt.direction == Direction.Left) { end = travSt.mid - 1; done = false; }
                    else if (travSt.direction == Direction.Right) { start = travSt.mid + 1; done = false; }
                }
                return (new { start, end, mid = (start + end) / 2 }, done);
            },
            new { start = 0, end = a.Length, direction = Direction.Start });
        }

        // The traverser is applying the traversal strategy to the initialization and transition for median
        // The specific traverser itself has an initializer and a transition
        // The idea of evaluate is to call the initializer, generate the transition, call it, and then keep calling it until done
        // The Traverser is composing the BinaryTraversal with the Median algorithm.
        // Evaluating the Traverser causes evaluation of both the BinaryTraversal and the Median (in just the right way)
        //   And allows the state of the BinaryTraversal (s,e,mid) to get passed into the Median (mapped into expected inputs)
        //   The Traverser also...
        // This would be an example of how not to do evaluation since the state parameters continue to increase in number
        // Proper evaluation gives each entity its own location for it's parameters
        // This could demonstrate abstracting traversals but then show that the side effect is expansion of function sigatures
        //   which makes generic composition fail

        // Could write a version that precedes this version where the generictraverser takes a specific traverser and sends
        // the median to that traverser. That makes the traverser different from the median - the traverser takes a median.
        // Here, we are putting the traverser and the median on equal footing and letting a third entity handle the composition
        //  of the the specific traverser and the median
        // In the preceding case, the specific traverser would still be calling initialize on the median. Here, that is not the case,
        //  the third entity calls initialize on both.
        // In the preceding case, the specific traverser can run the median to completion. Here, the specific traverser has to return
        //  to the third entity on each iteration. This requires some form of yielding (state management).
        public class GenericTraverser
        {
            public delegate (Transition<T> transition, object traverseState, object transitionState) TransitionInitializer<T>(T[] a);
            public delegate (object traverseState, object transitionState, bool done)
                Transition<T>(object traverseState, object transitionState);

            public delegate (Traverser<T> traverse, object traverseState) TraverseInitializer<T>(T[] a);
            public delegate (object traverseState, bool done) Traverser<T>(object traverseState);

            public static object Traverse<T>(T[] a,
                TraverseInitializer<T> traverseInitializer,
                TransitionInitializer<T> transitionInitializer)
            {
                var travInit = traverseInitializer(a);
                var tranInit = transitionInitializer(a);
                dynamic travRet = travInit.traverseState;
                dynamic tranRet = tranInit.transitionState;
                while (true)
                {
                    travRet = travInit.traverse(travRet);
                    travRet = travRet.Item1;
                    tranRet = tranInit.transition(travRet, tranRet);
                    if (tranRet.Item3) return tranRet.Item2;
                    travRet = tranRet.Item1;
                    tranRet = tranRet.Item2;
                }
            }
        }
    }
}


