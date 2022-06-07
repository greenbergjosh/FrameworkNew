namespace Framework.Core.Entity
{
    public static class EntityExtensions
    {
        public static Task<string> GetRequiredString(this Entity entity, string propertyName) => GetRequiredString(entity, propertyName, Entity.Undefined);

        public static async Task<string> GetRequiredString(this Entity entity, string propertyName, Entity parameters)
        {
            var (found, valueEntity) = await entity.TryGetProperty(propertyName, parameters);
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
