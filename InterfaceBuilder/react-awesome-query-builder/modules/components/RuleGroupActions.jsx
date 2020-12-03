import React, { PureComponent } from "react";

export class RuleGroupActions extends PureComponent {
  render() {
    const {config, addRule, canAddRule, canDeleteGroup, canDisableGroup, removeSelf, disableSelf} = this.props;
    const {
      immutableGroupsMode, addRuleLabel, delGroupLabel, disableGroupLabel,
      renderButton: Btn
    } = config.settings;

    const addRuleBtn = !immutableGroupsMode && canAddRule && <Btn
      type="addRuleGroup" onClick={addRule} label={addRuleLabel} config={config}
    />;

    const delGroupBtn = !immutableGroupsMode && canDeleteGroup && <Btn
      type="delRuleGroup" onClick={removeSelf} label={delGroupLabel} config={config}
    />;

    const disableGroupBtn = !immutableGroupsMode && canDisableGroup && <Btn
      type="disableRuleGroup" onClick={disableSelf} label={disableGroupLabel} config={config}
    />;

    return (
      <div className={"group--actions"}>
        {/*addRuleBtn*/ /* <-- Temporarily disabled per CHN-372 */}
        {/*delGroupBtn*/}
        {/*disableGroupBtn*/}
      </div>
    );
  }
}
