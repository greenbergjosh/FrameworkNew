using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading;
using Amazon.Kinesis.ClientLibrary;
using Utility;

namespace AwsKinesisConsumerDataLib
{
    internal class AwsKinesisConsumer : IRecordProcessor
    {
        /// <value>The shard ID on which this record processor is working.</value>
        private string _kinesisShardId;

        /// <value>The next checkpoint time expressed in milliseconds.</value>
        private DateTime _nextCheckpointTime = DateTime.UtcNow;

        private readonly FrameworkWrapper _fw;

        public AwsKinesisConsumer(FrameworkWrapper fw)
        {
            _fw = fw;
            Setting.Bind(_fw);
        }

        #region IRecordProcessor Implementation
        void IRecordProcessor.Initialize(InitializationInput input)
        {
            _kinesisShardId = input.ShardId;
            _fw.Trace("AwsKinesisConsumer.Initialize", $"Initialized shardId: {_kinesisShardId}");
        }

        void IRecordProcessor.ProcessRecords(ProcessRecordsInput input)
        {
            _fw.Trace("AwsKinesisConsumer.ProcessRecords", $"Processing {input.Records.Count} records");
            ProcessRecordsWithRetries(input.Records);

            if (DateTime.UtcNow >= _nextCheckpointTime)
            {
                _fw.Trace("AwsKinesisConsumer.ProcessRecords", "Checkpointing");
                Checkpoint(input.Checkpointer);
                _nextCheckpointTime = DateTime.UtcNow + Setting.CheckpointInterval;
                _fw.Trace("AwsKinesisConsumer.ProcessRecords", "Checkpointed, next checkpoint at " + _nextCheckpointTime);
            }
        }

        void IRecordProcessor.Shutdown(ShutdownInput input)
        {
            if (input.Reason == ShutdownReason.TERMINATE)
            {
                Checkpoint(input.Checkpointer);
            }
            _fw.Trace("AwsKinesisConsumer.Shutdown", "Shutdown shardId: " + _kinesisShardId);
        }
        #endregion

        #region Private Methods
        private void Checkpoint(Checkpointer checkpointer) => checkpointer.Checkpoint(RetryingCheckpointErrorHandler.Create(Setting.NumberOfRetries, Setting.Backoff));

        private void ProcessRecordsWithRetries(IEnumerable<Record> records)
        {
            foreach (var record in records)
            {
                var processedSuccessfully = false;
                for (var i = 0; i < Setting.NumberOfRetries; ++i)
                {
                    try
                    {
                        // The lbm should return a function that handles the record and returns true or false to represent success
                        var lbm = _fw.Entities.GetEntity(Setting.ConsumerLbmId).GetAwaiter().GetResult()?.GetS("Config");

                        processedSuccessfully = (bool)_fw.RoslynWrapper.Evaluate(Setting.ConsumerLbmId, lbm, new { fw = _fw, record }, new StateWrapper()).GetAwaiter().GetResult();

                        if (processedSuccessfully)
                        {
                            break;
                        }
                    }
                    catch (Exception ex)
                    {
                        _fw.Error("AwsKinesisConsumer.ProcessRecordsWithRetries", $"Attempt {i}: Exception processing record: {record} exception: {ex}");
                        Thread.Sleep(Setting.Backoff);
                    }
                }

                if (!processedSuccessfully)
                {
                    if (Setting.StopOnErrorProcessing)
                    {
                        _fw.Error("AwsKinesisConsumer.ProcessRecordsWithRetries", $"Couldn't process record: {record}\r\n. Shutting down.");
                        Process.GetCurrentProcess().Kill();
                    }
                    else
                    {
                        _fw.Error("AwsKinesisConsumer.ProcessRecordsWithRetries", $"Couldn't process record: {record}\r\n. Skipping the record.");
                    }
                }
            }
        }
        #endregion
    }
}
