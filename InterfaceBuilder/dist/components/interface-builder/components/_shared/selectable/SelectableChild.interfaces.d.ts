import { SelectableOption } from "./Selectable.interfaces";
import { LoadStatusType } from "./Selectable.types";
export interface SelectableChildProps {
    allowCreateNew?: boolean;
    createNewLabel: string;
    disabled?: boolean;
    getCleanValue: () => string | string[] | undefined;
    loadError: string | null;
    loadStatus: LoadStatusType;
    options: SelectableOption[];
}
//# sourceMappingURL=SelectableChild.interfaces.d.ts.map