using System;
namespace LeetCode
{
    public class ExtendedArray<T>
    {
        public T[] a;
        public Func<int, T> f = null;
        public ExtendedArray(T[] a, Func<int, T> f) { this.a = a; this.f = f; }
        public T this[int index] => (index >= 0 && index < a.Length)
            ? a[index]
            : f(index);
        public int Length { get => a.Length; }
    }
}

