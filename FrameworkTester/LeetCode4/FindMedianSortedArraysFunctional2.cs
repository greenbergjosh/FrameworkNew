using System;

namespace LeetCode
{
    // Added ExtendedArray
	public class FindMedianSortedArraysFunctional2
	{
        public static double FindMedianSortedArrays(int[] A, int[] B)
        {
            if (A.Length > B.Length)
                return FindMedianSortedArrays(B, A);

            dynamic st = BinaryTraversal<int>(A,
                                              TwoArrayMedianInitialize,
                                              TwoArrayMedianTransition,
                                              new
                                              {
                                                  A = new ExtendedArray<int>(A,
                                                    (i) => (i == -1) ? Int32.MinValue : (i == A.Length ? Int32.MaxValue : A[i])),
                                                  B = new ExtendedArray<int>(B,
                                                    (i) => (i == -1) ? Int32.MinValue : (i == B.Length ? Int32.MaxValue : B[i]))
                                              });
            return st.median;
        }

        public static object TransitionState(object state, Direction direction, double median = -1)
        {
            dynamic st = state;
            return new
            {
                st.A,
                st.B,
                st.lenA,
                st.lenB,
                st.lenM,
                st.midM,
                direction,
                median
            };
        }

        public static object TwoArrayMedianInitialize(int[] a, object state)
        {
            dynamic st = state;
            return new
            {
                st.A,
                st.B,
                lenA = st.A.Length,
                lenB = st.B.Length,
                lenM = st.A.Length + st.B.Length,
                midM = (st.A.Length + st.B.Length + 1) / 2,
                direction = Direction.Done,
                median = -1
            };
        }

        public static object TwoArrayMedianTransition(int[] a, int mid, int start, int end, object state)
        {
            dynamic st = state;

            int ia = mid - 1;
            int ib = st.midM - ia - 2;

            if (Math.Max(st.A[ia], st.B[ib]) <= Math.Min(st.A[ia + 1], st.B[ib + 1]))
            {
                if (st.lenM % 2 == 0)
                    return TransitionState(state, Direction.Done,
                        (Math.Max(st.A[ia], st.B[ib]) + Math.Min(st.A[ia + 1], st.B[ib + 1])) / 2.0);
                return TransitionState(state, Direction.Done, Math.Max(st.A[ia], st.B[ib]));
            }
            else if (st.A[ia] > st.B[ib + 1]) return TransitionState(state, Direction.Left);
            else return TransitionState(state, Direction.Right);
        }

        public enum Direction
        {
            Left = 0,
            Right,
            Done
        };

        public static object BinaryTraversal<T>(T[] a,
            Func<T[], object, object> initialize,
            Func<T[], int, int, int, object, object> transition,
            object state = null)
        {
            dynamic st = initialize(a, state);
            int start = 0;
            int end = a.Length;
            while (start <= end)
            {
                int mid = (start + end) / 2;
                st = transition(a, mid, start, end, st);
                if (st.direction == Direction.Left) end = mid - 1;
                else if (st.direction == Direction.Right) start = mid + 1;
                else return st;
            }
            return st;
        }
    }
}

