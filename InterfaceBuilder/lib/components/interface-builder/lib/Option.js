"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("fp-ts/lib/Option"));
/**
 * useful for onLeft handler of Option.foldL()
 */
function None(onNone) {
    return onNone;
}
exports.None = None;
/**
 * useful for onSome handler of Option.fold/foldL()
 */
function Some(onSome) {
    return onSome;
}
exports.Some = Some;
//# sourceMappingURL=Option.js.map