using System;

namespace LeetCode
{
    // Median initialize returns transition function allowing closure to capture scope
	public class FindMedianSortedArraysFunctional3
	{
        public delegate object Transition<T>(T[] a, int mid, int start, int end, object state);

        public static double FindMedianSortedArrays(int[] A, int[] B)
        {
            if (A.Length > B.Length)
                return FindMedianSortedArrays(B, A);

            dynamic st = BinaryTraversal<int>(A,
                                              TwoArrayMedianInitialize,
                                              new
                                              {
                                                  A = new ExtendedArray<int>(A,
                                                    (i) => (i == -1) ? Int32.MinValue : (i == A.Length ? Int32.MaxValue : A[i])),
                                                  B = new ExtendedArray<int>(B,
                                                    (i) => (i == -1) ? Int32.MinValue : (i == B.Length ? Int32.MaxValue : B[i]))
                                              });
            return st.median;
        }

        public static (Func<int[], int, int, int, object, object> transition, object state) TwoArrayMedianInitialize(int[] a, object state)
        {
            dynamic st = state;

            ExtendedArray<int> A = st.A;
            ExtendedArray<int> B = st.B;
            int lenA = st.A.Length;
            int lenB = st.B.Length;
            int lenM = st.A.Length + st.B.Length;
            int midM = (st.A.Length + st.B.Length + 1) / 2;

            // TwoArrayMedianTransition
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
            }, new object());
        }

        

        public enum Direction
        {
            Left = 0,
            Right,
            Done
        };

        public delegate (Func<T[], int, int, int, object, object> transition, object state) Initializer<T>(T[] a, object state);

        public static object BinaryTraversal<T>(T[] a,
            Initializer<T> initialize,
            object state = null)
        {
            var init = initialize(a, state);
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

