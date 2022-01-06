using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Utility.Entity
{
    public interface IReadOnlyEntity
    {
        bool IsArray { get; }
        bool IsObject { get; }
        string Query { get; }
        EntityValueType ValueType { get; }

        IAsyncEnumerable<Entity> Eval(string query, Entity evaluationParameters = null);
        Task<T> Eval<T>(string query, Entity evaluationParameters = null);
        Task<T> Eval<T>(string query, T defaultValue, Entity evaluationParameters = null);
        Task<string> EvalAsS(string query, string defaultValue = null, Entity evaluationParameters = null);
        Task<bool> EvalB(string query, Entity evaluationParameters = null);
        Task<bool> EvalB(string query, bool defaultValue, Entity evaluationParameters = null);
        Task<Dictionary<string, Entity>> EvalD(string query, Entity evaluationParameters = null, bool throwIfMissing = true);
        Task<Dictionary<string, TValue>> EvalD<TValue>(string query, Entity evaluationParameters = null, bool throwIfMissing = true);
        Task<DateTime> EvalDateTime(string query, Entity evaluationParameters = null);
        Task<DateTime?> EvalDateTime(string query, DateTime? defaultValue, Entity evaluationParameters = null);
        Task<Entity> EvalE(string query, Entity evaluationParameters = null);
        Task<Entity> EvalE(string query, Entity defaultValue, Entity evaluationParameters = null);
        Task<float> EvalF(string query, Entity evaluationParameters = null);
        Task<float> EvalF(string query, float defaultValue, Entity evaluationParameters = null);
        Task<Guid> EvalGuid(string query, Entity evaluationParameters = null);
        Task<Guid?> EvalGuid(string query, Guid? defaultValue, Entity evaluationParameters = null);
        Task<int> EvalI(string query, Entity evaluationParameters = null);
        Task<int> EvalI(string query, int defaultValue, Entity evaluationParameters = null);
        IAsyncEnumerable<Entity> EvalL(string query, Entity evaluationParameters = null);
        IAsyncEnumerable<T> EvalL<T>(string query, Entity evaluationParameters = null);
        Task<long> EvalLong(string query, Entity evaluationParameters = null);
        Task<long> EvalLong(string query, long defaultValue, Entity evaluationParameters = null);
        Task<string> EvalS(string query, Entity evaluationParameters = null);
        Task<string> EvalS(string query, string defaultValue, Entity evaluationParameters = null);
        Task<(bool found, string value)> TryEvalS(string query, Entity evaluationParameters = null);
        bool TryGetValue<T>(out T value);
        Task<(bool success, Entity entity)> TryParse(string contentType, string content);
    }
}