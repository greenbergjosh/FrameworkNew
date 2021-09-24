"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var antd_1 = require("antd");
var fp_1 = require("lodash/fp");
var upload_manage_form_1 = require("./upload-manage-form");
var ej2_react_inputs_1 = require("@syncfusion/ej2-react-inputs");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
require("./upload.scss");
function getAcceptType(accept, acceptOther) {
    var acceptType = accept;
    if (accept === "other") {
        if (typeof acceptOther !== "undefined") {
            acceptType = acceptOther;
        }
        else {
            acceptType = "";
        }
    }
    return acceptType;
}
/******************************
 * Component
 */
var UploadInterfaceComponent = /** @class */ (function (_super) {
    __extends(UploadInterfaceComponent, _super);
    function UploadInterfaceComponent(props) {
        var _this = _super.call(this, props) || this;
        /******************************
         * Event Handlers
         */
        /**
         * Not sure what this is doing, copied from Syncfusion example
         * @param args
         */
        _this.onRemoveFile = function (args) {
            if (args) {
                args.postRawFile = false;
            }
        };
        /**
         * Update flag variable value for automatic pause and resume
         * @param args
         */
        _this.onPausing = function (args) {
            var hasEvent = !!args && args.event !== null;
            _this.isInteraction = hasEvent && !navigator.onLine;
            _this.setState({ isUploading: false });
        };
        /**
         * Update flag variable value for automatic pause and resume
         * @param args
         */
        _this.onResuming = function (args) {
            var hasEvent = !!args && args.event !== null;
            _this.isInteraction = hasEvent && !navigator.onLine;
            _this.setState({ isUploading: true });
        };
        /**
         * Triggers when the AJAX request fails on uploading or removing files.
         * Prevent triggering chunk-upload failure event
         * and to pause uploading on network failure
         * @param args
         */
        _this.onChunkFailure = function (args) {
            var _a;
            console.warn("ResumableUpload", "onChunkFailure!", "args", args, "this.uploadObj.filesData[0].statusCode", (_a = _this.uploadObj) === null || _a === void 0 ? void 0 : _a.filesData[0].statusCode);
            var isNetworkResumed = function () {
                var _a, _b;
                // Note: statusCode - Returns the current state of the file
                // such as Failed, Canceled, Selected, Uploaded, or Uploading.
                var hasCode4 = ((_b = (_a = _this.uploadObj) === null || _a === void 0 ? void 0 : _a.filesData[0]) === null || _b === void 0 ? void 0 : _b.statusCode) === "4";
                return navigator.onLine && hasCode4;
            };
            var isNetworkOffline = function () {
                var _a, _b;
                // Note: statusCode - Returns the current state of the file
                // such as Failed, Canceled, Selected, Uploaded, or Uploading.
                var hasCode3 = ((_b = (_a = _this.uploadObj) === null || _a === void 0 ? void 0 : _a.filesData[0]) === null || _b === void 0 ? void 0 : _b.statusCode) === "3";
                return !_this.isInteraction && hasCode3;
            };
            var getCallback = function () {
                return function () {
                    var _a, _b;
                    if (isNetworkResumed()) {
                        (_a = _this.uploadObj) === null || _a === void 0 ? void 0 : _a.resume(_this.uploadObj.filesData);
                        // Clear Interval after when network is available.
                        clearSetInterval();
                        antd_1.message.info("Network restored. Resuming upload.");
                    }
                    else if (isNetworkOffline()) {
                        (_b = _this.uploadObj) === null || _b === void 0 ? void 0 : _b.pause(_this.uploadObj.filesData);
                        antd_1.message.warn("Network has gone offline. Upload will resume when you reconnect.");
                    }
                };
            };
            args.cancel = !_this.isInteraction;
            // Check network availability every 500 milliseconds
            var clearTimeInterval = setInterval(getCallback(), 500);
            var clearSetInterval = function () {
                clearInterval(clearTimeInterval);
            };
        };
        /**
         * Pause upload and notify user
         * @param args
         */
        _this.onFailure = function (args) {
            var _a;
            var failureEventArgs = args;
            (_a = _this.uploadObj) === null || _a === void 0 ? void 0 : _a.pause(_this.uploadObj.filesData);
            _this.setState({ isUploading: false });
            console.warn("Upload", "onFailure!", "args", failureEventArgs, "this.uploadObj", _this.uploadObj);
            antd_1.message.warn("Something is wrong with the network. Upload will resume when the network is restored.");
        };
        /**
         * Save data and notify user. Fires on upload success or remove success.
         * @param args
         */
        _this.onSuccess = function (args) {
            var _a, _b;
            var successEventArgs = args;
            var _c = _this.props, onChangeData = _c.onChangeData, userInterfaceData = _c.userInterfaceData, valueKey = _c.valueKey;
            _this.setState({ isUploading: false });
            if (((_a = successEventArgs) === null || _a === void 0 ? void 0 : _a.operation) === "upload") {
                // File was uploaded
                onChangeData &&
                    onChangeData(fp_1.set(valueKey, _this.uploadObj && _this.uploadObj.filesData, userInterfaceData));
                antd_1.message.success("Upload completed");
            }
            else if (((_b = successEventArgs) === null || _b === void 0 ? void 0 : _b.operation) === "remove") {
                // File was removed
                onChangeData && onChangeData(fp_1.set(valueKey, null, userInterfaceData));
                antd_1.message.success("Upload deleted from the server");
            }
        };
        /**
         * Add custom request headers to upload
         * @param args
         */
        _this.onUploading = function (args) {
            var _a = _this.props, onChangeData = _a.onChangeData, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey, headers = _a.headers;
            _this.setState({ isUploading: true });
            // Exit if no headers to add
            if (headers.values.length < 1) {
                return;
            }
            // Add custom request headers
            var currentRequest = args && args.currentRequest;
            headers.values.map(function (header) {
                var _a;
                var value = fp_1.getOr(null, header.apiKey, userInterfaceData);
                (_a = currentRequest) === null || _a === void 0 ? void 0 : _a.setRequestHeader(header.paramName, value);
            });
        };
        /**
         * Configure appearance
         */
        _this.onCreated = function () {
            if (_this.props.standaloneButton && _this.uploadObj) {
                _this.uploadObj.dropArea = "";
            }
        };
        _this.isInteraction = false;
        _this.browseButtonLabel = _this.props.standaloneButton
            ? _this.props.standaloneButtonLabel
            : _this.props.dndButtonLabel;
        _this.state = {
            isUploading: false,
        };
        return _this;
    }
    UploadInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "upload",
            title: "Upload",
            icon: "upload",
            formControl: true,
            componentDefinition: {
                component: "upload",
                label: "Upload",
            },
        };
    };
    UploadInterfaceComponent.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (this.props.standaloneButton !== prevProps.standaloneButton ||
            this.props.dndButtonLabel !== prevProps.dndButtonLabel ||
            this.props.standaloneButtonLabel !== prevProps.standaloneButtonLabel) {
            this.browseButtonLabel = this.props.standaloneButton
                ? this.props.standaloneButtonLabel
                : this.props.dndButtonLabel;
        }
    };
    UploadInterfaceComponent.prototype.render = function () {
        var _this = this;
        var _a = this.props, 
        /* IB Props */
        defaultValue = _a.defaultValue, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey, label = _a.label, 
        /* Upload Props */
        accept = _a.accept, acceptOther = _a.acceptOther, allowMultiple = _a.allowMultiple, autoUpload = _a.autoUpload, chunkSize = _a.chunkSize, maxFileSize = _a.maxFileSize, removeUrl = _a.removeUrl, retryAfterDelay = _a.retryAfterDelay, retryCount = _a.retryCount, uploadUrl = _a.uploadUrl, showFileList = _a.showFileList, standaloneButton = _a.standaloneButton, dndButtonLabel = _a.dndButtonLabel, standaloneButtonLabel = _a.standaloneButtonLabel;
        var acceptType = getAcceptType(accept, acceptOther);
        return (react_1.default.createElement("div", { className: standaloneButton ? "hideDropArea" : "" },
            react_1.default.createElement("span", null, acceptType && "Accepts " + acceptType + " files only."),
            react_1.default.createElement(antd_1.Spin, { spinning: this.state.isUploading && !showFileList },
                react_1.default.createElement(ej2_react_inputs_1.UploaderComponent, { id: "chunkUpload", type: "file", ref: function (scope) {
                        if (scope) {
                            _this.uploadObj = scope;
                        }
                    }, 
                    /*
                     * Upload Props */
                    allowedExtensions: acceptType, asyncSettings: {
                        saveUrl: uploadUrl,
                        removeUrl: removeUrl,
                        chunkSize: chunkSize,
                        retryCount: retryCount,
                        retryAfterDelay: retryAfterDelay,
                    }, autoUpload: autoUpload, multiple: allowMultiple, maxFileSize: parseInt(maxFileSize), 
                    /*
                     * Appearance */
                    showFileList: showFileList, buttons: {
                        browse: standaloneButton ? standaloneButtonLabel : dndButtonLabel,
                    }, 
                    /*
                     * Events */
                    removing: this.onRemoveFile, pausing: this.onPausing, resuming: this.onResuming, chunkFailure: this.onChunkFailure, failure: this.onFailure, success: this.onSuccess, uploading: this.onUploading, created: this.onCreated }))));
    };
    UploadInterfaceComponent.defaultProps = {
        valueKey: "value",
        defaultValue: "",
    };
    UploadInterfaceComponent.manageForm = upload_manage_form_1.uploadManageForm;
    return UploadInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.UploadInterfaceComponent = UploadInterfaceComponent;
//# sourceMappingURL=UploadInterfaceComponent.js.map