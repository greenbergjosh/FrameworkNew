using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Utility.Entity
{
    public static class EntityExtensions
    {
        public static async IAsyncEnumerable<Entity> Eval(this Task<Entity> entity, string query, Entity evaluationParameters = null)
        {
            await foreach (var child in (await entity).Eval(query, evaluationParameters))
            {
                yield return child;
            }
        }

        public static async Task<T> Eval<T>(this Task<Entity> entity, string query, Entity evaluationParameters = null) => await (await entity).Eval<T>(query, evaluationParameters);

        public static async Task<T> Eval<T>(this Task<Entity> entity, string query, T defaultValue, Entity evaluationParameters = null) => await (await entity).Eval<T>(query, defaultValue, evaluationParameters);

        public static async Task<string> EvalAsS(this Task<Entity> entity, string query, string defaultValue = null, Entity evaluationParameters = null) => await (await entity).EvalAsS(query, defaultValue, evaluationParameters);

        public static async Task<bool> EvalB(this Task<Entity> entity, string query, bool defaultValue, Entity evaluationParameters = null) => await (await entity).EvalB(query, defaultValue, evaluationParameters);

        public static async Task<bool> EvalB(this Task<Entity> entity, string query, Entity evaluationParameters = null) => await (await entity).EvalB(query, evaluationParameters);

        public static async Task<Dictionary<string, Entity>> EvalD(this Task<Entity> entity, string query, Entity evaluationParameters = null, bool throwIfMissing = true) => await (await entity).EvalD(query, evaluationParameters, throwIfMissing);

        public static async Task<Dictionary<string, TValue>> EvalD<TValue>(this Task<Entity> entity, string query, Entity evaluationParameters = null, bool throwIfMissing = true) => await (await entity).EvalD<TValue>(query, evaluationParameters, throwIfMissing);

        public static async Task<DateTime?> EvalDateTime(this Task<Entity> entity, string query, DateTime? defaultValue, Entity evaluationParameters = null) => await (await entity).EvalDateTime(query, defaultValue, evaluationParameters);

        public static async Task<DateTime> EvalDateTime(this Task<Entity> entity, string query, Entity evaluationParameters = null) => await (await entity).EvalDateTime(query, evaluationParameters);

        public static async Task<Entity> EvalE(this Task<Entity> entity, string query, Entity defaultValue, Entity evaluationParameters = null) => await (await entity).EvalE(query, defaultValue, evaluationParameters);

        public static async Task<Entity> EvalE(this Task<Entity> entity, string query, Entity evaluationParameters = null) => await (await entity).EvalE(query, evaluationParameters);

        public static async Task<float> EvalF(this Task<Entity> entity, string query, Entity evaluationParameters = null) => await (await entity).EvalF(query, evaluationParameters);

        public static async Task<float> EvalF(this Task<Entity> entity, string query, float defaultValue, Entity evaluationParameters = null) => await (await entity).EvalF(query, defaultValue, evaluationParameters);

        public static async Task<Guid> EvalGuid(this Task<Entity> entity, string query, Entity evaluationParameters = null) => await (await entity).EvalGuid(query, evaluationParameters);

        public static async Task<Guid?> EvalGuid(this Task<Entity> entity, string query, Guid? defaultValue, Entity evaluationParameters = null) => await (await entity).EvalGuid(query, defaultValue, evaluationParameters);

        public static async Task<int> EvalI(this Task<Entity> entity, string query, Entity evaluationParameters = null) => await (await entity).EvalI(query, evaluationParameters);

        public static async Task<int> EvalI(this Task<Entity> entity, string query, int defaultValue, Entity evaluationParameters = null) => await (await entity).EvalI(query, defaultValue, evaluationParameters);

        public static async IAsyncEnumerable<Entity> EvalL(this Task<Entity> entity, string query, Entity evaluationParameters = null)
        {
            await foreach (var child in (await entity).EvalL(query, evaluationParameters))
            {
                yield return child;
            }
        }

        public static async IAsyncEnumerable<T> EvalL<T>(this Task<Entity> entity, string query, Entity evaluationParameters = null)
        {
            await foreach (var child in (await entity).EvalL<T>(query, evaluationParameters))
            {
                yield return child;
            }
        }

        public static async Task<long> EvalLong(this Task<Entity> entity, string query, Entity evaluationParameters = null) => await (await entity).EvalLong(query, evaluationParameters);

        public static async Task<long> EvalLong(this Task<Entity> entity, string query, long defaultValue, Entity evaluationParameters = null) => await (await entity).EvalLong(query, defaultValue, evaluationParameters);

        public static async Task<string> EvalS(this Task<Entity> entity, string query, Entity evaluationParameters = null) => await (await entity).EvalS(query, evaluationParameters);

        public static async Task<string> EvalS(this Task<Entity> entity, string query, string defaultValue, Entity evaluationParameters = null) => await (await entity).EvalS(query, defaultValue, evaluationParameters);
    }
}
