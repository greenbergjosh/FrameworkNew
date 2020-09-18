//meta is mutable
import {extendConfig} from "../../utils/configUtils";
import {loadTree} from "../tree";
import {convertFromLogic} from "./convertFromLogic";
import {buildConv} from "./utils";
import {wrapInDefaultConj} from "./conjunctions";

// http://jsonlogic.com/

// helpers
Object.defineProperty(Array.prototype, "uniq", {
  enumerable: false,
  value: function () {
    return Array.from(new Set(this));
  }
});

Object.defineProperty(Array.prototype, "to_object", {
  enumerable: false,
  value: function () {
    return this.reduce((acc, [f, fc]) => ({...acc, [f]: fc}), {});
  }
});

/**
 *
 * @param logicTree
 * @param config
 * @return {undefined} immTree
 */
export const loadFromJsonLogic = (logicTree, config) => {
  let meta = {
    errors: []
  };
  const extendedConfig = extendConfig(config);
  const conv = buildConv(extendedConfig);
  let jsTree = convertFromLogic(logicTree, conv, extendedConfig, "rule", meta);
  if (jsTree && jsTree.type != "group") {
    jsTree = wrapInDefaultConj(jsTree, extendedConfig);
  }
  const immTree = jsTree ? loadTree(jsTree) : undefined;
  if (meta.errors.length)
    console.warn("Errors while importing from JsonLogic:", meta.errors);
  return immTree;
};

