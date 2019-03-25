namespace DataManager
{
    // Data that lives in the distributed cache on behalf of this session
    public class DataLifespanSession
    {
        // Should only contain pointers to the distirbuted cache (e.g. redis)
        // This avoids sticky sessions and allows the application session to be resilient during hardware failures
        // The information in the DataLifespanSession is held locally on the server while the current request is being processed
        //  and is then serialized to the distributed cache (e.g. redis) when the request is complete.
        // This avoids the need for sticky servers, though the serialization could be avoided if the sticky server was still
        //  used as the default and the session was stored in the DataLifespanServerInstance. If there were some way to communicate
        //  the most recent id of the SessionState, then the next request would know if the DataLifespanApplication had the most
        //  recent version of the SesionState or if it was necessary to pull the session state from the DataLifespanApplication.

        // If the session is stored in Redis as a JSON/BSON document, then, if the session is going to survive past its lifetime in 
        // Redis (for a long running workflow), it might make sense to use a dedicated JSON/BSON document store like Mongo to hold
        // the session data.  Since Mongo can index and directly query the JSON/BSON session data, this would be an optimal backing
        // store for long running sessions.

        //IDatabase db = null;

        //public DataLifespanSession()
        //{
        //    try
        //    {
        //        ConnectionMultiplexer c = ConnectionMultiplexer.Connect("127.0.0.1:6379");
        //        db = c.GetDatabase();
        //    }
        //    catch (Exception e)
        //    {

        //    }

        //}

        //public void TestRedis()
        //{
        //    bool stored = StoreData("MyKey", "my first cache string");

        //    if (stored)
        //    {
        //        var cachedData = GetData("MyKey");
        //        bool isIt = cachedData == "my first cache string";
        //    }
        //}

        //private bool StoreData(string key, string value)
        //{
        //    return db.StringSet(key, value);
        //}

        //private string GetData(string key)
        //{
        //    return db.StringGet(key);
        //}

        //private void DeleteData(string key)
        //{
        //    db.KeyDelete(key);
        //}

        //public bool Add<T>(string key, T value, DateTimeOffset expiresAt) where T : class
        //{
        //    var serializedObject = JsonConvert.SerializeObject(value);
        //    var expiration = expiresAt.Subtract(DateTimeOffset.Now);

        //    return db.StringSet(key, serializedObject, expiration);
        //}

        //public T Get<T>(string key) where T : class
        //{
        //    var serializedObject = db.StringGet(key);

        //    return JsonConvert.DeserializeObject<T>(serializedObject);
        //}

        //public bool Remove(string key)
        //{
        //    return db.KeyDelete(key);
        //}

        //public bool Exists(string key)
        //{
        //    return db.KeyExists(key);
        //}
    }
}
