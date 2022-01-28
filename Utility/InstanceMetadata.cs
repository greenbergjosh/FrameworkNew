using System;

namespace Utility
{
    public static class InstanceMetadata
    {
        public static string InstanceId { get; } = Amazon.Util.EC2InstanceMetadata.InstanceId ?? Environment.MachineName;
    }
}
