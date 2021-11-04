import classNames from "classnames"
import React from "react"
import styled, { css } from "styled-components"
import styles from "../styles.scss"
import { ComponentRenderer, DataPathContext } from "@opg/interface-builder"
import { DisplayModeProps } from "types"
import { isEmpty } from "lodash/fp"

const A = styled.a`
  ${({ styleString }: { styleString: string }) => css`
    ${styleString}
  `}
`

const Span = styled.span`
  ${({ styleString }: { styleString: string }) => css`
    ${styleString}
  `}
`

export function DisplayMode(props: DisplayModeProps): JSX.Element {
  /**
   * This callback handler is provided for clients that want to wrap this component.
   * Allows the client to intercept the click event and receive the token-resolved URI.
   */
  const handleClick: React.MouseEventHandler<HTMLAnchorElement> | undefined = (e): void => {
    if (props.onClick) {
      props.onClick(props.uri, e)
      e.preventDefault()
    }
  }

  /* ACTIVE LINK */
  if (!props.disabled) {
    return (
      <A
        styleString={props.style}
        className={classNames("container", styles.link)}
        href={props.uri}
        onClick={handleClick}>
        <ChildComponents {...props} />
      </A>
    )
  }

  /* DISABLED LINK */
  return (
    <Span styleString={props.style} className={classNames("container", styles.link, styles.disabled)}>
      <ChildComponents {...props} />
    </Span>
  )
}

function ChildComponents(props: DisplayModeProps) {
  return (
    <>
      {isEmpty(props.components) ? (
        <>{props.linkLabel || "Link"}</>
      ) : (
        <DataPathContext path="components">
          <ComponentRenderer
            components={props.components}
            data={props.userInterfaceData}
            getRootUserInterfaceData={props.getRootUserInterfaceData}
            onChangeRootData={props.onChangeRootData}
            onChangeData={props.onChangeData}
            onChangeSchema={() => void 0}
          />
        </DataPathContext>
      )}
    </>
  )
}
