import React from "react";
import { Button, Icon } from "antd";

export default ({type, onClick, label, config: {settings}}) => {
  const typeToIcon = {
    "addRule": "plus",
    "addGroup": "plus-circle",
    "addFilter": "plus-circle",
    "delRule": "delete",
    "delGroup": "delete",

    "addRuleGroup": "plus",
    "delRuleGroup": "delete",
  };

  const typeToClass = {
    "addRule": "action action--ADD-RULE",
    "addGroup": "action action--ADD-GROUP",
    "addFilter": "action action--ADD-GROUP",
    "delRule": "action action--DELETE", //?
    "delGroup": "action action--DELETE",

    "addRuleGroup": <Icon type="plus" theme="outlined" />,
    "delRuleGroup": <Icon type="delete" theme="filled" />,
  };

  const typeToType = {
    "delRule": "danger",
    "delGroup": "danger",
    "delFilter": "danger",
    "delRuleGroup": "danger",
  };

  const {renderSize} = settings;

  const btnLabel = type == "addRuleGroup" ? "" : label;

  return (
    <Button
      key={type}
      type={typeToType[type] || "default"}
      icon={typeToIcon[type]}
      className={typeToClass[type]}
      onClick={onClick}
      size={renderSize}
    >{btnLabel}</Button>
  );
};
