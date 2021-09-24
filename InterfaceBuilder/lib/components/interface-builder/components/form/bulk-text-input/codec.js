"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var separator;
(function (separator) {
    separator["newline"] = "newline";
    separator["comma"] = "comma";
})(separator = exports.separator || (exports.separator = {}));
var newline = {
    type: separator.newline,
    join: getJoiner(joinWithNewline),
    split: getSplitter(splitByNewline),
};
var comma = {
    type: separator.comma,
    join: getJoiner(joinWithComma),
    split: getSplitter(splitByComma),
};
function getCodec(type) {
    switch (type) {
        case separator.comma:
            return comma;
        default:
            return newline;
    }
}
exports.getCodec = getCodec;
function joinWithNewline(joined, item) {
    return joined + "\n" + item;
}
function joinWithComma(joined, item) {
    if (item.length === 0) {
        return joined + ",";
    }
    return joined + ", " + item;
}
function splitByNewline(value) {
    return value.split("\n");
}
function splitByComma(value) {
    return value.split(/\s*,|\s*,\s/);
}
function getJoiner(joinStrategy) {
    return function (value) {
        if (typeof value === "undefined") {
            return "";
        }
        if (Array.isArray(value)) {
            return value.reduce(joinStrategy);
        }
        return "";
    };
}
function getSplitter(splitStrategy) {
    return function (value) {
        return splitStrategy(value).map(function (item) { return item.trimStart(); });
    };
}
//# sourceMappingURL=codec.js.map