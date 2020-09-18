import {convertConj} from "./conjunctions";
import {convertVal} from "./value";
import {convertFunc} from "./func";
import {convertField} from "./field";
import {convertOp} from "./rule";
import {isLogic} from "./utils";

/**
 *
 * @param logic
 * @param conv
 * @param config
 * @param expectedType
 * @param {{errors: [], filterFieldContext: string}} meta
 * @param {boolean} not
 * @param {*?} fieldConfig
 * @param {*?} widget
 * @return {{children1: *, id: *, type: string, properties: {not: *, conjunction: *}}|{id: *, type: string, properties: {valueSrc: *, field, valueType: *, value: *, operator}}|{valueSrc: string, valueType: *, value: *}|{valueSrc: string, valueType, value: {args, func}}|{valueSrc: string, valueType, value}}
 */
export const convertFromLogic = (logic, conv, config, expectedType, meta, not = false, fieldConfig, widget) => {
  let op, vals;
  if (isLogic(logic)) {
    op = Object.keys(logic)[0];
    vals = logic[op];
    if (!Array.isArray(vals))
      vals = [vals];
  }

  let ret;
  let beforeErrorsCnt = meta.errors.length;

  const isNotOp = op == "!" && (vals.length == 1 && vals[0] && isLogic(vals[0]) && Object.keys(vals[0])[0] == "var");
  const isRev = op == "!" && !isNotOp;
  if (isRev) {
    ret = convertFromLogic(vals[0], conv, config, expectedType, meta, !not, fieldConfig, widget);
  } else if (expectedType == "val") {
    ret = convertField(op, vals, conv, config, not, meta)
      || convertFunc(op, vals, conv, config, not, fieldConfig, meta)
      || convertVal(logic, fieldConfig, widget, config, meta);
  } else if (expectedType == "rule") {
    ret = convertConj(op, vals, conv, config, not, meta)
      || convertOp(op, vals, conv, config, not, meta);
  }

  let afterErrorsCnt = meta.errors.length;
  if (op != "!" && ret === undefined && afterErrorsCnt == beforeErrorsCnt) {
    meta.errors.push(`Can't parse logic ${JSON.stringify(logic)}`);
  }

  return ret;
};

