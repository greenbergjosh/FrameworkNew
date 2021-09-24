import { ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent";
import { UserInterfaceProps } from "components/interface-builder/UserInterface";
export declare type IconType = "male" | "female" | "classic";
export declare type IconProps = {
    height: number;
    strokeColor: string;
    strokeWidth: number;
    fillColor: string;
    value: number;
};
export interface ThermometerInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "thermometer";
    valueKey: string;
    userInterfaceData: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    iconType: IconType;
    strokeColor: string;
    strokeWidth: number;
    fillColor: string;
    height: number;
    thermometerLabel?: string;
    absoluteValueKey?: string;
}
export interface ThermometerInterfaceComponentState {
    loading: boolean;
}
//# sourceMappingURL=types.d.ts.map