import React, { PureComponent } from "react"

const groupActionsPositionList = {
  topLeft: "group--actions--tl",
  topCenter: "group--actions--tc",
  topRight: "group--actions--tr",
  bottomLeft: "group--actions--bl",
  bottomCenter: "group--actions--bc",
  bottomRight: "group--actions--br",
}
const defaultPosition = "topRight"

export class GroupActions extends PureComponent {
  render() {
    const {
      config,
      addRule,
      addGroup,
      addFilter,
      canAddGroup,
      canAddRule,
      canAddFilter,
      canDeleteGroup,
      canDisableGroup,
      removeSelf,
      disableSelf,
      disabled,
    } = this.props
    const {
      immutableGroupsMode,
      addRuleLabel,
      addGroupLabel,
      addFilterLabel,
      delGroupLabel,
      disableGroupLabel,
      groupActionsPosition,
      renderButton: Btn,
      renderButtonGroup: BtnGrp,
    } = config.settings
    const position = groupActionsPositionList[groupActionsPosition || defaultPosition]

    const addRuleBtn = !immutableGroupsMode && canAddRule && (
      <Btn type="addRule" onClick={addRule} label={addRuleLabel} config={config} disabled={disabled} />
    )
    const addGroupBtn = !immutableGroupsMode && canAddGroup && (
      <Btn type="addGroup" onClick={addGroup} label={addGroupLabel} config={config} disabled={disabled} />
    )
    const addFilterBtn = !immutableGroupsMode && canAddFilter && (
      <Btn type="addFilter" onClick={addFilter} label={addFilterLabel} config={config} disabled={disabled} />
    )
    const delGroupBtn = !immutableGroupsMode && canDeleteGroup && (
      <Btn type="delGroup" onClick={removeSelf} label={delGroupLabel} config={config} />
    )
    const disableGroupBtn = !immutableGroupsMode && canDisableGroup && (
      <Btn type="disableGroup" onClick={disableSelf} label={disableGroupLabel} config={config} />
    )

    return (
      <div className={`group--actions ${position}`}>
        <BtnGrp config={config}>
          {addRuleBtn}
          {addGroupBtn}
          {addFilterBtn}
          {delGroupBtn}
          {disableGroupBtn}
        </BtnGrp>
      </div>
    )
  }
}
