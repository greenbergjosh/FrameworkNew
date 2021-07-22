import React from "react"
import hoistNonReactStatic from "hoist-non-react-statics"
import { ComponentDefinition } from "../../globalTypes"
import { BaseInterfaceComponent } from "../BaseInterfaceComponent/BaseInterfaceComponent"
import { BaseInterfaceComponentProps } from "../BaseInterfaceComponent/types"
import { baseManageForm } from "../BaseInterfaceComponent/base-manage-form"
import { EventBusEventHandler, EventMapItem, EventPayloadType, IncomingEventHandler, OutgoingEventMap } from "./types"
import { EventBus } from "./EventBus"
import * as utils from "../../lib/parseLBM"
import { isEmpty } from "lodash/fp"
import { getManageForm } from "./manage-form/getManageForm"

class EventManagerProps {
  outgoingEventMap: OutgoingEventMap = {}
  incomingEventHandlers: IncomingEventHandler[] = []
}

class EventManagerState {
  mutatedProps: Record<string, any> = {}
}

/**
 * NOTE: We tried to define WrappedComponent parameter type and the return type. But both
 * proved to be beyond our technical abilities. So, we set WrappedComponent to any and
 * don't define the return type.
 * @param WrappedComponent
 */
export function withEvents<T extends BaseInterfaceComponentProps, Y>(WrappedComponent: any): any {
  type EventHandler = utils.LBMFunctionType<
    T,
    {
      eventName: string
      eventPayload: EventPayloadType
      eventParameters: { [key: string]: string }
      target: any
      source: any
    },
    Record<string, any>
  >

  const manageFormWithEvents = getManageForm(WrappedComponent)

  class ComponentWithEvents extends BaseInterfaceComponent<T & EventManagerProps, Y & EventManagerState> {
    private currentRef: any
    constructor(props: T & EventManagerProps) {
      super(props)
      this.currentRef = React.createRef()
      this.state = { ...this.state, mutatedProps: {} }
    }

    displayName = `withEvents(${getDisplayName(WrappedComponent)})`

    static manageForm(...extend: Partial<ComponentDefinition>[]) {
      return baseManageForm(...manageFormWithEvents, ...extend)
    }

    private subscriptionIds: { eventName: string; subscriptionId: number }[] = []

    componentDidMount() {
      this.props.incomingEventHandlers &&
        this.props.incomingEventHandlers.forEach((eventInfo: IncomingEventHandler) => {
          if (isEmpty(eventInfo.handlerFunctionSrc)) {
            console.warn(`No handlerFunctionSrc for event ${eventInfo.eventName} for component ${this.displayName}`)
            return
          }

          const eventHandler = utils.parseLBM<
            T,
            {
              eventName: string
              eventPayload: EventPayloadType
              eventParameters: { [key: string]: string }
              target: any
              source: any
            },
            Record<string, any>
          >(eventInfo.handlerFunctionSrc)
          if (eventHandler) {
            console.log(`EventManager: Subscribing to event "${eventInfo.eventName}"`)
            this.subscriptionIds.push({
              eventName: eventInfo.eventName,
              subscriptionId: EventBus.addSubscription(
                eventInfo.eventName,
                this.makeEventHandler(eventHandler, eventInfo.handlerFunctionParameters)
              ),
            })
          }
        })
    }

    componentWillUnmount() {
      this.subscriptionIds.forEach((subscription) => {
        EventBus.removeSubscription(subscription.eventName, subscription.subscriptionId)
      })
    }

    /**
     *
     * @param eventName
     * @param eventPayload
     * @param source
     */
    private onRaiseEvent(eventName: string, eventPayload: EventPayloadType, source: any): void {
      if (!this.props.outgoingEventMap) {
        return
      }
      console.log(`EventManager: Component raised event "${eventName}"`, eventPayload)
      const eventMapItem: EventMapItem = this.props.outgoingEventMap[eventName]
      let mappedEventName: string, mappedEventPayload: EventPayloadType
      if (!eventMapItem || eventMapItem.type === "none") {
        return
      } else if (eventMapItem.type === "simple") {
        mappedEventName = eventMapItem.simpleMapValue
        mappedEventPayload = eventPayload
        console.log(
          `EventManager: Component raised event "${eventName}" has been simple mapped to "${mappedEventName}"`,
          eventPayload
        )
      } else {
        console.log(`EventManager: Invoking eventMapper for event "${eventName}"`, eventPayload)

        const mapper = eventMapItem.lbmSrc
          ? utils.parseLBM<
              T,
              {
                eventName: string
                eventPayload: EventPayloadType
                parameters: { [key: string]: string }
              },
              { mappedEventName: string; mappedEventPayload: EventPayloadType }
            >(eventMapItem.lbmSrc)
          : undefined

        if (mapper) {
          const { ...passThroughProps } = this.props
          const mapped = mapper({
            props: passThroughProps as T,
            lib: {
              getValue: this.getValue.bind(this),
              setValue: this.setValue.bind(this),
              raiseEvent: EventBus.raiseEvent,
            },
            args: {
              eventName,
              eventPayload,
              parameters: eventMapItem.lbmParameters,
            },
          })

          const { mappedEventName: lbmMappedEventName, mappedEventPayload: lbmMappedEventPayload } = mapped
          mappedEventName = lbmMappedEventName
          mappedEventPayload = lbmMappedEventPayload
          console.log(
            `EventManager: EventMapper mapped event "${eventName}" to "${lbmMappedEventName}"`,
            lbmMappedEventPayload
          )
        } else {
          throw new Error("Could not load mapper LBM")
        }
      }
      console.log("EventManager: calling EventBus")
      EventBus.raiseEvent(mappedEventName, mappedEventPayload, source)
    }

    /**
     *
     * @param eventHandler
     * @param eventHandlerParameters
     */
    private makeEventHandler(
      eventHandler: EventHandler,
      eventHandlerParameters: { [key: string]: string }
    ): EventBusEventHandler {
      return (eventName: string, eventPayload: EventPayloadType, source: any) => {
        console.log(`EventManager: Handling event "${eventName}"`, eventPayload)
        const { ...passThroughProps } = this.props
        const mutatedProps = eventHandler({
          props: passThroughProps as T,
          lib: {
            getValue: this.getValue.bind(this),
            setValue: this.setValue.bind(this),
            raiseEvent: EventBus.raiseEvent,
          },
          args: {
            eventName,
            eventPayload,
            eventParameters: eventHandlerParameters,
            target: this.currentRef.current,
            source,
          },
        })
        this.setState((prevState) => ({ ...prevState, mutatedProps }))
      }
    }

    render() {
      const { ...passThroughProps } = this.props
      const mutatedProps = this.state ? this.state.mutatedProps : {}
      const mergedProps = { ...passThroughProps, ...mutatedProps }
      return (
        <WrappedComponent
          ref={this.currentRef}
          {...mergedProps}
          onRaiseEvent={(eventName: string, eventPayload: EventPayloadType, source: any) =>
            this.onRaiseEvent(eventName, eventPayload, source)
          }
        />
      )
    }
  }

  hoistNonReactStatic(ComponentWithEvents, WrappedComponent, { manageForm: true })

  return ComponentWithEvents
}

/**
 *
 * @param WrappedComponent
 */
export function getDisplayName(WrappedComponent: { displayName: string; name: string }): string {
  return WrappedComponent.displayName || WrappedComponent.name || "Component"
}
