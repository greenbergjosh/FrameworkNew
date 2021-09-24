"use strict";
// const VALUE_CREATED = "created"
// const VALUE_UPDATED = "updated"
// const VALUE_DELETED = "deleted"
// const VALUE_UNCHANGED = "unchanged"
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
// export interface DeepDiffItem {
//   type: "created" | "updated" | "deleted" | "unchanged"
//   data: any
// }
// export type DeepDiffResult =
//   | DeepDiffItem
//   | {
//       [key: string]: DeepDiffItem
//     }
// export const deepDiff = (obj1: any, obj2: any): DeepDiffResult => {
//   if (isValue(obj1) || isValue(obj2) || isFunction(obj1) || isFunction(obj2)) {
//     return {
//       type: compareValues(obj1, obj2),
//       data: obj1 === undefined ? obj2 : obj1,
//     }
//   }
//   var diff = {} as { [key: string]: any }
//   for (var key in obj1) {
//     var value2 = undefined
//     if ("undefined" != typeof obj2[key]) {
//       value2 = obj2[key]
//     }
//     diff[key] = deepDiff(obj1[key], value2)
//   }
//   for (var key in obj2) {
//     if ("undefined" != typeof diff[key]) {
//       continue
//     }
//     diff[key] = deepDiff(undefined, obj2[key])
//   }
//   return diff
// }
// const compareValues = (value1: any, value2: any) => {
//   if (value1 === value2) {
//     return VALUE_UNCHANGED
//   }
//   if (isDate(value1) && isDate(value2) && value1.getTime() === value2.getTime()) {
//     return VALUE_UNCHANGED
//   }
//   if ("undefined" == typeof value1) {
//     return VALUE_CREATED
//   }
//   if ("undefined" == typeof value2) {
//     return VALUE_DELETED
//   }
//   return VALUE_UPDATED
// }
// const isFunction = (obj: any) => {
//   return Object.prototype.toString.apply(obj) === "[object Function]"
// }
// const isObject = (obj: any) => {
//   return Object.prototype.toString.apply(obj) === "[object Object]"
// }
// const isDate = (obj: any): obj is Date => {
//   return Object.prototype.toString.apply(obj) === "[object Date]"
// }
// const isValue = (obj: any) => {
//   return !isObject(obj) && !Array.isArray(obj)
// }
function deepDiff(oldVal, newVal, ignoreProp) {
    if (ignoreProp === void 0) { ignoreProp = defaultIgnoreProp; }
    // Check simple primitives
    if (!oldVal || !newVal || typeof oldVal !== "object" || typeof newVal !== "object") {
        if (oldVal !== newVal) {
            // If they're not the same
            return { previous: oldVal, next: newVal };
        }
        // If they are the same
        return null;
    }
    // Both must be objects, so we need to accumulate their keys
    var keys = __spread(new Set(Object.keys(oldVal).concat(Object.keys(newVal))));
    // If there are no changes anywhere down in the object, report null for the whole object
    var foundNonNull = false;
    // Iterate over the keys, collecting changes
    var result = keys.reduce(function (acc, key) {
        // Old and new values of prop
        var o = oldVal[key];
        var n = newVal[key];
        // If the objects are not the same reference
        if (o !== n && !ignoreProp(key, o, n)) {
            var d = deepDiff(o, n, ignoreProp);
            foundNonNull = foundNonNull || !!d;
            if (d) {
                acc[key] = d;
            }
        }
        return acc;
    }, {});
    return foundNonNull ? result : null;
}
exports.deepDiff = deepDiff;
function defaultIgnoreProp(key, newVal, oldVal) {
    return false;
}
//# sourceMappingURL=deep-diff.js.map