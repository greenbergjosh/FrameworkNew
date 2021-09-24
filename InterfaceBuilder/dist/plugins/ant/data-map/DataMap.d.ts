interface DataItem {
}
export interface DataMapProps {
    count?: number;
    data: DataItem[];
    keyLabel: string;
    onDataChanged: (data: DataMapProps["data"]) => void;
    multiple?: boolean;
    renderKeyComponent: (item: DataItem, onChange: (item: DataItem) => void) => JSX.Element | JSX.Element[];
    renderValueComponent: (item: DataItem, onChange: (item: DataItem) => void) => JSX.Element | JSX.Element[];
    valueLabel: string;
}
export declare const DataMap: {
    ({ count, data, keyLabel, onDataChanged, multiple, renderKeyComponent, renderValueComponent, valueLabel, }: DataMapProps): JSX.Element;
    defaultProps: {
        data: never[];
        keyLabel: string;
        valueLabel: string;
    };
};
export {};
//# sourceMappingURL=DataMap.d.ts.map