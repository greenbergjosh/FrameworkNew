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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
exports.registry = {
    cache: {},
    lookup: function (key) {
        return exports.registry.cache[key];
    },
    /**
     * Adds third-party components to the registry
     * @param updatedRegistry
     */
    register: function (updatedRegistry) {
        Object.entries(updatedRegistry).forEach(function (_a) {
            var _b = __read(_a, 2), key = _b[0], component = _b[1];
            return (exports.registry.cache[key] = component);
        });
    },
};
exports.ComponentRegistryContext = react_1.default.createContext({
    componentRegistry: exports.registry,
});
//# sourceMappingURL=registry.js.map