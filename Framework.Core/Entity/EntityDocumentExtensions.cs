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
    }
}
