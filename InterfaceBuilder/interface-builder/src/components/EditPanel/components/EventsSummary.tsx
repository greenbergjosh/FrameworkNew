import React from "react"
import { EventsSummaryProps } from "../types"

export const EventsSummary: React.FC<EventsSummaryProps> = (props): JSX.Element | null => {
  return (
    <div className={props.className}>
      {props.eventMapItems && props.eventMapItems.length > 0 ? (
        <>
          <strong>Outgoing Events:</strong>
          <ul>
            {props.eventMapItems.map(([key, val], idx) => {
              return (
                <li key={`outgoingEventMap-${idx}`}>
                  {val.simpleMapValue} ({key})
                </li>
              )
            })}
          </ul>
        </>
      ) : null}
      {props.incomingEventHandlers && props.incomingEventHandlers.length > 0 ? (
        <>
          <strong>Incoming Events:</strong>
          <ul>
            {props.incomingEventHandlers.map((item, idx) => (
              <li key={`incomingEventHandler-${idx}`}>{item.eventName}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}
