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
exports.moveInList = function (list, originIndex, destinationIndex) {
    if (originIndex < destinationIndex) {
        return __spread(list.slice(0, originIndex), list.slice(originIndex + 1, destinationIndex + 1), [
            list[originIndex]
        ], list.slice(destinationIndex + 1));
    }
    else {
        return __spread(list.slice(0, destinationIndex), [
            list[originIndex]
        ], list.slice(destinationIndex, originIndex), list.slice(originIndex + 1));
    }
};
//# sourceMappingURL=move-in-list.js.map