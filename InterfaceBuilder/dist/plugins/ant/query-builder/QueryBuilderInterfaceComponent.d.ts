import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { OnChangePayloadType, QueryBuilderInterfaceComponentProps, QueryBuilderInterfaceComponentState } from "./types";
import { LayoutDefinition } from "../../../globalTypes";
export declare class QueryBuilderInterfaceComponent extends BaseInterfaceComponent<QueryBuilderInterfaceComponentProps, QueryBuilderInterfaceComponentState> {
    static defaultProps: {
        valueKey: string;
        defaultValue: {};
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
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