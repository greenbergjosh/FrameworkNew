using System;
namespace LeetCode
{
    // A GenericTraverser is created that accepts the BinaryTraversal as an argument
    // Note, however, that the BinaryTraversal is now different that the MedianTransition
    //  They are not peers from the perspective of the GenericTraverser
	public class FindMedianSortedArraysFunctional5
	{
        public static double FindMedianSortedArrays(int[] A, int[] B)
        {
            if (A.Length > B.Length)
                return FindMedianSortedArrays(B, A);

            var sA = new ExtendedArray<int>(A,
                            (i) => (i == -1) ? Int32.MinValue : (i == A.Length ? Int32.MaxValue : A[i]));
            var sB = new ExtendedArray<int>(B,
                            (i) => (i == -1) ? Int32.MinValue : (i == B.Length ? Int32.MaxValue : B[i]));

            dynamic st = GenericTraverser.Traverse<int>(A,
                            BinaryTraversal,
                            () => {
                                // Initial static state available to all transition function calls
                                int lenA = sA.Length;
                                int lenB = sB.Length;
                                int lenM = lenA + lenB;
                                int midM = (lenM + 1) / 2;

                                // TwoArrayMedianTransitionNew
                                return ((a, mid, start, end, state) => {
                                    int ia = mid - 1;
                                    int ib = midM - ia - 2;

                                    if (Math.Max(A[ia], B[ib]) <= Math.Min(A[ia + 1], B[ib + 1]))
                                    {
                                        if (lenM % 2 == 0)
                                            return new
                                            {
                                                direction = Direction.Done,
                                                median = ((Math.Max(A[ia], B[ib]) + Math.Min(A[ia + 1], B[ib + 1])) / 2.0)
                                            };
                                        return new { direction = Direction.Done, median = Math.Max(A[ia], B[ib]) };
                                    }
                                    else if (A[ia] > B[ib + 1]) return new { direction = Direction.Left };
                                    else return new { direction = Direction.Right };
                                },
                                // Initial state to pass to transition function
                                new object());
                            });

            return st.median;
        }

        public enum Direction
        {
            Start = 0,
            Left,
            Right,
            Done
        };

        public delegate (Func<T[], int, int, int, object, object> transition, object state) InitializerNoInitState<T>();

        public static object BinaryTraversal<T>(T[] a,
            InitializerNoInitState<T> initialize)
        {
            var init = initialize();
            dynamic st = init.state;
            int start = 0;
            int end = a.Length;
            while (start <= end)
            {
                int mid = (start + end) / 2;
                st = init.transition(a, mid, start, end, st);
                if (st.direction == Direction.Left) end = mid - 1;
                else if (st.direction == Direction.Right) start = mid + 1;
                else return st;
            }
            return st;
        }

        public class GenericTraverser
        {
            public delegate object Traverser<T>(T[] a, InitializerNoInitState<T> transitionInitializer);

            public static object Traverse<T>(T[] a,
                Traverser<T> traverser,
                InitializerNoInitState<T> transitionInitializer)
            {
                return traverser(a, transitionInitializer);
            }
        }
    }
}

