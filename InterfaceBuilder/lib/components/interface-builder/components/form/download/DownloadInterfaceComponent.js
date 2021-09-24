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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var antd_1 = require("antd");
var fp_1 = require("lodash/fp");
var react_1 = __importDefault(require("react"));
var download_manage_form_1 = require("./download-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var js_file_download_1 = __importDefault(require("js-file-download"));
var DownloadInterfaceComponent = /** @class */ (function (_super) {
    __extends(DownloadInterfaceComponent, _super);
    function DownloadInterfaceComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.handleClick = function (_a) {
            var target = _a.target;
            var _b = _this.props, onChangeData = _b.onChangeData, userInterfaceData = _b.userInterfaceData, paramsValueKey = _b.paramsValueKey, url = _b.url, httpMethod = _b.httpMethod, useFilenameFromServer = _b.useFilenameFromServer, filename = _b.filename;
            var params = fp_1.get(paramsValueKey, userInterfaceData) || {};
            var config = {
                method: httpMethod,
                body: httpMethod !== "GET" && Object.keys(params).length > 0 ? JSON.stringify(params) : {},
            };
            /*
             * Fetch file data from the server
             * and then trigger a download on the client
             */
            _this.setState({ isDownloading: true });
            postData(url, params, config)
                .then(function (response) {
                // Success! We have file data. Now trigger browser to save it to a file.
                var filenameFixed = getFilename(useFilenameFromServer, response, filename);
                js_file_download_1.default(response.data, filenameFixed);
            })
                .catch(function () {
                antd_1.message.error("There was an error downloading the file.");
            })
                .finally(function () { return _this.setState({ isDownloading: false }); });
        };
        _this.state = {
            isDownloading: false,
        };
        return _this;
    }
    DownloadInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "download",
            title: "Download",
            icon: "download",
            formControl: true,
            componentDefinition: {
                component: "download",
            },
        };
    };
    DownloadInterfaceComponent.prototype.render = function () {
        var _a = this.props, defaultValue = _a.defaultValue, userInterfaceData = _a.userInterfaceData, paramsValueKey = _a.paramsValueKey, buttonLabel = _a.buttonLabel, icon = _a.icon, hideButtonLabel = _a.hideButtonLabel, shape = _a.shape, size = _a.size, displayType = _a.displayType, block = _a.block, ghost = _a.ghost;
        var isCircle = shape === "circle" || shape === "circle-outline";
        var buttonShape = displayType !== "link" ? shape : undefined;
        var rawValue = fp_1.get(paramsValueKey, userInterfaceData);
        var value = typeof rawValue !== "undefined" ? rawValue : defaultValue;
        return (react_1.default.createElement(antd_1.Tooltip, { title: hideButtonLabel || isCircle ? buttonLabel : null },
            react_1.default.createElement(antd_1.Button, { onClick: this.handleClick, loading: this.state.isDownloading, value: value, icon: icon, shape: buttonShape, size: size, type: displayType, block: block, ghost: ghost }, !hideButtonLabel && !isCircle ? buttonLabel : null)));
    };
    DownloadInterfaceComponent.manageForm = download_manage_form_1.downloadManageForm;
    return DownloadInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.DownloadInterfaceComponent = DownloadInterfaceComponent;
/***********************************
 * Private Functions
 */
function postData(url, params, configOverrides) {
    if (url === void 0) { url = ""; }
    if (params === void 0) { params = {}; }
    if (configOverrides === void 0) { configOverrides = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(url, __assign({ method: "GET", mode: "cors", cache: "no-cache", credentials: "same-origin", headers: {
                            "Content-Type": "application/json",
                        }, redirect: "follow", referrerPolicy: "no-referrer", body: "" }, configOverrides))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.blob()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, {
                            headers: response.headers,
                            data: data,
                        }];
            }
        });
    });
}
function getFilename(useFilenameFromServer, response, filename) {
    var filenameFixed = useFilenameFromServer
        ? getFilenameFromHeaders(response.headers, filename)
        : filename;
    return filenameFixed;
}
function getFilenameFromHeaders(headers, defaultFilename) {
    var filename = "";
    var disposition = headers.get("content-disposition");
    if (disposition && disposition.indexOf("attachment") !== -1) {
        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        var matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, "");
        }
    }
    var fixedDefaultFilename = defaultFilename && defaultFilename.length > 0 ? defaultFilename : "download";
    return filename && filename.length > 0 && filename.indexOf(".") > -1
        ? filename
        : fixedDefaultFilename;
}
//# sourceMappingURL=DownloadInterfaceComponent.js.map