namespace Utility
{
    public interface IGenericWindowsService : IGenericDataService
    {
        void OnStop();
        void OnStart();
    }
}
