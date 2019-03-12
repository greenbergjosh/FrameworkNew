using System;
using Utility;

namespace AwsKinesisConsumerDataLib
{
    internal static class Setting
    {
        #region Private Fields
        private static int _backoffSeconds;
        private static int _checkpointIntervalSeconds;
        #endregion

        #region Public Properties
        /// <value>
        /// The time to wait before this record processor reattempts either a checkpoint, or the processing of a record.
        /// </value>
        public static TimeSpan Backoff => TimeSpan.FromSeconds(_backoffSeconds);

        /// <value>
        /// The interval this record processor waits between doing two successive checkpoints.
        /// </value>
        public static TimeSpan CheckpointInterval => TimeSpan.FromSeconds(_checkpointIntervalSeconds);

        /// <value>
        /// The Id of the Lbm that will be used to process Kinesis records.
        /// </value>
        public static Guid ConsumerLbmId { get; private set; }

        /// <value>
        /// The maximum number of times this record processor retries either a failed checkpoint, or the processing of a record that previously failed.
        /// </value>
        public static int NumberOfRetries { get; private set; }

        /// <summary>
        /// True if the process should stop upon an exception raised during record processing.
        /// </summary>
        public static bool StopOnErrorProcessing { get; private set; }
        #endregion

        #region Public Methods
        public static void Bind(FrameworkWrapper fw)
        {
            _backoffSeconds = fw.StartupConfiguration.GetS("Config/BackoffSeconds").ParseInt() ?? 3;
            _checkpointIntervalSeconds = fw.StartupConfiguration.GetS("Config/CheckpointIntervalSeconds").ParseInt() ?? 60;

            ConsumerLbmId = new Guid(fw.StartupConfiguration.GetS("Config/ConsumerLbmId"));
            NumberOfRetries = fw.StartupConfiguration.GetS("Config/NumberOfRetries").ParseInt() ?? 1;
            StopOnErrorProcessing = fw.StartupConfiguration.GetB("Config/StopOnErrorProcessing");
        }
        #endregion

    }
}
