import {convertFromLogic} from "./convertFromLogic";

/**
 *
 * @param op
 * @param vals
 * @param conv
 * @param config
 * @param {boolean} not
 * @param fieldConfig
 * @param {{errors: [], filterFieldContext: string}} meta
 * @return {{valueSrc: string, valueType: *, value: {args: (*|{}), func: *}}|undefined}
 */
export const convertFunc = (op, vals, conv, config, not, fieldConfig, meta) => {
  if (!op) return undefined;
  let func, argsArr;
  const jsonLogicIsMethod = (op == "method");
  if (jsonLogicIsMethod) {
    let obj, opts;
    [obj, func, ...opts] = vals;
    argsArr = [obj, ...opts];
  } else {
    func = op;
    argsArr = vals;
  }
  const fk = (jsonLogicIsMethod ? "#" : "") + func;

  let funcKeys = conv.funcs[fk];
  if (funcKeys) {
    let funcKey = funcKeys[0];
    if (funcKeys.length > 1 && fieldConfig) {
      funcKeys = funcKeys
        .filter(k => (config.funcs[k].returnType == fieldConfig.type));
      if (funcKeys.length == 0) {
        meta.errors.push(`No funcs returning type ${fieldConfig.type}`);
        return undefined;
      }
      funcKey = funcKeys[0];
    }
    const funcConfig = config.funcs[funcKey];
    const argKeys = Object.keys(funcConfig.args);
    let args = argsArr.reduce((acc, val, ind) => {
      const argKey = argKeys[ind];
      const argConfig = funcConfig.args[argKey];
      let argVal = convertFromLogic(val, conv, config, "val", meta, false, argConfig);
      if (argVal === undefined) {
        argVal = argConfig.defaultValue;
        if (argVal === undefined) {
          meta.errors.push(`No value for arg ${argKey} of func ${funcKey}`);
          return undefined;
        }
      }
      return {...acc, [argKey]: argVal};
    }, {});

    return {
      valueSrc: "func",
      value: {
        func: funcKey,
        args: args
      },
      valueType: funcConfig.returnType,
    };
  }

  return undefined;
};