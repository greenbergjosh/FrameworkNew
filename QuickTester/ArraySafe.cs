namespace QuickTester
{
    public static class ArraySafe
    {
        public static T GetElementOrDefault<T>(this T[] array, int index, T defaultVal)
        {
            if (array == null || index < 0 || index >= array.Length)
            {
                return defaultVal;
            }

            return array[index];
        }
    }
}
