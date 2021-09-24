export interface Codec {
    type: string;
    join: JoinerType;
    split: SplitterType;
}
declare type SplitterType = (value: string) => string[];
declare type JoinerType = (value: string[]) => string;
export declare enum separator {
    newline = "newline",
    comma = "comma"
}
export declare function getCodec(type: separator): Codec;
export {};
//# sourceMappingURL=codec.d.ts.map