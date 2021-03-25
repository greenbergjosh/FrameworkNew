using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EdwRollupLib
{
    public class WithEventsMaker<T>
    {
        private readonly Func<T, string, Task> _dropStartEvent;
        private readonly Func<T, TimeSpan, string, Task> _dropEndEvent;
        private readonly Func<Exception, T, string, bool, Task> _dropErrorEvent;

        public WithEventsMaker(Func<T, string, Task> dropStartEvent, Func<T, TimeSpan, string, Task> dropEndEvent, Func<Exception, T, string, bool, Task> dropErrorEvent)
        {
            _dropStartEvent = dropStartEvent;
            _dropEndEvent = dropEndEvent;
            _dropErrorEvent = dropErrorEvent;
        }

        public Func<T, Task<T>> WithEvents(Func<T, T> dataflowTask)
        {
            return async (input) =>
            {
                var start = DateTime.Now;

                await _dropStartEvent(input, dataflowTask.Method.Name);

                try
                {
                    return dataflowTask(input);
                }
                catch (Exception ex)
                {
                    await _dropErrorEvent(ex, input, dataflowTask.Method.Name, true);
                    throw;
                }
                finally
                {
                    var end = DateTime.Now;
                    await _dropEndEvent(input, end - start, dataflowTask.Method.Name);
                }
            };
        }

        public Func<T, Task<IEnumerable<T>>> WithEvents(Func<T, IEnumerable<T>> dataflowTask)
        {
            return async (input) =>
            {
                var start = DateTime.Now;

                await _dropStartEvent(input, dataflowTask.Method.Name);

                try
                {
                    return dataflowTask(input);
                }
                catch (Exception ex)
                {
                    await _dropErrorEvent(ex, input, dataflowTask.Method.Name, true);
                    throw;
                }
                finally
                {
                    var end = DateTime.Now;
                    await _dropEndEvent(input, end - start, dataflowTask.Method.Name);
                }
            };
        }

        public Func<T, Task<T>> WithEvents(Func<T, Task<T>> dataflowTask)
        {
            return async (input) =>
            {
                var start = DateTime.Now;

                await _dropStartEvent(input, dataflowTask.Method.Name);

                try
                {
                    return await dataflowTask(input);
                }
                catch (Exception ex)
                {
                    await _dropErrorEvent(ex, input, dataflowTask.Method.Name, true);
                    throw;
                }
                finally
                {
                    var end = DateTime.Now;
                    await _dropEndEvent(input, end - start, dataflowTask.Method.Name);
                }
            };
        }

        public Func<T, Task<IEnumerable<T>>> WithEvents(Func<T, Task<IEnumerable<T>>> dataflowTask)
        {
            return async (input) =>
            {
                var start = DateTime.Now;

                await _dropStartEvent(input, dataflowTask.Method.Name);

                try
                {
                    return await dataflowTask(input);
                }
                catch (Exception ex)
                {
                    await _dropErrorEvent(ex, input, dataflowTask.Method.Name, true);
                    throw;
                }
                finally
                {
                    var end = DateTime.Now;
                    await _dropEndEvent(input, end - start, dataflowTask.Method.Name);
                }
            };
        }

        public Func<T, Task> WithEvents(Func<T, Task> dataflowTask)
        {
            return async (input) =>
            {
                var start = DateTime.Now;

                await _dropStartEvent(input, dataflowTask.Method.Name);

                try
                {
                    await dataflowTask(input);
                }
                catch (Exception ex)
                {
                    await _dropErrorEvent(ex, input, dataflowTask.Method.Name, true);
                    throw;
                }
                finally
                {
                    var end = DateTime.Now;
                    await _dropEndEvent(input, end - start, dataflowTask.Method.Name);
                }
            };
        }

        public Func<T, Task> WithEvents(Action<T> dataflowTask)
        {
            return async (input) =>
            {
                var start = DateTime.Now;

                await _dropStartEvent(input, dataflowTask.Method.Name);

                try
                {
                    dataflowTask(input);
                }
                catch (Exception ex)
                {
                    await _dropErrorEvent(ex, input, dataflowTask.Method.Name, false);
                    throw;
                }
                finally
                {
                    var end = DateTime.Now;
                    await _dropEndEvent(input, end - start, dataflowTask.Method.Name);
                }
            };
        }
    }
}
