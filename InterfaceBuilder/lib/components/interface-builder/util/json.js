"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function prettyPrint(value) {
    return JSON.stringify(value, null, 2);
}
exports.prettyPrint = prettyPrint;
function cheapHash(value) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    // console.log("json.cheapHash", { value, rest })
    return JSON.stringify(value).concat(rest.map(function (x) { return JSON.stringify(x); }).join(""));
}
exports.cheapHash = cheapHash;
//# sourceMappingURL=json.js.map