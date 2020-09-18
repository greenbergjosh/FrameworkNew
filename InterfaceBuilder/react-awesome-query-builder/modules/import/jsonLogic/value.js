import moment from "moment";
import {isLogic} from "./utils";

/**
 *
 * @param val
 * @param fieldConfig
 * @param widget
 * @param {boolean} config
 * @param {{errors: [], filterFieldContext: string}} meta
 * @return {{valueSrc: string, valueType: *, value: string}|undefined}
 */
export const convertVal = (val, fieldConfig, widget, config, meta) => {
  if (val === undefined) return undefined;
  const widgetConfig = config.widgets[widget || fieldConfig.mainWidget];

  if (!widgetConfig) {
    meta.errors.push(`No widget for type ${fieldConfig.type}`);
    return undefined;
  }

  if (isLogic(val)) {
    meta.errors.push(`Unexpected logic in value: ${JSON.stringify(val)}`);
    return undefined;
  }

  // number of seconds -> time string
  if (fieldConfig && fieldConfig.type == "time" && typeof val == "number") {
    const [h, m, s] = [Math.floor(val / 60 / 60) % 24, Math.floor(val / 60) % 60, val % 60];
    const valueFormat = widgetConfig.valueFormat;
    if (valueFormat) {
      const dateVal = new Date(val);
      dateVal.setMilliseconds(0);
      dateVal.setHours(h);
      dateVal.setMinutes(m);
      dateVal.setSeconds(s);
      val = moment(dateVal).format(valueFormat);
    } else {
      val = `${h}:${m}:${s}`;
    }
  }

  // "2020-01-08T22:00:00.000Z" -> Date object
  if (fieldConfig && ["date", "datetime"].includes(fieldConfig.type) && val && !(val instanceof Date)) {
    const dateVal = new Date(val);
    if (dateVal instanceof Date && dateVal.toISOString() === val) {
      val = dateVal;
    }
  }

  // Date object -> formatted string
  if (val instanceof Date && fieldConfig) {
    const valueFormat = widgetConfig.valueFormat;
    if (valueFormat) {
      val = moment(val).format(valueFormat);
    }
  }

  return {
    valueSrc: "value",
    value: val,
    valueType: widgetConfig.type
  };
};