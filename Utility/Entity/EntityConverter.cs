using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Utility.Entity
{
    public class EntityConverter : JsonConverter<Entity>
    {
        #region Methods
        public override Entity Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) => throw new NotImplementedException();

        public override void Write(Utf8JsonWriter writer, Entity value, JsonSerializerOptions options) => value.Document?.SerializeToJson(writer, options);
        #endregion
    }
}
