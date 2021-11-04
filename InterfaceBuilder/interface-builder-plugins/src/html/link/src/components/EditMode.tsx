import React from "react"
import styled, { css } from "styled-components"
import classNames from "classnames"
import styles from "../styles.scss"
import { ComponentDefinition, ComponentRenderer, DataPathContext } from "@opg/interface-builder"
import { EditModeProps } from "../types"
import { set, isEmpty } from "lodash/fp"

const Span = styled.span`
  ${({ styleString }: { styleString: string }) => css`
    ${styleString}
  `}
`

export function EditMode(props: EditModeProps): JSX.Element {
  const handleChangeSchema = (newSchema: ComponentDefinition[]) => {
    const { onChangeSchema, userInterfaceSchema } = props
    onChangeSchema && userInterfaceSchema && onChangeSchema(set("components", newSchema, userInterfaceSchema))
  }

  return (
    <Span
      styleString={props.style}
      className={classNames("container", styles.link, props.disabled ? styles.disabled : null)}>
      {isEmpty(props.components) && <span className={styles.label}>{props.linkLabel || "Link"}</span>}
      <DataPathContext path="components">
        <ComponentRenderer
          components={props.components}
          data={props.userInterfaceData}
          getRootUserInterfaceData={props.getRootUserInterfaceData}
          onChangeRootData={props.onChangeRootData}
          onChangeData={props.onChangeData}
          onChangeSchema={handleChangeSchema}
        />
      </DataPathContext>
    </Span>
  )
}
