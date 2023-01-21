namespace Framework.Core.Entity
{
    public static class EntityExtensions
    {
        public static Task<string> GetRequiredString(this Entity entity, string propertyName) => entity.GetPropertyValue<string>(propertyName, Entity.Undefined);

        public static Task<string> GetRequiredString(this Entity entity, string propertyName, Entity parameters) => entity.GetPropertyValue<string>(propertyName, parameters);

        public static Task<T?> GetOrDefault<T>(this Entity entity, string propertyName, T? defaultValue = default) => GetOrDefault(entity, propertyName, Entity.Undefined, defaultValue);

        public static async Task<T?> GetOrDefault<T>(this Entity entity, string propertyName, Entity parameters, T? defaultValue = default)
        {
            var (found, value) = await entity.TryGetProperty(propertyName, parameters);
            if (!found)
            {
                return defaultValue;
            }

            return value.Value<T>();
        }

        public static Task<T> GetOrDefaultCoalesce<T>(this Entity entity, string propertyName, T defaultValue) => GetOrDefaultCoalesce(entity, propertyName, Entity.Undefined, defaultValue);

        public static async Task<T> GetOrDefaultCoalesce<T>(this Entity entity, string propertyName, Entity parameters, T defaultValue)
        {
            var (found, propertyValue) = await entity.TryGetProperty(propertyName, parameters);
            if (!found)
            {
                return defaultValue;
            }

            var value = propertyValue.Value<T>();
            return value ?? defaultValue;
        }
    }
}
