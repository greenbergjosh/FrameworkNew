"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function ObjectIs(x, y) {
    return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
}
function isPOJO(obj) {
    if (typeof obj !== "object" || obj === null)
        return false;
    var proto = Object.getPrototypeOf(obj);
    return proto === Object.prototype || proto === null;
}
exports.isPOJO = isPOJO;
function isShallowEqual(a, b) {
    if ((isPOJO(a) && isPOJO(b)) || (Array.isArray(a) && Array.isArray(b))) {
        if (ObjectIs(a, b))
            return true;
        if (Object.keys(a).length !== Object.keys(b).length)
            return false;
        // @ts-ignore
        for (var k in a)
            if (!ObjectIs(a[k], b[k]))
                return false;
        return true;
    }
    return ObjectIs(a, b);
}
exports.isShallowEqual = isShallowEqual;
//# sourceMappingURL=isShallowEqual.js.map