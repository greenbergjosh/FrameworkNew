using System;
using System.Threading.Tasks;
using Utility;
using Utility.GenericEntity;

namespace UnsubLib.NetworkProviders
{
    public interface INetworkProvider
    {
        Task<IGenericEntity> GetCampaigns(IGenericEntity network);
        Task<Uri> GetSuppressionLocationUrl(IGenericEntity network, string unsubRelationshipId);
    }


    public static class Factory
    {
        public static INetworkProvider GetInstance(FrameworkWrapper fw, IGenericEntity network)
        {
            return (network.GetS("Credentials/NetworkType")) switch
            {
                "Cake" => new Cake(fw),
                "W4" => new W4(fw),
                "Tune" => new Tune(fw),
                _ => new Other(fw),
            };
        }
    }
}
