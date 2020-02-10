using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace Framework.Core.Languages.E
{
    public static class GridDecoration
    {
        public static (Guid nextCellId, Guid previousCellid) PreBehavior(IGenericEntity s)
        {
            var state = (State)s;
            Guid previousCellId = Guid.Empty;
            Guid currentCellId;
            if (state.Context != null)
                currentCellId = state.Context.Get(Keywords.ContinuationPointer, Guid.Empty);
            else
                currentCellId = state.Get(Keywords.ContinuationPointer, Guid.Empty);

            IDictionary<string, object> currentCell = null;
            object cell = null;
            if (currentCellId != Guid.Empty && state.Memory.TryGetValue(currentCellId, out cell))
                currentCell = (IDictionary<string, object>)((IDictionary<string, object>)cell)[Keywords.Memory];

            var newCellId = currentCellId;
            var gridId = currentCell == null
                ? Guid.Empty
                : ((IDictionary<string, object>)cell).Get(Keywords.GridId, Guid.Empty);

            var expectedCellId = currentCell == null
                ? Guid.Empty
                : ((IDictionary<string, object>)state.Memory[gridId]).Get(Keywords.ExpectedCellId, Guid.Empty); ;

            Debug.WriteLine($"{Keywords.CurrentCellId}: {currentCellId} {Keywords.GridId}: {gridId}");

            if (expectedCellId == Guid.Empty)
            {
                newCellId = NewGrid(state);
                previousCellId = newCellId;
                Debug.WriteLine("X: 0 Y: 0");
            }
            else if (currentCellId != expectedCellId)
            {
                newCellId = Guid.NewGuid();
                previousCellId = newCellId;
                var newCell = new Dictionary<string, object>();
                state.Memory[newCellId] = new Dictionary<string, object>()
                {
                    [Keywords.Id] = newCellId,
                    [Keywords.PreviousCellId] = ((IDictionary<string, object>)state.Memory[currentCellId])[Keywords.PreviousCellId],
                    [Keywords.Memory] = newCell,
                    [Keywords.GridId] = gridId
                };

                var grid = (IDictionary<string, object>)state.Memory[gridId];
                var currentY = currentCell.Get<int>(Keywords.CurrentY);
                var currentX = grid.Get<int>(Keywords.CurrentX) + 1;

                var cellGrid = grid.GetList<IDictionary<string, object>>(Keywords.Grid);
                ValidateGrid(cellGrid, currentX, currentY);
                cellGrid[currentY].Add(currentX.ToString(), newCellId);

                newCell[Keywords.OldCellId] = currentCellId; // Expected case set to empty, dont need that and/or whole case
                var priorCellId = grid.Get(Keywords.PriorCellId, Guid.Empty);
                newCell[Keywords.PriorCellId] = priorCellId;
                newCell[Keywords.ConvergentCellId] = currentCellId;

                newCell[Keywords.ExpectedCellId] = expectedCellId;

                grid[Keywords.CurrentX] = currentX;

                newCell[Keywords.CurrentX] = currentX;
                newCell[Keywords.CurrentY] = currentY;

                Debug.WriteLine($"X: {currentX} Y: {currentY}");
            }

            return (newCellId, previousCellId);
        }

        public static void PostBehavior(IGenericEntity s, IDictionary<string, object> outputs)
        {
            var state = (State)s;
            // These were the parameters introduced in the PRE
            
            var currentCellId = s.Get<Guid>(Keywords.CellId);
            var gridId = ((IDictionary<string, object>)state.Memory[currentCellId]).Get<Guid>(Keywords.GridId);


            var grid = (IDictionary<string, object>)state.Memory[gridId];
            var currentCell = (IDictionary<string, object>)((IDictionary<string, object>)state.Memory[currentCellId])[Keywords.Memory];

            grid[Keywords.PriorCellId] = currentCellId;

            // Does this mean Grid is aware of composite, is that right?
            // Feels like Grid can't function unless composite sets the completed flag
            // Maybe the notion of the completed flag is fundamental to the framework, instead
            // This is the Grid, not the Sequence, it needs to know if the evaluatable it is wrapping/decorating
            // has completed.  If not, it will prepare a new cell for that evaluatable.
            var completed = outputs.Get(Keywords.Completed, false);

            if (!completed)
            {
                var cellGrid = (IList<IDictionary<string, object>>)grid[Keywords.Grid];
                var nextX = grid.Get<int>(Keywords.CurrentX) + 1;
                var nextY = currentCell.Get<int>(Keywords.CurrentY) + 1;
                var priorConvergentCellId = currentCell.Get(Keywords.ConvergentCellId, Guid.Empty);

                var newCellId = Guid.NewGuid();
                var newCell = new Dictionary<string, object>();
                state.Memory[newCellId] = new Dictionary<string, object>()
                {
                    [Keywords.Id] = newCellId,
                    [Keywords.PreviousCellId] = currentCellId,
                    [Keywords.Memory] = newCell,
                    [Keywords.GridId] = gridId
                };

                currentCell[Keywords.ExpectedCellId] = newCellId;

                Debug.WriteLine($"{Keywords.NewCellId}: {newCellId} {Keywords.GridId}: {gridId}.");

                newCell[Keywords.OldCellId] = Guid.Empty;
                newCell[Keywords.PriorCellId] = currentCellId;
                newCell[Keywords.ExpectedCellId] = Guid.Empty;

                IDictionary<string, object> priorConvergentCell = null;
                if (priorConvergentCellId != Guid.Empty && state.Memory.TryGetValue(priorConvergentCellId, out var cell))
                    priorConvergentCell = (IDictionary<string, object>)((IDictionary<string, object>)cell)[Keywords.Memory];
                
                newCell[Keywords.ConvergentCellId] = priorConvergentCell == null 
                    ? Guid.Empty 
                    : priorConvergentCell.Get(Keywords.ExpectedCellId, Guid.Empty);

                newCell[Keywords.CurrentX] = nextX;
                newCell[Keywords.CurrentY] = nextY;

                grid[Keywords.ExpectedCellId] = newCellId;
                grid[Keywords.CurrentX] = nextX;

                AddCell(cellGrid, nextX, nextY, newCellId);

                outputs[Keywords.ContinuationPointer] = newCellId;

                Debug.WriteLine($"Next X: {nextX} Next Y: {nextY}.");
            }
            else
            {
                grid[Keywords.ExpectedCellId] = Guid.Empty;
            }
        }

        private static void AddCell(IList<IDictionary<string, object>> cellGrid, int currentX, int currentY, Guid currentCell)
        {
            ValidateGrid(cellGrid, currentX, currentY);
            if (currentY == cellGrid.Count)
                cellGrid.Add(new Dictionary<string, object>());

            cellGrid[currentY].Add(currentX.ToString(), currentCell);
        }

        private static Guid NewGrid(State state)
        {
            var gridId = Guid.NewGuid();
            var currentCellId = Guid.NewGuid();
            var currentCell = new Dictionary<string, object>();
            state.Memory[currentCellId] = new Dictionary<string, object>()
            {
                [Keywords.Id] = currentCellId,
                [Keywords.PreviousCellId] = Guid.Empty,
                [Keywords.Memory] = currentCell,
                [Keywords.GridId] = gridId
            };

            state.Memory[gridId] = new Dictionary<string, object>()
            {
                [Keywords.CurrentX] = 0,
                [Keywords.Grid] = new List<IDictionary<string, object>>()
                {
                    new Dictionary<string, object>()
                    {
                        { "0", currentCellId }
                    }
                }
            };

            //state.Context[Keywords.StackFrameId] = stackFrameId;
            currentCell[Keywords.OldCellId] = Guid.Empty;
            currentCell[Keywords.PriorCellId] = Guid.Empty;
            currentCell[Keywords.ConvergentCellId] = Guid.Empty;
            currentCell[Keywords.ExpectedCellId] = Guid.Empty;
            currentCell[Keywords.CurrentX] = 0;
            currentCell[Keywords.CurrentY] = 0;

            return currentCellId;
        }

        private static void ValidateGrid(IList<IDictionary<string, object>> cellGrid, int currentX, int currentY)
        {
            for (int i = 0; i < cellGrid.Count; i++)
            {
                if (cellGrid[i].ContainsKey(currentX.ToString()))
                    throw new InvalidOperationException(
                        $"Trying to add existing X value: {currentX}. The value already exists at Y: {i}.");
            }

            if (currentY > cellGrid.Count + 1)
                throw new InvalidOperationException(
                    $"Y values must be contiguous. Trying to add {currentY} when last Y value is {cellGrid.Count}.");
        }
    }
}
