import React from "react";
import { Button, Icon } from "antd";

export default ({type, onClick, label, config: {settings}, disabled = false}) => {
  const typeToIcon = {
    "addRule": "plus",
    "addGroup": "plus-circle",
    "addFilter": "plus-circle",
    "delRule": "delete",
    "disableRule": "eye-invisible",
    "delGroup": "delete",
    "disableGroup": "eye-invisible",

    "addRuleGroup": "plus",
    "delRuleGroup": "delete",
    "disableRuleGroup": "eye-invisible",
  };

  const typeToClass = {
    "addRule": "action action--ADD-RULE",
    "addGroup": "action action--ADD-GROUP",
    "addFilter": "action action--ADD-GROUP",
    "delRule": "action action--DELETE", //?
    "disableRule": "action action--DISABLE",
    "delGroup": "action action--DELETE",
    "disableGroup": "action action--DISABLE",

    "addRuleGroup": "action action--ADD-RULE-GROUP",
    "delRuleGroup": "action action--DELETE",
    "disableRuleGroup": "action action--DISABLE",
  };

  const typeToType = {
    "delRule": "danger",
    "delGroup": "danger",
    "delFilter": "danger",
    "delRuleGroup": "danger",
  };

  const {renderSize} = settings;

  const btnLabel = type === "addRuleGroup" ? "" : label;

  return (
    <Button
      key={type}
      type={typeToType[type] || "default"}
      icon={typeToIcon[type]}
      className={typeToClass[type]}
      onClick={onClick}
      size={renderSize}
      disabled={disabled}
    >{btnLabel}</Button>
  );
};
