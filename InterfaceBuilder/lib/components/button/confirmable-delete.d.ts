import { ButtonProps } from "antd/lib/button";
import React from "react";
export interface Props {
    confirmationTitle?: string;
    confirmationMessage: string;
    onDelete: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
}
export declare function ConfirmableDeleteButton({ confirmationMessage, confirmationTitle, onDelete, ...props }: Props & ButtonProps): JSX.Element;
//# sourceMappingURL=confirmable-delete.d.ts.map