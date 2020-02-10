using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core
{
    public interface IGenericEntity
    {
        void InitializeEntity(object configuration, object data);

        dynamic this[string path] { get; }

        bool TryGetValue<T>(string path, out T value, T defaultValue = default);

        dynamic Get(string path);
        T Get<T>(string path);
        T Get<T>(string path, T defaultValue = default);
        void Set(string path, object value);
        IEnumerable<dynamic> GetA(string path);
        bool GetB(string path);
        IEnumerable<KeyValuePair<string, dynamic>> GetD(string path);
        IGenericEntity GetE(string path);
        IGenericEntity GetE(string path, IGenericEntity defaultValue);
        IEnumerable<IGenericEntity> GetL(string path);
        string GetS(string path);

        Task<object> Run(string path, params object[] args);  
    }
}
