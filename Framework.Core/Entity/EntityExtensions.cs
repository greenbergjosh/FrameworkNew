namespace Framework.Core.Entity
{
    public static class EntityExtensions
    {
        public static Task<T> GetRequired<T>(this Entity entity, string propertyName) => GetRequired<T>(entity, propertyName, Entity.Undefined);

        public static async Task<T> GetRequired<T>(this Entity entity, string propertyName, Entity parameters)
        {
            var valueEntity = await GetRequiredProperty(entity, propertyName, parameters);

            var value = valueEntity.Value<T>();
            if (value == null)
            {
                throw new InvalidOperationException($"{propertyName} can not be null");
            }

            return value;
        }

        public static Task<string> GetRequiredString(this Entity entity, string propertyName) => GetRequired<string>(entity, propertyName, Entity.Undefined);

        public static Task<string> GetRequiredString(this Entity entity, string propertyName, Entity parameters) => GetRequired<string>(entity, propertyName, parameters);

        public static Task<Entity> GetRequiredProperty(this Entity entity, string propertyName) => GetRequiredProperty(entity, propertyName, Entity.Undefined);

        public static async Task<Entity> GetRequiredProperty(this Entity entity, string propertyName, Entity parameters)
        {
            var (found, value) = await entity.TryGetProperty(propertyName, parameters);
            if (!found)
            {
                throw new InvalidOperationException($"Expected property {propertyName}");
            }

            return value;
        }

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
