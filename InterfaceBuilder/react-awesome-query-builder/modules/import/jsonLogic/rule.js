import {getFieldConfig, getWidgetForFieldOp} from "../../utils/configUtils";
import uuid from "../../utils/uuid";
import {convertFromLogic} from "./convertFromLogic";

/**
 *
 * @param op
 * @param vals
 * @param conv
 * @param config
 * @param {boolean} not
 * @param {{errors: [], filterFieldContext: string}} meta
 * @return {{id: *, type: string, properties: {valueSrc: *, field, valueType: *, value: *, operator}}|undefined}
 */
export const convertOp = (op, vals, conv, config, not, meta) => {
  if (!op) return undefined;
  const arity = vals.length;
  const cardinality = arity - 1;
  if (op == "all") {
    // special case
    const op2 = Object.keys(vals[1])[0];
    vals = [
      vals[0],
      vals[1][op2][1]
    ];
    op = op + "-" + op2; // example: "all-in"
  }
  const opk = op + "/" + cardinality;

  let oks = [], errors = [];
  const _check = (isRevArgs) => {
    let opKeys = conv.operators[(isRevArgs ? "#" : "") + opk];
    if (opKeys) {
      let jlField, args = [];
      const rangeOps = ["<", "<=", ">", ">="];
      if (rangeOps.includes(op) && arity == 3) {
        jlField = vals[1];
        args = [vals[0], vals[2]];
      } else if (isRevArgs) {
        jlField = vals[1];
        args = [vals[0]];
      } else {
        [jlField, ...args] = vals;
      }
      const {"var": field} = jlField;
      if (!field) {
        errors.push(`Unknown field ${JSON.stringify(jlField)}`);
        return;
      }
      const fieldConfig = getFieldConfig(field, config);
      if (!fieldConfig) {
        errors.push(`No config for field ${field}`);
        return;
      }

      let opKey = opKeys[0];
      if (opKeys.length > 1 && fieldConfig && fieldConfig.operators) {
        // eg. for "equal" and "select_equals"
        opKeys = opKeys
          .filter(k => fieldConfig.operators.includes(k));
        if (opKeys.length == 0) {
          errors.push(`No corresponding ops for field ${field}`);
          return;
        }
        opKey = opKeys[0];
      }

      oks.push({
        field, fieldConfig, opKey, args
      });
    }
  };

  _check(false);
  _check(true);

  if (!oks.length) {
    meta.errors.push(errors.join("; ") || `Unknown op ${op}/${arity}`);
    return undefined;
  }
  let {field, fieldConfig, opKey, args} = oks[0];
  let opConfig = config.operators[opKey];

  if (not && opConfig.reversedOp) {
    not = false;
    opKey = opConfig.reversedOp;
    opConfig = config.operators[opKey];
  }
  if (not) {
    meta.errors.push(`No rev op for ${opKey}`);
    return undefined;
  }

  const widget = getWidgetForFieldOp(config, field, opKey);

  const convertedArgs = args
    .map(v => convertFromLogic(v, conv, config, "val", meta, false, fieldConfig, widget));
  if (convertedArgs.filter(v => v === undefined).length) {
    //meta.errors.push(`Undefined arg for field ${field} and op ${opKey}`);
    return undefined;
  }

  return {
    type: "rule",
    id: uuid(),
    properties: {
      field: field,
      operator: opKey,
      value: convertedArgs.map(v => v.value),
      valueSrc: convertedArgs.map(v => v.valueSrc),
      valueType: convertedArgs.map(v => v.valueType),
    }
  };
};