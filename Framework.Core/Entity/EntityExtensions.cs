namespace Framework.Core.Entity
{
    public static class EntityExtensions
    {
        public static async Task<string> GetRequiredString(this Entity entity, string propertyName)
        {
            var (found, valueEntity) = await entity.TryGetProperty(propertyName);
            if (!found)
            {
                throw new InvalidOperationException($"Expected property {propertyName}");
            }

            var value = valueEntity.Value<string>();
            if (value == null)
            {
                throw new InvalidOperationException($"{propertyName} can not be null");
            }

            return value;
        }
    }
}
