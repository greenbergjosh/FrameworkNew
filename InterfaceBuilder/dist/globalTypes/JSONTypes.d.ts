export interface JSONRecord {
    [k: string]: JSONType | undefined;
}
export interface JSONArray extends Array<JSONType> {
}
export declare type JSONType = null | string | number | boolean | JSONArray | JSONRecord;
//# sourceMappingURL=JSONTypes.d.ts.map