import jsonLogic from "json-logic-js"
import React from "react"
import { Alert, Button, Modal, Popconfirm, Typography } from "antd"
import { CodeEditorInterfaceComponent } from "../../../plugins/monaco/code-editor/CodeEditorInterfaceComponent"
import { isEmpty, isString } from "lodash/fp"
import { JSONRecord } from "../../../globalTypes/JSONTypes"
import { tryCatch } from "fp-ts/lib/Option"

type RuleContainer = { rulesString: string }

export function EditDataBindingModal(props: {
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
  const [data, setData] = React.useState<RuleContainer>({
    rulesString: JSON.stringify(props.rules, null, "\t"),
  })
  const [isInvalidRules, setIsInvalidRules] = React.useState(false)

  const hasRule = React.useMemo<boolean>(() => {
    return !isEmpty(data.rulesString) && data.rulesString !== "{}"
  }, [data.rulesString])

  const handleSave = () => {
    if (isString(data.rulesString)) {
      const newRule: JSONRecord = tryCatch(() => data.rulesString && JSON.parse(data.rulesString)).toUndefined()

      if (isEmpty(newRule)) {
        setIsInvalidRules(true)
      } else {
        const isLogic = jsonLogic.is_logic(newRule)

        if (isLogic) {
          /* Reformat the json */
          setData({ rulesString: JSON.stringify(newRule, null, "\t") })
          props.onSave(newRule)
        } else {
          setIsInvalidRules(true)
        }
      }
    }
  }

  const handleChangeData = (newData: RuleContainer) => {
    if (isInvalidRules) {
      setIsInvalidRules(false)
    }
    setData(newData)
  }

  const handleDelete = () => {
    setData({ rulesString: "{}" })
    props.onDelete()
  }

  const handleCancel = () => {
    if (isEmpty(data.rulesString)) {
      setData({ rulesString: "{}" })
    } else {
      setData({ rulesString: JSON.stringify(props.rules, null, "\t") })
    }
    props.onCancel()
  }

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
        <Button key="save" type="primary" disabled={!hasRule} loading={false} onClick={handleSave}>
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
      {isInvalidRules && <Alert showIcon={true} message="Cannot save! Invalid JsonLogic rules." type="error" />}
      <CodeEditorInterfaceComponent
        key="jsonlogic-editor"
        component={"code-editor"}
        defaultLanguage={"json"}
        defaultTheme={"vs-dark"}
        getRootUserInterfaceData={() => ({})}
        onChangeRootData={() => void 0}
        onChangeData={handleChangeData}
        userInterfaceData={data}
        valueKey={"rulesString"}
      />
    </Modal>
  )
}
