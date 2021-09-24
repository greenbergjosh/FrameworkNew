"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var base_component_form_1 = require("../../base/base-component-form");
exports.uploadManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(uploadManageFormDefinition, extend));
};
var uploadManageFormDefinition = [
    {
        key: "base",
        components: [
            {
                key: "tabs",
                tabs: [
                    {
                        key: "data",
                        components: [
                            {
                                key: "label",
                                defaultValue: "Upload File",
                            },
                            {
                                key: "valueKey",
                                defaultValue: "value",
                            },
                            {
                                key: "hideLabel",
                                defaultValue: true,
                            },
                            {
                                key: "uploadUrl",
                                valueKey: "uploadUrl",
                                component: "input",
                                // Testing URL: https://www.mocky.io/v2/5cc8019d300000980a055e76
                                // Testing URL: https://aspnetmvc.syncfusion.com/services/api/uploadbox/Save
                                defaultValue: "https://",
                                label: "Upload URL",
                                help: "URL for the service that receives the uploaded file.",
                            },
                            {
                                key: "removeUrl",
                                valueKey: "removeUrl",
                                component: "input",
                                // Testing URL: https://aspnetmvc.syncfusion.com/services/api/uploadbox/Remove
                                defaultValue: "https://",
                                label: "Remove URL",
                                help: "URL for the service that removes an uploaded file.",
                            },
                            {
                                key: "chunkSize",
                                valueKey: "chunkSize",
                                ordinal: 11,
                                component: "number-input",
                                defaultValue: 500000,
                                label: "Max chunk size (bytes)",
                                help: "Maximum size in bytes of chunks that are sent to the server.",
                            },
                            {
                                key: "maxFileSize",
                                valueKey: "maxFileSize",
                                ordinal: 11,
                                component: "select",
                                label: "Max file size",
                                defaultValue: "50000000",
                                dataHandlerType: "local",
                                help: "Maximum file size in bytes.",
                                data: {
                                    values: [
                                        {
                                            label: "1 MB",
                                            value: "1000000",
                                        },
                                        {
                                            label: "10 MB",
                                            value: "10000000",
                                        },
                                        {
                                            label: "50 MB",
                                            value: "50000000",
                                        },
                                        {
                                            label: "100 MB",
                                            value: "100000000",
                                        },
                                        {
                                            label: "500 MB",
                                            value: "500000000",
                                        },
                                        {
                                            label: "1 GB",
                                            value: "1000000000",
                                        },
                                        {
                                            label: "2 GB",
                                            value: "2000000000",
                                        },
                                        {
                                            label: "3 GB",
                                            value: "3000000000",
                                        },
                                        {
                                            label: "4 GB",
                                            value: "4000000000",
                                        },
                                        {
                                            label: "5 GB",
                                            value: "5000000000",
                                        },
                                        {
                                            label: "10 GB",
                                            value: "10000000000",
                                        },
                                    ],
                                },
                            },
                            {
                                key: "retryCount",
                                valueKey: "retryCount",
                                ordinal: 12,
                                component: "number-input",
                                defaultValue: 3,
                                label: "Retry count",
                                help: "Maximum upload retry attempts on network failure.",
                            },
                            {
                                key: "retryAfterDelay",
                                valueKey: "retryAfterDelay",
                                ordinal: 13,
                                component: "number-input",
                                defaultValue: 500,
                                label: "Retry delay (ms)",
                                help: "Milliseconds to wait between each retry.",
                            },
                            {
                                key: "headers",
                                valueKey: "headers.values",
                                label: "Add Headers",
                                component: "data-map",
                                defaultValue: [],
                                multiple: true,
                                help: "Provide header parameter name and API key pairs to send data to the server with the upload.",
                                keyComponent: {
                                    label: "Param Name",
                                    component: "input",
                                    valueKey: "paramName",
                                },
                                valueComponent: {
                                    label: "API Key",
                                    component: "input",
                                    valueKey: "apiKey",
                                },
                            },
                        ],
                    },
                    {
                        key: "appearance",
                        components: [
                            {
                                key: "standaloneButton",
                                valueKey: "standaloneButton",
                                component: "toggle",
                                defaultValue: true,
                                label: "Standalone Button?",
                                help: "Should the button be shown by itself? Best for row display.",
                            },
                            {
                                key: "standaloneButtonLabel",
                                valueKey: "standaloneButtonLabel",
                                component: "input",
                                defaultValue: "Upload",
                                label: "Standalone Button Label",
                                help: "Button label when only the button appears.",
                                visibilityConditions: {
                                    "===": [true, { var: "standaloneButton" }],
                                },
                            },
                            {
                                key: "dndButtonLabel",
                                valueKey: "dndButtonLabel",
                                component: "input",
                                defaultValue: "Browse...",
                                label: "Normal Button Label",
                                help: "Button label when drag-and-drop is enabled.",
                                visibilityConditions: {
                                    "!==": [true, { var: "standaloneButton" }],
                                },
                            },
                            {
                                key: "autoUpload",
                                valueKey: "autoUpload",
                                component: "toggle",
                                defaultValue: true,
                                label: "Auto start upload",
                                help: "Should the upload start automatically after a file is chosen?",
                                visibilityConditions: {
                                    "!==": [true, { var: "standaloneButton" }],
                                },
                            },
                            {
                                key: "showFileList",
                                valueKey: "showFileList",
                                component: "toggle",
                                defaultValue: false,
                                label: "Show Files",
                                help: "Show the uploaded files list?",
                            },
                            {
                                key: "allowMultiple",
                                valueKey: "allowMultiple",
                                component: "toggle",
                                defaultValue: false,
                                label: "Multiple uploads",
                                help: "Allow multiple simultaneous uploads?",
                            },
                            {
                                key: "accept",
                                valueKey: "accept",
                                component: "select",
                                label: "Accept File Type",
                                defaultValue: "",
                                dataHandlerType: "local",
                                data: {
                                    // See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
                                    values: [
                                        {
                                            label: "Any type (*)",
                                            value: "",
                                            mime: "*",
                                        },
                                        {
                                            label: "Comma-separated values (csv)",
                                            value: ".csv",
                                            mime: "text/csv",
                                        },
                                        {
                                            label: "Images (jpg, png, gif, tiff, etc.)",
                                            value: ".jpg,.png,.gif,.tif,.tiff",
                                            mime: "image/*",
                                        },
                                        {
                                            label: "Microsoft Excel (xls, xlsx)",
                                            value: ".xls,.xlsx",
                                            mime: "application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                        },
                                        {
                                            label: "Microsoft PowerPoint (ppt, pptx)",
                                            value: ".ppt,.pptx",
                                            mime: "application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation",
                                        },
                                        {
                                            label: "Microsoft Word (doc, docx)",
                                            value: ".doc,.docx",
                                            mime: "application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                        },
                                        {
                                            label: "Adobe Portable Document Format (pdf)",
                                            value: ".pdf",
                                            mime: "application/pdf",
                                        },
                                        {
                                            label: "ZIP archive",
                                            value: ".zip",
                                            mime: "application/zip, application/x-zip-compressed",
                                        },
                                        {
                                            label: "Other (not listed)",
                                            value: "other",
                                            mime: "",
                                        },
                                    ],
                                },
                            },
                            {
                                key: "acceptOther",
                                valueKey: "acceptOther",
                                component: "input",
                                defaultValue: "",
                                label: "Other Type",
                                visibilityConditions: {
                                    "===": ["other", { var: "accept" }],
                                },
                                help: "Enter a filename with wildcards (e.g., *.txt), or a MIME type (e.g., application/pdf)",
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
//# sourceMappingURL=upload-manage-form.js.map