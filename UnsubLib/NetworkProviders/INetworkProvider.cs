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
            switch (network.GetS("Credentials/NetworkType"))
            {
                case "Cake":
                    return new Cake(fw);

                case "W4":
                    return new W4(fw);

                default:
                    return new Other(fw);
            }
        }


    }
}
