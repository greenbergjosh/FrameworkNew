import {getFieldConfig} from "../../utils/configUtils";

/**
 *
 * @param op
 * @param vals
 * @param conv
 * @param config
 * @param {boolean} not
 * @param {{errors: [], filterFieldContext: string}} meta
 * @return {{valueSrc: string, valueType: *, value: *}|undefined}
 */
export const convertField = (op, vals, conv, config, not, meta) => {
  if (op === "var") {
    const field = vals[0];
    const fieldConfig = getFieldConfig(field, config);
    if (!fieldConfig) {
      meta.errors.push(`No config for field ${field}`);
      return undefined;
    }

    return {
      valueSrc: "field",
      value: field,
      valueType: fieldConfig.type,
    };
  }

  return undefined;
};