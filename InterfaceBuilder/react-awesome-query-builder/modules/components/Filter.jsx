import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import startsWith from "lodash/startsWith";
import FilterContainer from "./containers/FilterContainer";
import Draggable from "./containers/Draggable";
import Item from "./Item";
import {FilterActions} from "./FilterActions";
import Field from "./Field";
import isEmpty from "lodash/isEmpty";
import keys from "lodash/keys";

const classNames = require("classnames");

const defaultPosition = "topRight";
const dummyFn = () => {
};
const DragIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray" width="18px" height="18px">
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
  </svg>
);

export function getGroupFields(fields) {
  return keys(fields).reduce((acc, key) => {
    const field = fields[key];
    if (field.type === "!group") {
      acc[key] = field;
    }
    return acc;
  }, {});
}

export function hasGroupFields(fields) {
  const groupFields = getGroupFields(fields);
  return !isEmpty(groupFields);
}

export class Filter extends PureComponent {
  static propTypes = {
    //tree: PropTypes.instanceOf(Immutable.Map).isRequired,
    reordableNodesCnt: PropTypes.number,
    conjunctionOptions: PropTypes.object.isRequired,
    allowFurtherNesting: PropTypes.bool.isRequired,
    isRoot: PropTypes.bool.isRequired,
    not: PropTypes.bool,
    selectedConjunction: PropTypes.string,
    config: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    path: PropTypes.any, //instanceOf(Immutable.List)
    children1: PropTypes.any, //instanceOf(Immutable.OrderedMap)
    isDraggingMe: PropTypes.bool,
    isDraggingTempo: PropTypes.bool,
    //actions
    handleDraggerMouseDown: PropTypes.func,
    onDragStart: PropTypes.func,
    addRule: PropTypes.func.isRequired,
    addGroup: PropTypes.func.isRequired,
    addFilter: PropTypes.func.isRequired,
    setFilterField: PropTypes.func.isRequired,
    removeSelf: PropTypes.func.isRequired,
    disableSelf: PropTypes.func.isRequired,
    setConjunction: PropTypes.func.isRequired,
    setNot: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    parentField: PropTypes.string,
    filterFieldName: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.removeSelf = this.removeSelf.bind(this);
    this.disableSelf = this.disableSelf.bind(this);
  }

  isGroupTopPosition() {
    return startsWith(this.props.config.settings.groupActionsPosition || defaultPosition, "top");
  }

  removeSelf() {
    const {renderConfirm, removeGroupConfirmOptions: confirmOptions} = this.props.config.settings;
    const doRemove = () => {
      this.props.removeSelf();
    };
    if (confirmOptions && !this.isEmptyCurrentGroup()) {
      renderConfirm({
        ...confirmOptions,
        onOk: doRemove,
        onCancel: null
      });
    } else {
      doRemove();
    }
  }

  disableSelf() {
    const {renderConfirm, disableGroupConfirmOptions: confirmOptions} = this.props.config.settings;
    const doDisable = () => {
      this.props.disableSelf();
    };
    if (confirmOptions && !this.isEmptyCurrentGroup()) {
      renderConfirm({
        ...confirmOptions,
        onOk: doDisable,
        onCancel: null
      });
    } else {
      doDisable();
    }
  }

  isEmptyCurrentGroup() {
    const children = this.props.children1;
    return children.size == 0
      || children.size == 1 && this.isEmpty(children.first());
  }

  isEmpty(item) {
    return (item.get("type") == "group" || item.get("type") == "rule_group") ? this.isEmptyGroup(item) : this.isEmptyRule(item);
  }

  isEmptyGroup(group) {
    const children = group.get("children1");
    return children.size == 0
      || children.size == 1 && this.isEmpty(children.first());
  }

  isEmptyFilter(filter) {
    const children = filter.get("children1");
    return children.size == 0
      || children.size == 1 && this.isEmpty(children.first());
  }

  isEmptyRule(rule) {
    const properties = rule.get("properties");
    return !(
      properties.get("field") !== null
      && properties.get("operator") !== null
      && properties.get("value").filter((val) => val !== undefined).size > 0
    );
  }

  render() {
    return <>
      {this.renderHeaderWrapper()}
      {this.renderChildrenWrapper()}
      {this.renderFooterWrapper()}
    </>;
  }

