import { Point } from "react-simple-maps";
import { ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes";
declare type FeatureType = {
    type: string;
    id?: string;
    properties: {
        name: string;
    };
    geometry: {
        type: string;
        coordinates: any[];
    };
};
export declare type MapType = {
    type: string;
    features: FeatureType[];
};
export interface MapInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "map";
    valueKey: string;
    userInterfaceData: UserInterfaceProps["data"];
    width?: number;
    mapType: string;
    markerFillColor?: string;
    markerLimit?: number;
}
export declare type MarkerType = {
    latitude: string;
    longitude: string;
    magnitude: number;
    name: string;
    percentage: string;
};
export interface MapInterfaceComponentState {
    markers?: MarkerType[];
    loading: boolean;
}
export declare type PositionType = {
    coordinates: Point;
    zoom: number;
};
export interface MapChartProps {
    markers?: MarkerType[];
    markerFillColor?: string;
}
export interface MagnitudeMarkerProps {
    marker: MarkerType;
    color?: string;
    projection: any;
}
export interface StateNameMarkerProps {
    geo: any;
}
/**
 * Validate Marker
 * @param marker
 * @return boolean
 */
export declare function isMarker(marker: MarkerType): boolean;
export {};
//# sourceMappingURL=types.d.ts.map