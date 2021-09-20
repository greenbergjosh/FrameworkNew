import jsonLogic from "json-logic-js"
import React from "react"
import { Alert, Button, Modal, Popconfirm, Typography } from "antd"
import { isPlainObject } from "lodash/fp"
import { JSONRecord } from "../../../globalTypes/JSONTypes"
import { tryCatch } from "fp-ts/lib/Option"
import { AbstractBaseInterfaceComponentType } from "components/BaseInterfaceComponent/types"
import { EventPayloadType } from "components/withEvents/types"
import { EventBus } from "components/withEvents/EventBus"
import { CodeEditorProps } from "../../../../../interface-builder-plugins/src/monaco/code-editor/src/types"

type RuleDoc = { rulesString: string }
// type CodeEditorDoc = { rulesString: JSONRecord | undefined | null }

function formatDocument(doc: CodeEditorProps["document"]) {
  return JSON.stringify(doc, null, 2) || "{}"
}

export function EditDataBindingModal(props: {
  CodeEditor?: AbstractBaseInterfaceComponentType
  rules: JSONRecord
  isBinding: boolean
  onCancel: () => void
  onDelete: () => void
  onSave: (newRules: JSONRecord) => void
  visible: boolean
  propertyLabel?: string
  propertyName?: string
}): JSX.Element {
  /*
   * We must place the rules in a "rules" property of a container object
   * because CodeEditorInterfaceComponent expects to use a valueKey.
   */
  const [isValidRules, setIsValidRules] = React.useState(true)
  const [rulesDraft, setRulesDraft] = React.useState<JSONRecord>(getRulesDoc(props.rules))
  const [originalRulesDoc, setOriginalRulesDoc] = React.useState<RuleDoc>(getRulesDoc(props.rules))

  function getRulesDoc(rules: JSONRecord) {
    return {
      rulesString: formatDocument(rules),
    }
  }

  function validateRules(rules: JSONRecord) {
    return isPlainObject(rules) && jsonLogic.is_logic(rules)
  }

  /* ***************************************
   *
   * EVENT HANDLERS
   */

  React.useEffect(() => {
    if (!props.visible) {
      return
    }
    const subscriptionId = EventBus.addSubscription(
      "event.editDataBinding.valueChanged",
      (eventName: string, eventPayload: EventPayloadType /*, source: any*/) => {
        /* With every keystroke, evaluate the rule and update the rulesDraft copy */
        const value: string = eventPayload.value as string
        const nextRules = tryCatch(() => value && JSON.parse(value)).toUndefined()
        const isValid = validateRules(nextRules)
        setIsValidRules(isValid)
        setRulesDraft(nextRules)
      }
    )
    return () => {
      /* On unmount, Clean up the event subscription */
      EventBus.removeSubscription("event.editDataBinding.valueChanged", subscriptionId)
    }
  }, [props.visible])

  const handleSave = () => {
    if (isValidRules) {
      /* Reformat the json */
      const formattedDoc = formatDocument(rulesDraft)
      const newRules: JSONRecord = tryCatch(() => formattedDoc && JSON.parse(formattedDoc)).toUndefined()
      props.onSave(newRules)
    }
  }

  const handleDelete = () => {
    setOriginalRulesDoc(getRulesDoc({}))
    setRulesDraft(getRulesDoc({}))
    props.onDelete()
  }

  const handleCancel = () => {
    setOriginalRulesDoc(getRulesDoc(props.rules))
    setRulesDraft(getRulesDoc(props.rules))
    props.onCancel()
  }

  /* ***************************************
   *
   * RENDER
   */

  return (
    <Modal
      title={`${props.propertyLabel} data binding`}
      visible={props.visible}
      onCancel={props.onCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Popconfirm
          disabled={!props.isBinding}
          key="delete-confirm"
          title="Are you sure you want to delete this binding?"
          onConfirm={handleDelete}
          onCancel={() => void 0}
          okText="Yes"
          cancelText="No">
          <Button key="delete" type="danger" disabled={!props.isBinding}>
            Remove
          </Button>
        </Popconfirm>,
        <Button key="save" type="primary" disabled={!isValidRules} loading={false} onClick={handleSave}>
          Save
        </Button>,
      ]}>
      <Typography>
        Bind this property to data using{" "}
        <a href="https://jsonlogic.com/" target="_blank" rel="noreferrer">
          JsonLogic
        </a>
        . You may use &ldquo;$root&rdquo; and &ldquo;$&rdquo; in the beginning of &ldquo;var&rdquo; value paths.
      </Typography>
      {!isValidRules && <Alert showIcon={true} message="Invalid JsonLogic rules." type="error" />}
      {props.CodeEditor && (
        <props.CodeEditor
          key="jsonlogic-editor"
          component={"code-editor"}
          defaultLanguage={"json"}
          defaultTheme={"vs-dark"}
          getRootUserInterfaceData={() => originalRulesDoc}
          onChangeRootData={() => void 0}
          userInterfaceData={originalRulesDoc}
          valueKey={"rulesString"}
          autoSync={true}
          height={"400px"}
          showMinimap={false}
          width={"100%"}
          incomingEventHandlers={[]}
          outgoingEventMap={{
            valueChanged: {
              //@ts-ignore
              lbmParameters: [],
              simpleMapValue: "event.editDataBinding.valueChanged",
              type: "simple",
            },
          }}
        />
      )}
    </Modal>
  )
}
