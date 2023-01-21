using System;

namespace LeetCode
{
    // BinaryTraversal is called with lambda that captures scope sA and sB - no initial state passed to BinaryTraversal since
    //  the initial state is captured in the closure
	public class FindMedianSortedArraysFunctional4
	{
        public static double FindMedianSortedArrays(int[] A, int[] B)
        {
            if (A.Length > B.Length)
                return FindMedianSortedArrays(B, A);

            var sA = new ExtendedArray<int>(A,
                            (i) => (i == -1) ? Int32.MinValue : (i == A.Length ? Int32.MaxValue : A[i]));
            var sB = new ExtendedArray<int>(B,
                            (i) => (i == -1) ? Int32.MinValue : (i == B.Length ? Int32.MaxValue : B[i]));

            dynamic st = BinaryTraversal<int>(A,
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
            Left = 0,
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
    }
}

