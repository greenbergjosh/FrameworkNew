import React from "react";

export default ({type, label, onClick, config, disabled = false}) => {
  const typeToLabel = {
    "addRuleGroup": "+",
    "delGroup": "x",
    "delRule": "x",
  };
  const btnLabel = typeToLabel[type] || label;
  return <button onClick={onClick} disabled={disabled}>{btnLabel}</button>;
};