  renderChildrenWrapper() {
    const {conjunctionOptions, children1, config} = this.props;
    const conjunctionCount = Object.keys(conjunctionOptions).length;
    const showConjs = conjunctionCount > 1 || config.settings.showNot;

    return children1 && (
      <div key="group-children" className={classNames(
        "group--children",
        !showConjs ? "hide--conjs" : "",
        children1.size < 2 && config.settings.hideConjForOne ? "hide--line" : "",
        children1.size < 2 ? "one--child" : "",
        this.childrenClassName()
      )}>{this.renderChildren()}</div>
    );
  }

  childrenClassName = () => "";

  renderHeaderWrapper() {
    const {children1, config} = this.props;
    const isGroupTopPosition = this.isGroupTopPosition();
    return (
      <div key="group-header" className={classNames(
        "group--header",
        children1.size < 2 && config.settings.hideConjForOne ? "hide--line" : ""
      )}>
        {this.renderHeader()}
        {isGroupTopPosition && this.renderBeforeActions()}
        {isGroupTopPosition && this.renderActions()}
        {isGroupTopPosition && this.renderAfterActions()}
      </div>
    );
  }

  renderFooterWrapper() {
    const isGroupTopPosition = this.isGroupTopPosition();
    return !isGroupTopPosition && (
      <div key="group-footer" className='group--footer'>
        {this.renderBeforeActions()}
        {this.renderActions()}
        {this.renderAfterActions()}
      </div>
    );
  }

  renderBeforeActions = () => {
    const BeforeActions = this.props.config.settings.renderBeforeActions;
    if (BeforeActions == undefined)
      return null;

    return typeof BeforeActions === "function" ? <BeforeActions {...this.props}/> : BeforeActions;
  }

  renderAfterActions = () => {
    const AfterActions = this.props.config.settings.renderAfterActions;
    if (AfterActions == undefined)
      return null;

    return typeof AfterActions === "function" ? <AfterActions {...this.props}/> : AfterActions;
  }

  renderActions() {
    const {config, addRule, addGroup, addFilter} = this.props;

    return <FilterActions
      config={config}
      addRule={addRule}
      addGroup={addGroup}
      addFilter={addFilter}
      canAddGroup={this.canAddGroup()}
      canAddRule={this.canAddRule()}
      canAddFilter={this.canAddFilter()}
      canDeleteGroup={this.canDeleteGroup()}
      canDisableGroup={this.canDisableGroup()}
      removeSelf={this.removeSelf}
      disableSelf={this.disableSelf}
      disabled={this.props.disabled}
    />;
  }

  canAddGroup = () => {
    if (isEmpty(this.props.filterFieldName)) {
      return false;
    }
    return this.props.allowFurtherNesting;
  };

  canAddRuleWithoutContext = () => {
    const {maxNumberOfRules} = this.props.config.settings;
    const {totalRulesCnt} = this.props;
    if (maxNumberOfRules) {
      return totalRulesCnt < maxNumberOfRules;
    }
    return true;
  };

  canAddRule = () => {
    if (isEmpty(this.props.filterFieldName)) {
      return false;
    }
    return this.canAddRuleWithoutContext();
  };

  canAddFilter = () => {
    const {filterFieldName} = this.props;

    if (isEmpty(filterFieldName)) {
      return false;
    }
    const filterField = this.props.config.fields[filterFieldName];
    if (filterField && !hasGroupFields(filterField.subfields)) {
      return false;
    }
    return this.props.allowFurtherNesting;
  };

  canDeleteGroup = () => !this.props.isRoot;
  canDisableGroup = () => !this.props.isRoot;

  renderChildren() {
    const {children1} = this.props;
    return children1 ? children1.map(this.renderItem.bind(this)).toList() : null;
  }

