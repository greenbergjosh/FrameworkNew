"use strict"
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b
          }) ||
        function (d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]
        }
      return extendStatics(d, b)
    }
    return function (d, b) {
      extendStatics(d, b)
      function __() {
        this.constructor = d
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
    }
  })()
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator]
    if (!m) return o
    var i = m.call(o),
      r,
      ar = [],
      e
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value)
    } catch (error) {
      e = { error: error }
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i)
      } finally {
        if (e) throw e.error
      }
    }
    return ar
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, "__esModule", { value: true })
var fp_1 = require("lodash/fp")
var react_1 = __importDefault(require("react"))
var registry_1 = require("../../registry")
var BaseInterfaceComponent = /** @class */ (function (_super) {
  __extends(BaseInterfaceComponent, _super)
  function BaseInterfaceComponent() {
    return (_super !== null && _super.apply(this, arguments)) || this
  }
  BaseInterfaceComponent.getLayoutDefinition = function () {
    return { name: "__Undefined", title: "__Undefined" }
  }
  BaseInterfaceComponent.getDefinitionDefaultValue = function (componentDefinition) {
    if (
      componentDefinition &&
      typeof componentDefinition.valueKey === "string" &&
      typeof componentDefinition.defaultValue !== "undefined"
    ) {
      return fp_1.set(componentDefinition.valueKey, componentDefinition.defaultValue, {})
    }
    return {}
  }
  BaseInterfaceComponent.manageForm = function () {
    var extend = []
    for (var _i = 0; _i < arguments.length; _i++) {
      extend[_i] = arguments[_i]
    }
    return extend || []
  }
  BaseInterfaceComponent.getManageFormDefaults = function () {
    return getDefaultsFromComponentDefinitions(this.manageForm())
  }
  BaseInterfaceComponent.prototype.getDefaultValue = function () {
    if (typeof this.props.defaultValue !== "undefined") {
      return this.props.defaultValue
    } else {
      return this.constructor.getDefintionDefaultValue(this.props)
    }
  }
  return BaseInterfaceComponent
})(react_1.default.Component)
exports.BaseInterfaceComponent = BaseInterfaceComponent
function getDefaultsFromComponentDefinitions(componentDefinitions) {
  // Iterate over all the definitions to accumulate their defaults
  return componentDefinitions.reduce(function (acc, componentDefinition) {
    // If there are child lists of in the component's properties
    var nestedValues = Object.entries(componentDefinition).reduce(function (acc2, _a) {
      var _b = __read(_a, 2),
        key = _b[0],
        value = _b[1]
      if (Array.isArray(value) && value.length && value[0].component) {
        // Merge in child list values if they exist
        return fp_1.merge(getDefaultsFromComponentDefinitions(value), acc2)
      }
      return acc2
    }, {})
    // Check to see if there's a component type for this object
    var Component = registry_1.registry.lookup(componentDefinition.component)
    // If this component has a value itself, get it
    var thisValue = (Component && Component.getDefintionDefaultValue(componentDefinition)) || {}
    // Combine the existing values with this level's value and any nested values
    return fp_1.merge(nestedValues, fp_1.merge(thisValue, acc))
  }, {})
}
exports.getDefaultsFromComponentDefinitions = getDefaultsFromComponentDefinitions
//# sourceMappingURL=BaseInterfaceComponent.js.map
