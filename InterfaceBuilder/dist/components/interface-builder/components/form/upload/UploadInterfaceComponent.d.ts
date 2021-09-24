import { UserInterfaceProps } from "../../../UserInterface";
import { PauseResumeEventArgs, RemovingEventArgs, UploaderComponent, UploadingEventArgs } from "@syncfusion/ej2-react-inputs";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
import "./upload.module.scss";
/******************************
 * Interfaces, Types, Enums
 */
export interface UploadInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "upload";
    defaultValue?: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    userInterfaceSchema?: any;
    valueKey: string;
    accept: string;
    acceptOther?: string;
    allowMultiple: boolean;
    autoUpload: boolean;
    chunkSize: number;
    maxFileSize: string;
    removeUrl: string;
    retryAfterDelay: number;
    retryCount: number;
    uploadUrl: string;
    headers: {
        values: [{
            paramName: string;
            apiKey: string;
        }];
    };
    showFileList: boolean;
    standaloneButton: boolean;
    standaloneButtonLabel: string;
    dndButtonLabel: string;
}
interface UploadInterfaceComponentState {
    isUploading: boolean;
}
/******************************
 * Component
 */
export declare class UploadInterfaceComponent extends BaseInterfaceComponent<UploadInterfaceComponentProps, UploadInterfaceComponentState> {
    uploadObj: UploaderComponent | undefined;
    private isInteraction;
    private browseButtonLabel;
    static defaultProps: {
        valueKey: string;
        defaultValue: string;
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
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    constructor(props: UploadInterfaceComponentProps);
    componentDidUpdate(prevProps: Readonly<UploadInterfaceComponentProps>, prevState: Readonly<{}>): void;
    /******************************
     * Event Handlers
     */
    /**
     * Not sure what this is doing, copied from Syncfusion example
     * @param args
     */
    onRemoveFile: (args?: RemovingEventArgs | undefined) => void;
    /**
     * Update flag variable value for automatic pause and resume
     * @param args
     */
    onPausing: (args?: PauseResumeEventArgs | undefined) => void;
    /**
     * Update flag variable value for automatic pause and resume
     * @param args
     */
    onResuming: (args?: PauseResumeEventArgs | undefined) => void;
    /**
     * Triggers when the AJAX request fails on uploading or removing files.
     * Prevent triggering chunk-upload failure event
     * and to pause uploading on network failure
     * @param args
     */
    onChunkFailure: (args: any) => void;
    /**
     * Pause upload and notify user
     * @param args
     */
    onFailure: (args?: {} | undefined) => void;
    /**
     * Save data and notify user. Fires on upload success or remove success.
     * @param args
     */
    onSuccess: (args?: any) => void;
    /**
     * Add custom request headers to upload
     * @param args
     */
    onUploading: (args?: UploadingEventArgs | undefined) => void;
    /**
     * Configure appearance
     */
    onCreated: () => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=UploadInterfaceComponent.d.ts.map