  renderItem(item) {
    const {config, actions, onDragStart, selectedConjunction, filterFieldName} = this.props;
    const isRuleGroup = item.get("type") == "group" && item.getIn(["properties", "field"]) != null;
    const type = isRuleGroup ? "rule_group" : item.get("type");
    const hasFilterConj = selectedConjunction === "FILTER" || false;

    return (
      filterFieldName && hasFilterConj ?
        <Item
          {...this.extraPropsForItem(item)}
          key={item.get("id")}
          id={item.get("id")}
          //path={props.path.push(item.get('id'))}
          path={item.get("path")}
          type={type}
          properties={item.get("properties")}
          config={config}
          actions={actions}
          children1={item.get("children1")}
          //tree={props.tree}
          reordableNodesCnt={this.reordableNodesCnt()}
          totalRulesCnt={this.props.totalRulesCnt}
          onDragStart={onDragStart}
          isDraggingTempo={this.props.isDraggingTempo}
          parentField={filterFieldName}
        />
        :
        <Item
          {...this.extraPropsForItem(item)}
          key={item.get("id")}
          id={item.get("id")}
          //path={props.path.push(item.get('id'))}
          path={item.get("path")}
          type={type}
          properties={item.get("properties")}
          config={config}
          actions={actions}
          children1={item.get("children1")}
          //tree={props.tree}
          reordableNodesCnt={this.reordableNodesCnt()}
          totalRulesCnt={this.props.totalRulesCnt}
          onDragStart={onDragStart}
          isDraggingTempo={this.props.isDraggingTempo}
          // parentField={parentField}
        />
    );
  }

  extraPropsForItem(_item) {
    return {};
  }

  reordableNodesCnt() {
    return this.props.reordableNodesCnt;
  }

  renderDrag() {
    const {
      config, isRoot, reordableNodesCnt,
      handleDraggerMouseDown
    } = this.props;
    const showDragIcon = config.settings.canReorder && !isRoot && reordableNodesCnt > 1;
    const drag = showDragIcon
      && <span
        key="group-drag-icon"
        className={"qb-drag-handler group--drag-handler"}
        onMouseDown={handleDraggerMouseDown}
      ><DragIcon/> </span>;
    return drag;
  }

  renderConjs() {
    const {
      config, children1, id,
      selectedConjunction, setConjunction, conjunctionOptions, not, setNot
    } = this.props;
    const {immutableGroupsMode, renderConjs: Conjs, showNot} = config.settings;
    const conjunctionCount = Object.keys(conjunctionOptions).length;
    const showConjs = conjunctionCount > 1 || showNot;
    if (!showConjs)
      return null;

    /*
     * RWB+Onpoint Mod
     * Let each conjunction determine if it should be disabled
     * by running its config isDisabled function.
     */
    Object.keys(config.conjunctions).map(key => {
      const conj = config.conjunctions[key];
      const opt = conjunctionOptions[key];
      if (opt && conj.isDisabled) {
        opt.disabled = conj.isDisabled(children1, key, not, opt, selectedConjunction, setConjunction);
      }
      opt.hidden = conj.isHidden || false;
    });

    const renderProps = {
      disabled: children1.size < 2,
      readonly: immutableGroupsMode || this.props.disabled,
      selectedConjunction: selectedConjunction,
      setConjunction: immutableGroupsMode ? dummyFn : setConjunction,
      conjunctionOptions: conjunctionOptions,
      config: config,
      not: not || false,
      id: id,
      setNot: immutableGroupsMode ? dummyFn : setNot,
    };
    return <span style={{display: "none"}}><Conjs {...renderProps} /></span>;
  }

  renderFilterFieldSelector() {
    const {config, selectedField, parentField, setField, setFilterField, readonly, filterFieldName} = this.props;
    const groupFields = getGroupFields(config.fields);
    const filteredConfig = {
      ...config,
      fields: groupFields
    };

    return (
      <>
        <label htmlFor="ContextField" style={{paddingRight: 5}}>{config.settings.filterLabel}:</label>
        <Field
          config={filteredConfig}
          selectedField={filterFieldName}
          parentField={parentField}
          setField={setFilterField}
          customProps={config.settings.customFieldSelectProps}
          readonly={readonly}
        />
      </>
    );
  }

  renderHeader() {
    return (
      <div className={classNames(
        "group--conjunctions",
        // children1.size < 2 && config.settings.hideConjForOne ? 'hide--conj' : ''
      )}>
        {this.renderFilterFieldSelector()}
        {this.renderConjs()}
        {this.renderDrag()}
      </div>
    );
  }
}

export default FilterContainer(Draggable("group")(Filter));
