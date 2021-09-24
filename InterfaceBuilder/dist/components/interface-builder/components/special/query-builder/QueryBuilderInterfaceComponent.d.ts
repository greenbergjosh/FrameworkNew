import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { OnChangePayloadType, QueryBuilderInterfaceComponentProps, QueryBuilderInterfaceComponentState } from "./types";
export declare class QueryBuilderInterfaceComponent extends BaseInterfaceComponent<QueryBuilderInterfaceComponentProps, QueryBuilderInterfaceComponentState> {
    static defaultProps: {
        valueKey: string;
        defaultValue: {};
    };
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        formControl: boolean;
        componentDefinition: {
            component: string;
            label: string;
        };
    };
    static manageForm: (...extend: (Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps> | Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    constructor(props: QueryBuilderInterfaceComponentProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Readonly<QueryBuilderInterfaceComponentProps>): void;
    /**
     * Get the JsonGroup (persisted qbData) from userInterfaceData
     */
    private updateQbDataJsonGroup;
    /**
     * Get the schema from userInterfaceData
     * @param rawSchema
     */
    private updateSchema;
    /**
     * Creates a list of queryable fields and exposes it on userInterfaceData
     * @param schema
     */
    private exposeQueryableFields;
    /**
     * Output changes from QueryBuilder to userInterfaceData
     */
    handleChange: ({ jsonLogic: nextJsonLogic, data, errors, qbDataJsonGroup: nextQbDataJsonGroup, }: OnChangePayloadType) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=QueryBuilderInterfaceComponent.d.ts.map