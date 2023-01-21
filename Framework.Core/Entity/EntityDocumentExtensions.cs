namespace Framework.Core.Entity
{
    public static class EntityDocumentExtensions
    {
        public static Task<string> GetRequiredString(this EntityDocument entityDocument, string propertyName) => entityDocument.GetPropertyValue<string>(propertyName);

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
