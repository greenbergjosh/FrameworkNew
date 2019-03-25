using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataManager
{
    public interface IGenericEntity
    {
        void InitializeEntity(object configuration, object data);

        object this[string path]
        {
            get;
        }

        Dictionary<string, object> State
        {
            get;
        }

        void RegisterNamedCallback(string callbackName, Func<IGenericEntity, Dictionary<string, object>, string, object> callback);

        IEnumerable<IGenericEntity> GetL(string path);
        IGenericEntity GetE(string path);

        object Get(string path);
        object Run(string fname);
        object Get(string path, string fname);
        object Ext(string extensionClassName, string extensionMethodName, string args);
        object Cb(string callbackName, string args);

        T Get<T>(string path);
        T Run<T>(string fname);
        T Get<T>(string path, string fname);

        string GetS(string path);
        string RunS(string fname);
        string GetS(string path, string fname);

        bool GetB(string path);
        bool RunB(string fname);
        bool GetB(string path, string fname);
    }
}
