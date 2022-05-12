using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EdwRollupLib
{
    public class WithEventsMaker
    {
        private readonly Func<string, string, Task> _dropStartEvent;
        private readonly Func<TimeSpan, string, string, Task> _dropEndEvent;
        private readonly Func<Exception, string, string, bool, Task> _dropErrorEvent;

        public WithEventsMaker(Func<string, string, Task> dropStartEvent, Func<TimeSpan, string, string, Task> dropEndEvent, Func<Exception, string, string, bool, Task> dropErrorEvent)
        {
            _dropStartEvent = dropStartEvent;
            _dropEndEvent = dropEndEvent;
            _dropErrorEvent = dropErrorEvent;
        }

        public Func<Task> WithEvents(Func<Task> action, string stepContext) => async () =>
        {
            var start = DateTime.Now;

            await _dropStartEvent(action.Method.Name, stepContext);

            try
            {
                await action();
                return;
            }
            catch (Exception ex)
            {
                await _dropErrorEvent(ex, action.Method.Name, stepContext, true);
                throw;
            }
            finally
            {
                var end = DateTime.Now;
                await _dropEndEvent(end - start, action.Method.Name, stepContext);
            }
        };
    }

    public class WithEventsMaker<T>
    {
        private readonly Func<T, string, string, Task> _dropStartEvent;
        private readonly Func<T, TimeSpan, string, string, Task> _dropEndEvent;
        private readonly Func<Exception, T, string, string, bool, Task> _dropErrorEvent;

        public WithEventsMaker(Func<T, string, string, Task> dropStartEvent, Func<T, TimeSpan, string, string, Task> dropEndEvent, Func<Exception, T, string, string, bool, Task> dropErrorEvent)
        {
            _dropStartEvent = dropStartEvent;
            _dropEndEvent = dropEndEvent;
            _dropErrorEvent = dropErrorEvent;
        }

        public Func<T, Task<T>> WithEvents(Func<T, T> dataflowTask, Func<T, Task<string>> stepContextGetter) => async (input) =>
        {
            var start = DateTime.Now;

            await _dropStartEvent(input, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input));

            try
            {
                return dataflowTask(input);
            }
            catch (Exception ex)
            {
                await _dropErrorEvent(ex, input, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input), true);
                throw;
            }
            finally
            {
                var end = DateTime.Now;
                await _dropEndEvent(input, end - start, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input));
            }
        };

        public Func<T, Task<IEnumerable<T>>> WithEvents(Func<T, IEnumerable<T>> dataflowTask, Func<T, Task<string>> stepContextGetter) => async (input) =>
        {
            var start = DateTime.Now;

            await _dropStartEvent(input, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input));

            try
            {
                return dataflowTask(input);
            }
            catch (Exception ex)
            {
                await _dropErrorEvent(ex, input, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input), true);
                throw;
            }
            finally
            {
                var end = DateTime.Now;
                await _dropEndEvent(input, end - start, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input));
            }
        };

        public Func<T, Task<T>> WithEvents(Func<T, Task<T>> dataflowTask, Func<T, Task<string>> stepContextGetter) => async (input) =>
        {
            var start = DateTime.Now;

            await _dropStartEvent(input, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input));

            try
            {
                return await dataflowTask(input);
            }
            catch (Exception ex)
            {
                await _dropErrorEvent(ex, input, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input), true);
                throw;
            }
            finally
            {
                var end = DateTime.Now;
                await _dropEndEvent(input, end - start, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input));
            }
        };

        public Func<T, Task<IEnumerable<T>>> WithEvents(Func<T, Task<IEnumerable<T>>> dataflowTask, Func<T, Task<string>> stepContextGetter) => async (input) =>
        {
            var start = DateTime.Now;

            await _dropStartEvent(input, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input));

            try
            {
                return await dataflowTask(input);
            }
            catch (Exception ex)
            {
                await _dropErrorEvent(ex, input, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input), true);
                throw;
            }
            finally
            {
                var end = DateTime.Now;
                await _dropEndEvent(input, end - start, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input));
            }
        };

        public Func<T, Task> WithEvents(Func<T, Task> dataflowTask, Func<T, Task<string>> stepContextGetter) => async (input) =>
        {
            var start = DateTime.Now;

            await _dropStartEvent(input, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input));

            try
            {
                await dataflowTask(input);
            }
            catch (Exception ex)
            {
                await _dropErrorEvent(ex, input, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input), true);
                throw;
            }
            finally
            {
                var end = DateTime.Now;
                await _dropEndEvent(input, end - start, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input));
            }
        };

        public Func<T, Task> WithEvents(Action<T> dataflowTask, Func<T, Task<string>> stepContextGetter) => async (input) =>
        {
            var start = DateTime.Now;

            await _dropStartEvent(input, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input));

            try
            {
                dataflowTask(input);
            }
            catch (Exception ex)
            {
                await _dropErrorEvent(ex, input, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input), false);
                throw;
            }
            finally
            {
                var end = DateTime.Now;
                await _dropEndEvent(input, end - start, dataflowTask.Method.Name, stepContextGetter == null ? null : await stepContextGetter.Invoke(input));
            }
        };
    }
}
