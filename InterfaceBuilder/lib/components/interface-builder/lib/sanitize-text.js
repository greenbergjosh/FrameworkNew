"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var badChars = {
    "<": "lt",
    ">": "gt",
    '"': "quot",
    "'": "apos",
    "&": "amp",
    "\r": "#10",
    "\n": "#13",
};
exports.sanitizeText = function (text) {
    return String(text).replace(/[<>"'\r\n&]/g, function (chr) { return "&" + badChars[chr] + ";"; });
};
//# sourceMappingURL=sanitize-text.js.map