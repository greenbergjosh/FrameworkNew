import React from "react";
export declare const undraggableProps: {
    draggable: boolean;
    onDragStart: (e: {
        preventDefault: () => void;
        stopPropagation: () => void;
    }) => void;
};
interface UndraggableProps {
    wrap?: boolean | "shrink";
}
export declare const Undraggable: React.FunctionComponent<UndraggableProps>;
export {};
//# sourceMappingURL=Undraggable.d.ts.map