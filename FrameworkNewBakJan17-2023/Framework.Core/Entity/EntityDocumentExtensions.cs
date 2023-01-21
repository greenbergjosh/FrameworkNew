namespace Framework.Core.Entity
{
    public static class EntityDocumentExtensions
    {
        public static async Task<T> GetRequired<T>(this EntityDocument entityDocument, string propertyName)
        {
            var valueEntity = await GetRequiredProperty(entityDocument, propertyName);

            var value = valueEntity.Value<T>();
            if (value == null)
            {
                throw new InvalidOperationException($"{propertyName} can not be null");
            }

            return value;
        }

        public static Task<string> GetRequiredString(this EntityDocument entityDocument, string propertyName) => GetRequired<string>(entityDocument, propertyName);

        public static async Task<Entity> GetRequiredProperty(this EntityDocument entityDocument, string propertyName)
        {
            var (found, value) = await entityDocument.TryGetProperty(propertyName);
            if (!found)
            {
                throw new InvalidOperationException($"Expected property {propertyName}");
            }

            return value;
        }

        public static async Task<T?> GetOrDefault<T>(this EntityDocument entityDocument, string propertyName, T? defaultValue = default)
        {
            var (found, value) = await entityDocument.TryGetProperty(propertyName);
            if (!found)
            {
                return defaultValue;
            }

            return value.Value<T>();
        }

        public static async Task<T> GetOrDefaultCoalesce<T>(this EntityDocument entityDocument, string propertyName, T defaultValue)
        {
            var (found, propertyValue) = await entityDocument.TryGetProperty(propertyName);
            if (!found)
            {
                return defaultValue;
            }

            var value = propertyValue.Value<T>();
            return value ?? defaultValue;
        }
    }
}
