using System;
//https://redquark.org/leetcode/0004-median-of-two-sorted-arrays/
//https://www.scaler.com/topics/median-of-two-sorted-arrays/
//https://www.geeksforgeeks.org/median-of-two-sorted-arrays-of-different-sizes/
namespace LeetCode
{
	public class FindMedianSortedArraysImperative
	{
        //Console.WriteLine($"{midM}:s={start},m={mid},e={end} - ia={ia},va={va},
        //     iap1={ia + 1},vap1={vap1},ib={ib},vb={vb},ibp1={ib + 1},vbp1={vbp1}");
        public static double FindMedianSortedArrays(int[] A, int[] B)
        {
            int lenA = A.Length;
            int lenB = B.Length;
            if (lenA > lenB)
                return FindMedianSortedArrays(B, A);

            int start = 0;
            int end = lenA;
            int midM = (lenA + lenB + 1) / 2;

            while (start <= end)
            {
                int mid = (start + end) / 2;
                int ia = mid - 1;
                int ib = midM - ia - 2;

                int va = (ia > -1) ? A[ia] : Int32.MinValue;
                int vb = (ib > -1) ? B[ib] : Int32.MinValue;
                int vap1 = (ia + 1 < lenA) ? A[ia + 1] : Int32.MaxValue;
                int vbp1 = (ib + 1 < lenB) ? B[ib + 1] : Int32.MaxValue;
                
                if (Math.Max(va, vb) <= Math.Min(vap1, vbp1))
                {
                    if ((lenB + lenA) % 2 == 0)
                        return (Math.Max(va, vb) + Math.Min(vap1, vbp1)) / 2.0;
                    return Math.Max(va, vb);
                }
                else if (va > vb) end = mid - 1;
                else start = mid + 1;
            }
            return 0.0;
        }
    }
}

