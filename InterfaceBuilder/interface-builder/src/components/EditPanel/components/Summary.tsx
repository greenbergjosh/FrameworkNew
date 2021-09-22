import React from "react"
import styles from "../styles.scss"
import { EventMapItemKVP, SummaryProps } from "../types"
import classNames from "classnames"
import { Icon } from "antd"
import { EventsSummary } from "./EventsSummary"
import { ComponentSummary } from "./ComponentSummary"
import { toPairs } from "lodash"

export const Summary: React.FC<SummaryProps> = (props): JSX.Element | null => {
  const [expanded, setExpanded] = React.useState(true)
  const summary =
    props.component && props.componentDefinition && props.component.getSummary
      ? props.component.getSummary(props.componentDefinition)
      : undefined
  const incomingEventHandlers = (props.componentDefinition && props.componentDefinition.incomingEventHandlers) || []
  const eventMapItems = toPairs((props.componentDefinition && props.componentDefinition.outgoingEventMap) || []).reduce<
    EventMapItemKVP[]
  >((acc, [key, val]) => {
    if (val.simpleMapValue && val.simpleMapValue !== key && val.simpleMapValue.length > 0) {
      acc.push([key, val])
    }
    return acc
  }, [])

  if (incomingEventHandlers.length < 1 && eventMapItems.length < 1 && !summary) {
    return null
  }

  return (
    <div className={styles.summary} onClick={() => setExpanded(!expanded)}>
      {expanded ? <Icon type="down" className={styles.toggle} /> : <Icon type="right" className={styles.toggle} />}
      <div className={styles.contentPanel}>
        <div className={styles.header}>Component info</div>
        <div className={classNames(styles.collapsiblePanel, !expanded ? styles.collapsed : null)}>
          <ComponentSummary className={styles.block} summary={summary} />
          <EventsSummary
            className={styles.block}
            incomingEventHandlers={incomingEventHandlers}
            eventMapItems={eventMapItems}
          />
        </div>
      </div>
    </div>
  )
}
