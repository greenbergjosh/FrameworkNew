using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Framework.Core.Languages.E
{
    // This will get moved to dynamic code once it is available
    internal static class GridDecoration
    {
        internal static async Task<IDictionary<string, object>> Evaluate(Request request, DictionaryStack parameters)
        {
            var decorationStage = parameters.Get<string>("DecorationStage");

            switch (decorationStage)
            {
                case "Pre":
                    return await PreBehavior(request, parameters);
                case "Post":
                    return await PostBehavior(request, parameters);
                default:
                    throw new ArgumentException("Unknown DecorationStage [" + decorationStage + "]");
            }
        }

        private static async Task<IDictionary<string, object>> PreBehavior2(Request request, DictionaryStack parameters)
        {
            Guid stackFrameId;
            int currentX;
            int currentY;
            List<Dictionary<int, Guid>> cellGrid;
            Guid oldCellId;
            Guid priorCellId;
            Guid convergentCellId;

            var calls = parameters.Get<dynamic>("Calls");

            var currentCellId = parameters.Get("ContinuationPointer", Guid.Empty);
            if (currentCellId == Guid.Empty)
            {
                stackFrameId = Guid.NewGuid();
                currentX = 0;
                currentY = 0;
                await calls.MemorySet(stackFrameId, "CurrentX", currentX);
                cellGrid = new List<Dictionary<int, Guid>>();
                await calls.MemorySet(stackFrameId, "Grid", cellGrid);
            }
            else
            {
                stackFrameId = await calls.MemoryGet(currentCellId, "StackFrameId");

                currentX = await calls.MemoryGet(stackFrameId, "CurrentX");
                currentY = await calls.MemoryGet(currentCellId, "CurrentY");
                cellGrid = await calls.MemoryGet(stackFrameId, "Grid");
            }

            var expectedCellId = await calls.MemoryGet(stackFrameId, "ExpectedCellId", Guid.Empty);
            if (currentCellId == Guid.Empty)
            {
                currentCellId = Guid.NewGuid();
                await calls.MemorySet(currentCellId, "StackFrameId", stackFrameId);
                await calls.MemorySet(currentCellId, "CurrentY", currentY);

                oldCellId = Guid.Empty;
                priorCellId = Guid.Empty;
                convergentCellId = Guid.Empty;
                ValidateGrid(cellGrid, currentX, currentY);
                if (currentY == cellGrid.Count)
                {
                    cellGrid.Add(new Dictionary<int, Guid>());
                }
                cellGrid[currentY].Add(currentX, currentCellId);
            }
            else if (currentCellId != expectedCellId)
            {
                // Also covers returning to an unvisited cell (exceptional nav partition)                    
                oldCellId = currentCellId;
                priorCellId = await calls.MemoryGet(stackFrameId, "PriorCellId", Guid.Empty);
                convergentCellId = currentCellId;
                currentCellId = Guid.NewGuid();
                await calls.MemorySet(currentCellId, "ConvergentCellId", convergentCellId);
                currentX++;
                await calls.MemorySet(stackFrameId, "CurrentX", currentX);
                await calls.MemorySet(currentCellId, "CurrentX", currentX);
                currentY = await calls.MemoryGet(oldCellId, "CurrentY");
                await calls.MemorySet(currentCellId, "CurrentY", currentY);
                ValidateGrid(cellGrid, currentX, currentY);
                if (currentY == cellGrid.Count)
                {
                    cellGrid.Add(new Dictionary<int, Guid>());
                }
                cellGrid[currentY].Add(currentX, currentCellId);
            }
            else
            {
                oldCellId = Guid.Empty;
                priorCellId = await calls.MemoryGet(currentCellId, "PriorCellId");
                convergentCellId = await calls.MemoryGet(currentCellId, "ConvergentCellId");
            }

            await calls.MemorySet(currentCellId, "StackFrameId", stackFrameId);
            await calls.MemorySet(currentCellId, "OldCellId", oldCellId);
            await calls.MemorySet(currentCellId, "PriorCellId", priorCellId);
            await calls.MemorySet(currentCellId, "ConvergentCellId", convergentCellId);
            await calls.MemorySet(currentCellId, "ExpectedCellId", expectedCellId);

            var introducedParameters = parameters.Get("IntroducedParameters");
            introducedParameters["StackFrameId"] = stackFrameId;
            introducedParameters["CellId"] = currentCellId;
            introducedParameters["Grid"] = new
            {
                GetCell = new Func<Guid, Task<object>>(async (cellId) =>
                {
                    var cellOldCellId = await calls.MemoryGet(cellId, "OldCellId");
                    var cellPriorCellId = await calls.MemoryGet(cellId, "PriorCellId");
                    var cellConvergentCellId = await calls.MemoryGet(cellId, "ConvergentCellId");
                    var cellExpectedCellId = await calls.MemoryGet(cellId, "ExpectedCellId");
                    var cellX = await calls.MemoryGet(cellId, "CurrentX");
                    var cellY = await calls.MemoryGet(cellId, "CurrentY");

                    return new
                    {
                        CellId = cellId,
                        OldCellId = cellOldCellId,
                        PriorCellId = cellPriorCellId,
                        ConvergentCellId = cellConvergentCellId,
                        ExpectedCellId = cellExpectedCellId,
                        X = cellX,
                        Y = cellY,
                    };
                }),
            };

            await calls.IO("X: " + currentX + " Y: " + currentY);

            return null;
        }

        private static async Task<IDictionary<string, object>> PreBehavior(Request request, DictionaryStack parameters)
        {                   
            var calls = parameters.Get<dynamic>("Calls");

            Guid currentCellId = parameters.Get("ContinuationPointer", Guid.Empty);
            Guid newCellId = currentCellId;
            Guid stackFrameId = currentCellId == Guid.Empty ? Guid.NewGuid() : await calls.MemoryGet(currentCellId, "StackFrameId");
            var expectedCellId = await calls.MemoryGet(stackFrameId, "ExpectedCellId", Guid.Empty);
            await calls.IO("CurrentCellId: " + currentCellId + " StackFrameId: " + stackFrameId);
            if (currentCellId == Guid.Empty)
            {
                newCellId = await NewGrid(calls, stackFrameId);

                await calls.IO("X: " + 0 + " Y: " + 0);
            }
            else if (currentCellId != expectedCellId)
            {
                newCellId = Guid.NewGuid();
                int currentY = await calls.MemoryGet(currentCellId, "CurrentY");
                int currentX = await calls.MemoryGet(stackFrameId, "CurrentX") + 1;

                List<Dictionary<int, Guid>> cellGrid = await calls.MemoryGet(stackFrameId, "Grid");
                ValidateGrid(cellGrid, currentX, currentY);
                cellGrid[currentY].Add(currentX, newCellId);

                await calls.MemorySet(newCellId, "StackFrameId", stackFrameId);
                await calls.MemorySet(newCellId, "OldCellId", currentCellId);  // Expected case set to empty, dont need that and/or whole case
                await calls.MemorySet(newCellId, "PriorCellId", await calls.MemoryGet(stackFrameId, "PriorCellId", Guid.Empty));
                await calls.MemorySet(newCellId, "ConvergentCellId", currentCellId);
                await calls.MemorySet(newCellId, "ExpectedCellId", expectedCellId);
                await calls.MemorySet(stackFrameId, "CurrentX", currentX);
                await calls.MemorySet(newCellId, "CurrentX", currentX);
                await calls.MemorySet(newCellId, "CurrentY", currentY);

                await calls.IO("X: " + currentX + " Y: " + currentY);
            }

            var introducedParameters = parameters.Get("IntroducedParameters");
            introducedParameters["StackFrameId"] = stackFrameId;
            introducedParameters["CellId"] = newCellId;
            
            introducedParameters["Grid"] = new
            {
                GetCell = new Func<Guid, Task<object>>(async (cellId) =>
                {
                    return new
                    {
                        CellId = cellId,
                        OldCellId = await calls.MemoryGet(cellId, "OldCellId"),
                        PriorCellId = await calls.MemoryGet(cellId, "PriorCellId"),
                        ConvergentCellId = await calls.MemoryGet(cellId, "ConvergentCellId"),
                        ExpectedCellId = await calls.MemoryGet(cellId, "ExpectedCellId"),
                        X = await calls.MemoryGet(cellId, "CurrentX"),
                        Y = await calls.MemoryGet(cellId, "CurrentY"),
                    };
                })
            };

            return null;
        }

        private static async Task<IDictionary<string, object>> PostBehavior2(Request request, DictionaryStack parameters)
        {
            var calls = parameters.Get<dynamic>("Calls");

            IDictionary<string, object> result = new Dictionary<string, object>();

            var stackFrameId = parameters.Get<Guid>("StackFrameId");
            var currentCellId = parameters.Get<Guid>("CellId");
            await calls.MemorySet(stackFrameId, "PriorCellId", currentCellId);

            var compositeReturn = parameters.Get("CompositeReturn");
            var completed = compositeReturn.Get("Completed", false);

            if (!completed)
            {
                var nextCellId = Guid.NewGuid();

                await calls.MemorySet(nextCellId, "StackFrameId", stackFrameId);
                await calls.MemorySet(nextCellId, "OldCellId", Guid.Empty);
                await calls.MemorySet(nextCellId, "PriorCellId", currentCellId);
                await calls.MemorySet(nextCellId, "ExpectedCellId", Guid.Empty);

                var nextConvergentCellId = Guid.Empty;
                var priorConvergentCellId = await calls.MemoryGet(currentCellId, "ConvergentCellId", Guid.Empty);
                if (priorConvergentCellId != Guid.Empty)
                {
                    nextConvergentCellId = await calls.MemoryGet(priorConvergentCellId, "ExpectedCellId", Guid.Empty);
                }
                await calls.MemorySet(nextCellId, "ConvergentCellId", nextConvergentCellId);

                var nextX = await calls.MemoryGet(stackFrameId, "CurrentX") + 1;
                var nextY = await calls.MemoryGet(currentCellId, "CurrentY") + 1;

                var cellGrid = await calls.MemoryGet(stackFrameId, "Grid");
                ValidateGrid(cellGrid, nextX, nextY);
                if (nextY == cellGrid.Count)
                {
                    cellGrid.Add(new Dictionary<int, Guid>());
                }
                cellGrid[nextY].Add(nextX, nextCellId);

                result["ContinuationPointer"] = nextCellId;

                await calls.MemorySet(currentCellId, "ExpectedCellId", nextCellId);
                await calls.MemorySet(nextCellId, "CurrentX", nextX);
                await calls.MemorySet(nextCellId, "CurrentY", nextY);

                await calls.MemorySet(stackFrameId, "ExpectedCellId", nextCellId);
                await calls.MemorySet(stackFrameId, "CurrentX", nextX);

                await calls.IO("Next X: " + nextX + " Next Y: " + nextY);
            }
            else
            {
                //var nextX = await calls.MemoryGet(stackFrameId, "CurrentX") + 1;
                //await calls.MemorySet(stackFrameId, "CurrentX", nextX);
                await calls.MemorySet(stackFrameId, "ExpectedCellId", Guid.Empty);
                result["ContinuationPointer"] = Guid.Empty;
            }

            result["InContinuationPointer"] = currentCellId;

            return await Task.FromResult(result);
        }

        private static async Task<IDictionary<string, object>> PostBehavior(Request request, DictionaryStack parameters)
        {            
            var calls = parameters.Get<dynamic>("Calls");
            IDictionary<string, object> result = new Dictionary<string, object>();

            // These were the parameters introduced in the PRE
            //await calls.IO(parameters.ToString());
            //var stackFrameId = parameters.Get<Guid>("StackFrameId");
            //var currentCellId = parameters.Get<Guid>("CellId");

            var introducedParameters = parameters.Get("IntroducedParameters");
            var stackFrameId = introducedParameters.Get<Guid>("StackFrameId");
            var currentCellId = introducedParameters.Get<Guid>("CellId");

            await calls.MemorySet(stackFrameId, "PriorCellId", currentCellId);

            // Does this mean Grid is aware of composite, is that right?
            // Feels like Grid can't function unless composite sets the completed flag
            // Maybe the notion of the completed flag is fundamental to the framework, instead
            // This is the Grid, not the Sequence, it needs to know if the evaluatable it is wrapping/decorating
            // has completed.  If not, it will prepare a new cell for that evaluatable.
            var compositeReturn = parameters.Get("CompositeReturn");
            var completed = compositeReturn.Get("Completed", false);

            if (!completed)
            {
                var cellGrid = await calls.MemoryGet(stackFrameId, "Grid");
                var nextX = await calls.MemoryGet(stackFrameId, "CurrentX") + 1;
                var nextY = await calls.MemoryGet(currentCellId, "CurrentY") + 1;
                var priorConvergentCellId = await calls.MemoryGet(currentCellId, "ConvergentCellId", Guid.Empty);

                var newCellId = Guid.NewGuid();
                await calls.MemorySet(currentCellId, "ExpectedCellId", newCellId);

                await calls.MemorySet(newCellId, "StackFrameId", stackFrameId);
                await calls.IO("NewCellId: " + newCellId + " StackFrameId: " + stackFrameId);
                await calls.MemorySet(newCellId, "OldCellId", Guid.Empty);
                await calls.MemorySet(newCellId, "PriorCellId", currentCellId);
                await calls.MemorySet(newCellId, "ExpectedCellId", Guid.Empty);
                await calls.MemorySet(newCellId, "ConvergentCellId",
                    priorConvergentCellId == Guid.Empty ? Guid.Empty : await calls.MemoryGet(priorConvergentCellId, "ExpectedCellId", Guid.Empty) );
                await calls.MemorySet(newCellId, "CurrentX", nextX);
                await calls.MemorySet(newCellId, "CurrentY", nextY);

                await calls.MemorySet(stackFrameId, "ExpectedCellId", newCellId);
                await calls.MemorySet(stackFrameId, "CurrentX", nextX);
                AddCell(cellGrid, nextX, nextY, newCellId);

                result["ContinuationPointer"] = newCellId;               

                await calls.IO("Next X: " + nextX + " Next Y: " + nextY);
            }
            else
            {
                await calls.MemorySet(stackFrameId, "ExpectedCellId", Guid.Empty);
            }

            result["InContinuationPointer"] = currentCellId;

            return await Task.FromResult(result);
        }

        private static void AddCell(List<Dictionary<int, Guid>> cellGrid, int currentX, int currentY, Guid currentCell)
        {
            ValidateGrid(cellGrid, currentX, currentY);
            if (currentY == cellGrid.Count)
            {
                cellGrid.Add(new Dictionary<int, Guid>());
            }
            cellGrid[currentY].Add(currentX, currentCell);
        }

        private static async Task<Guid> NewGrid(dynamic calls, Guid stackFrameId)
        {
            Guid currentCellId = Guid.NewGuid();

            await calls.MemorySet(stackFrameId, "Grid", 
                new List<Dictionary<int, Guid>>() { new Dictionary<int, Guid>() { { 0, currentCellId } } });
            await calls.MemorySet(stackFrameId, "CurrentX", 0);

            await calls.MemorySet(currentCellId, "StackFrameId", stackFrameId);
            await calls.MemorySet(currentCellId, "OldCellId", Guid.Empty);
            await calls.MemorySet(currentCellId, "PriorCellId", Guid.Empty);
            await calls.MemorySet(currentCellId, "ConvergentCellId", Guid.Empty);
            await calls.MemorySet(currentCellId, "ExpectedCellId", Guid.Empty);
            await calls.MemorySet(currentCellId, "CurrentX", 0);
            await calls.MemorySet(currentCellId, "CurrentY", 0);

            return currentCellId;
        }

        private static void ValidateGrid(List<Dictionary<int, Guid>> cellGrid, int currentX, int currentY)
        {
            for (int i = 0; i < cellGrid.Count; i++)
            {
                if (cellGrid[i].ContainsKey(currentX))
                {
                    throw new InvalidOperationException("Trying to add existing X value: " + currentX + ". The value already exists at Y: " + i);
                }
            }

            if (currentY > cellGrid.Count + 1)
            {
                throw new InvalidOperationException("Y values must be contiguous.  Trying to add " + currentY + " when last Y value is " + cellGrid.Count);
            }
        }
    }
}
