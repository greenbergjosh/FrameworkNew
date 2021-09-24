"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shallowPropCheck = function (propsToCheck) { return function (prevProps, nextProps) {
    return propsToCheck.every(function (p) { return prevProps[p] === nextProps[p]; });
}; };
//# sourceMappingURL=shallow-prop-check.js.map