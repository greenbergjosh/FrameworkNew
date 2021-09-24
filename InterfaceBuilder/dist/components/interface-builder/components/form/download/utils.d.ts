import { ParamKVPMapsType } from "components/interface-builder/components/form/download/types";
import { JSONRecord } from "components/interface-builder/@types/JSONTypes";
import { UserInterfaceProps } from "components/interface-builder/UserInterface";
/**
 *
 * @param url
 * @param params
 * @param configOverrides
 */
export declare function postData(url?: string, params?: {}, configOverrides?: {}): Promise<{
    headers: Headers;
    data: Blob;
}>;
/**
 *
 * @param useFilenameFromServer
 * @param response
 * @param filename
 */
export declare function getFilename(useFilenameFromServer: boolean, response: {
    headers: Headers;
    data: Blob;
}, filename: string): string;
/**
 * Convert param definitions to params hash
 * @param paramKVPMaps
 * @param userInterfaceData
 * @param paramsValueKey
 * @deprecated
 */
export declare function convertParamKVPMapsToParams(paramKVPMaps: ParamKVPMapsType, userInterfaceData: UserInterfaceProps["data"], paramsValueKey?: string): JSONRecord;
//# sourceMappingURL=utils.d.ts.map