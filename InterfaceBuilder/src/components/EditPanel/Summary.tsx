import React from "react"
import styles from "./styles.scss"
import { EventMapItem } from "components/withEvents/types"
import { SummaryProps } from "components/EditPanel/types"
import { toPairs } from "lodash"
import classNames from "classnames"
import { Icon } from "antd"

type EventMapItemKVP = [string, EventMapItem]

export const Summary: React.FC<SummaryProps> = (props): JSX.Element | null => {
  const [expanded, setExpanded] = React.useState(true)
  const incomingEventHandlers = props.incomingEventHandlers || []

  const eventMapItems = toPairs(props.outgoingEventMap).reduce<EventMapItemKVP[]>((acc, [key, val]) => {
    if (val.simpleMapValue !== key && val.simpleMapValue.length > 0) {
      acc.push([key, val])
    }
    return acc
  }, [])

  if (incomingEventHandlers.length < 1 && eventMapItems.length < 1) {
    return null
  }

  return (
    <div className={styles.summary} onClick={() => setExpanded(!expanded)}>
      {expanded ? <Icon type="down" className={styles.toggle} /> : <Icon type="right" className={styles.toggle} />}
      {expanded ? null : <strong>Events</strong>}
      <div className={classNames(styles.info, !expanded ? styles.collapsed : null)}>
        {eventMapItems.length > 0 ? (
          <>
            <strong>Outgoing Events:</strong>
            <ul>
              {eventMapItems.map(([key, val], idx) => {
                return (
                  <li key={`outgoingEventMap-${idx}`}>
                    {val.simpleMapValue} ({key})
                  </li>
                )
              })}
            </ul>
          </>
        ) : null}
        {incomingEventHandlers.length > 0 ? (
          <>
            <strong>Incoming Events:</strong>
            <ul>
              {incomingEventHandlers.map((item, idx) => (
                <li key={`incomingEventHandler-${idx}`}>{item.eventName}</li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  )
}
