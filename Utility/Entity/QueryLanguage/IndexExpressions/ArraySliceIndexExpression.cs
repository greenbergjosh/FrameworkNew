using System;
using System.Collections.Generic;
using System.Text;

namespace Utility.Entity.QueryLanguage.IndexExpressions
{
    internal sealed class ArraySliceIndexExpression : IArrayIndexExpression
    {
        private readonly Range _range;
        private readonly int _step;

        private ArraySliceIndexExpression(Range range, int step = 1)
        {
            _range = range;
            _step = step;
        }

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        public async IAsyncEnumerable<int> GetIndexes(Entity entity)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            if (_step == 0)
            {
                yield break;
            }

            var arrayLength = entity.Document.Length;

            var startUnspecified = _range.Start.IsFromEnd && _range.Start.Value == 0;
            var start = startUnspecified ? (int?)null : _range.Start.Value * (_range.Start.IsFromEnd ? -1 : 1);

            var endUnspecified = _range.End.IsFromEnd && _range.End.Value == 0;
            var end = endUnspecified ? (int?)null : _range.End.Value * (_range.End.IsFromEnd ? -1 : 1);

            var (lower, upper) = Bounds(start, end, _step, arrayLength);

            if (_step > 0)
            {
                var i = lower ?? 0;
                upper ??= arrayLength;

                while (i < upper)
                {
                    yield return i;
                    i += _step;
                }
            }
            else
            {
                var i = upper ?? arrayLength - 1;
                lower ??= -1;

                while (lower < i)
                {
                    yield return i;
                    i += _step;
                }
            }
        }

        private static int? Normalize(int? index, int length) => index >= 0 ? index : length + index;

        private static (int?, int?) Bounds(int? start, int? end, int? step, int length)
        {
            var startIndex = Normalize(start, length);
            var endIndex = Normalize(end, length);

            int? lower, upper;

            if (step >= 0)
            {
                lower = startIndex.HasValue ? Math.Min(Math.Max(startIndex.Value, 0), length) : null;
                upper = endIndex.HasValue ? Math.Min(Math.Max(endIndex.Value, 0), length) : null;
            }
            else
            {
                upper = startIndex.HasValue ? Math.Min(Math.Max(startIndex.Value, -1), length - 1) : null;
                lower = endIndex.HasValue ? Math.Min(Math.Max(endIndex.Value, -1), length - 1) : null;
            }

            return (lower, upper);
        }

        internal static bool TryParse(ReadOnlySpan<char> query, ref int index, out IIndexExpression arraySliceIndex)
        {
            var start = Index.End;
            var end = Index.End;

            if (Helpers.TryGetInt(query, ref index, out var v))
            {
                start = new Index(Math.Abs(v), v < 0);
            }

            if (query[index] != ':')
            {
                index = -1;
                arraySliceIndex = null;
                return false;
            }

            index++;

            if (Helpers.TryGetInt(query, ref index, out v))
            {
                end = new Index(Math.Abs(v), v < 0);
            }

            if (query[index] != ':')
            {
                arraySliceIndex = new ArraySliceIndexExpression(start..end);
                return true;
            }

            index++;

            if (!Helpers.TryGetInt(query, ref index, out v))
            {
                arraySliceIndex = new ArraySliceIndexExpression(start..end);
                return true;
            }

            arraySliceIndex = new ArraySliceIndexExpression(start..end, v);
            return true;
        }

        public override string ToString()
        {
            var sb = new StringBuilder();
            if (!_range.Start.Equals(Index.End))
            {
                _ = sb.Append(IArrayIndexExpression.IndexToPath(_range.Start));
            }

            _ = sb.Append(':');
            if (!_range.End.Equals(Index.End))
            {
                _ = sb.Append(IArrayIndexExpression.IndexToPath(_range.End));
            }

            if (_step != 1)
            {
                _ = sb.Append(':');
                _ = sb.Append(_step);
            }

            return sb.ToString();
        }
    }
}
