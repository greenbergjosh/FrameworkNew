import React from "react";
import { DraggedItemProps } from "components/DragAndDrop";
export interface EditableContextProps {
    canDelete?: boolean;
    canEdit?: boolean;
    onDelete?: (draggedItem: DraggedItemProps) => void;
    onEdit?: (draggedItem: DraggedItemProps) => void;
}
export declare const EditableContext: React.Context<EditableContextProps | null>;
//# sourceMappingURL=EditableContext.d.ts.map