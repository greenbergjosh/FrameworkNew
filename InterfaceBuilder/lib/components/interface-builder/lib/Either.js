"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("fp-ts/lib/Either"));
/**
 * useful for onLeft handler of Either.fold()
 */
function Left(onLeft) {
    return onLeft;
}
exports.Left = Left;
/**
 * useful for onRight handler of Either.fold()
 */
function Right(onRight) {
    return onRight;
}
exports.Right = Right;
//# sourceMappingURL=Either.js.map