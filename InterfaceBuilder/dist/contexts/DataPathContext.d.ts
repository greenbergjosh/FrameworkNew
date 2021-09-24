interface DataPathContextProps {
    path?: string | number;
    reset?: boolean;
    children: JSX.Element | ((path: string) => JSX.Element) | ((path: string) => JSX.Element[]);
}
export declare const DataPathContext: ({ path, reset, children }: DataPathContextProps) => JSX.Element;
export {};
//# sourceMappingURL=DataPathContext.d.ts.map