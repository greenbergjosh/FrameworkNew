declare const _default: {
    type: string;
    bbox: number[];
    transform: {
        scale: number[];
        translate: number[];
    };
    objects: {
        states: {
            type: string;
            geometries: ({
                type: string;
                arcs: number[][][];
                id: string;
                properties: {
                    name: string;
                };
            } | {
                type: string;
                arcs: number[][];
                id: string;
                properties: {
                    name: string;
                };
            })[];
        };
        nation: {
            type: string;
            geometries: {
                type: string;
                arcs: number[][][];
            }[];
        };
    };
    arcs: number[][][];
};
export default _default;
//# sourceMappingURL=states-10m.d.ts.map