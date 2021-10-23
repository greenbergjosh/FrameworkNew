namespace DataManager
{
    // Data that lives in a distributed cache, a database, or a third-party store, that is not locally cached on this server
    // This data is resilient to hardware failure and is stored in a distributed cache (e.g. redis)
    // This data is not specific to a session, but is shared by all sessions
    public class DataLifespanApplication
    {
    }
}
