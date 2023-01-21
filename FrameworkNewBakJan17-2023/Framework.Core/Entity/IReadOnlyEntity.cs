namespace Framework.Core.Entity
{
    public interface IReadOnlyEntity
    {
        bool IsArray { get; }
        bool IsObject { get; }
        string? Query { get; }
        EntityValueType ValueType { get; }
    }
}