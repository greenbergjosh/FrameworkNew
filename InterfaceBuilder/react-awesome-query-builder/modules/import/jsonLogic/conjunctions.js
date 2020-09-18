import {getFieldConfig} from "../../utils/configUtils";
import {defaultConjunction} from "../../utils/defaultUtils";
import uuid from "../../utils/uuid";
import {convertFromLogic} from "./convertFromLogic";

/**
 *
 * @param {"and","or","filter"} op
 * @param vals
 * @param conv
 * @param config
 * @param {boolean} not
 * @param {{errors: [], filterFieldContext: string}} meta
 * @return {{children1: *, id: *, type: string, properties: {not: *, conjunction: *}}|undefined}
 */
export const convertConj = (op, vals, conv, config, not, meta) => {
  const conjKey = conv.conjunctions[op];

  if (!conjKey) {
    return undefined;
  }

  if (conjKey === "FILTER") {
    meta.filterFieldContext = getFilterFieldContext(vals);
  }

  const children = getChildren(vals, conv, config, meta);
  const complexFieldsInGroup = getComplexFieldsInGroup(children, config);
  const usedGroups = complexFieldsInGroup.uniq();
  const allChildrenInGroups = hasAllChildrenInGroups(usedGroups, complexFieldsInGroup, children);

  const usedGroup = getUsedGroup(usedGroups);
  if (allChildrenInGroups && usedGroup && meta.filterFieldContext !== usedGroup) {
    return {
      children1: children,
      id: uuid(),
      properties: getProperties(conjKey, not, usedGroup),
      type: "rule_group",
    };
  }

  const children1 = allChildrenInGroups ? children : splitChildrenByGroups(children, usedGroups, conjKey, meta);

  if (conjKey === "FILTER") {
    const properties = getProperties(conjKey, not);
    properties.filterFieldName = meta.filterFieldContext;
    return {
      children1,
      id: uuid(),
      properties: properties,
      type: "filter",
    };
  }

  return {
    children1,
    id: uuid(),
    properties: getProperties(conjKey, not),
    type: "group",
  };
};

/* *************************************************************
 *
 * FILTER
 */


/* *************************************************************
 *
 * AND, OR Conjunctions
 */

/**
 *
 * @param {"AND","OR","FILTER"} conjKey
 * @param {boolean} not
 * @param {string?} field
 * @return {{not: *, conjunction: *, field:*}}
 */
function getProperties(conjKey, not, field) {
  let properties = {
    conjunction: conjKey,
    not: not
  };
  if (field) {
    properties.field = field;
  }
  return properties;
}

/**
 * Every field should be in single group or neither
 * @param {[]} usedGroups
 * @return {string}
 */
function getUsedGroup(usedGroups) {
  return usedGroups.length > 0 ? usedGroups[0] : null;
}

/**
 *
 * @param vals
 * @param conv
 * @param config
 * @param {{errors: [], filterFieldContext: string}} meta
 * @return {*}
 */
function getChildren(vals, conv, config, meta) {
  const children = vals
    .map(v => convertFromLogic(v, conv, config, "rule", meta, false, null, null))
    .filter(r => r !== undefined)
    .reduce((acc, r) => ({...acc, [r.id]: r}), {});

  return children;
}

function getComplexFieldsInGroup(children, config) {
  const {fieldSeparator} = config.settings;
  const complexFields = Object.entries(children)
    .filter(([_k, v]) => v.properties !== undefined && v.properties.field !== undefined && v.properties.field.indexOf(fieldSeparator) !== -1)
    .map(([_k, v]) => (v.properties.field.split(fieldSeparator)));
  const complexFieldsParents = complexFields
    .map(parts => parts.slice(0, parts.length - 1).join(fieldSeparator));
  const complexFieldsConfigs = complexFieldsParents
    .uniq()
    .map(f => [f, getFieldConfig(f, config)])
    .to_object();
  const complexFieldsInGroup = complexFieldsParents
    .filter((f) => complexFieldsConfigs[f].type === "!group");

  return complexFieldsInGroup;
}

function hasAllChildrenInGroups(usedGroups, complexFieldsInGroup, children) {
  return usedGroups.length == 0
    || usedGroups.length == 1
    && complexFieldsInGroup.length == Object.keys(children).length;
}

/**
 *
 * @param {{}} children
 * @param {*} usedGroups
 * @param {"AND","OR","FILTER"} conjKey
 * @param {{ errors:[], filterFieldContext: string}} meta
 * @return {{}}
 */
function splitChildrenByGroups(children, usedGroups, conjKey, meta) {
  console.log(meta.filterFieldContext);
  let createdRuleGroupIds = {};

  return Object.entries(children).reduce((acc, [k, v]) => {
    const groupFields = usedGroups.filter((f) => {
      return (v.properties.field && v.properties.field.indexOf(f) === 0 || []);
    });
    const groupField = groupFields.length > 0 ? groupFields[0] : null;

    if (!groupField) {
      // This child is not in a group (can be simple field or in struct)
      acc[k] = v;
      return acc;
    }

    if (groupField === meta.filterFieldContext) {
      // This child is below a "filter" conjunction, so don't wrap it in a rule_group
      acc[k] = v;
      return acc;
    }

    /*
     * Put this child in a rule_group
     */

    const ruleGroupId = createdRuleGroupIds[groupField];

    if (!ruleGroupId) {
      // Create a new rule_group and add this child
      const newChildren1 = {[k]: v};
      const ruleGroup = createRuleGroup(conjKey, groupField, newChildren1);
      acc[ruleGroup.id] = ruleGroup;
      createdRuleGroupIds[groupField] = ruleGroup.id;
      return acc;
    }

    // We have a rule_group, so add this child
    acc[ruleGroupId].children1[k] = v;
    return acc;

  }, {});
}

function createRuleGroup(conjKey, groupField, children1) {
  return {
    type: "rule_group",
    id: uuid(),
    children1,
    properties: getProperties(conjKey, false, groupField)
  };
}

export const wrapInDefaultConj = (rule, config) => {
  return {
    type: "group",
    id: uuid(),
    children1: {[rule.id]: rule},
    properties: {
      conjunction: defaultConjunction(config),
      not: false
    }
  };
};

/**
 * Find the first occurrence of a "var" value of a rule.
 * The var contains an object path as a string. We want to know
 * if it is "complex" meaning it has a dot in the path.
 *
 * Example rule (we're looking for "PeopleN.Gender"):
 * {"==":[{"var":"PeopleN.Gender"},"TEST"]}
 *
 * @param vals
 * @return {string|null}
 */
function getFilterFieldContext(vals) {
  const m = JSON.stringify(vals).match(/\{"var":"([^"]*)"\}/);
  const varPath = m[1] || null;
  const varPaths = (varPath && varPath.split(".")) || [];
  if (varPaths.length > 1) {
    return varPaths[0];
  }
  return null;
}
