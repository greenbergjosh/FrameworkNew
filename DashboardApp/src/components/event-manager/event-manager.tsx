import React from "react"
import hoistNonReactStatic from "hoist-non-react-statics"
import {
  BaseInterfaceComponent,
  BaseInterfaceComponentProps,
  ComponentDefinition,
  EventBus,
  EventBusEventHandler,
  utils,
  baseManageForm,
  UserInterfaceContext,
} from "@opg/interface-builder"
import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { loadRemoteLBM } from "../custom-ib-components/_shared/LBM/loadRemoteLBM"
import { AdminUserInterfaceContextManager } from "../../data/AdminUserInterfaceContextManager.type"
import { eventManagerManageFormDefinition } from "./event-manager-manage-form"
import { cloneDeep } from "lodash"

type EventMapItem = {
  type: "none" | "simple" | "lbm"
  simpleMapValue: string
  lbmId: PersistedConfig["id"]
  lbmParameters: { [key: string]: string }
}

type OutgoingEventMap = { [key: string]: EventMapItem }
type IncomingEventHandlers = { [key: string]: PersistedConfig["id"] }

class EventManagerProps {
  outgoingEventMap: OutgoingEventMap = {}
  incomingEventHandlers: IncomingEventHandlers = {}
}

export function withEventManager<T extends BaseInterfaceComponentProps, Y>(WrappedComponent: any) {
  type EventMapper = (
    props: T,
    eventName: string,
    eventPayload: any,
    parameters: { [key: string]: string }
  ) => { mappedEventName: string; mappedEventPayload: any }

  type EventHandler = (props: T, eventName: string, eventPayload: any) => Record<string, any>

  const manageFormWithEvents = getManageForm(WrappedComponent)

  class ComponentWithEvents extends BaseInterfaceComponent<T & EventManagerProps, Y> {
    displayName = `withEvents(${getDisplayName(WrappedComponent)})`

    context!: React.ContextType<typeof UserInterfaceContext>
    static contextType = UserInterfaceContext

    static manageForm(...extend: Partial<ComponentDefinition>[]) {
      return baseManageForm(...manageFormWithEvents, ...extend)
    }

    private subscriptionIds: { eventName: string; subscriptionId: number }[] = []
    private mutatedProps: Record<string, any> = {}

    componentDidMount() {
      const { loadById } = this.context as AdminUserInterfaceContextManager
      for (const eventName in this.props.incomingEventHandlers) {
        const handlerId: PersistedConfig["id"] = this.props.incomingEventHandlers[eventName]
        const handlerSrc = loadRemoteLBM(loadById, handlerId)
        const handler = utils.parseLBM<EventHandler>(handlerSrc)
        if (handler) {
          console.log(`EventManager: Subscribing to event ${eventName}`)
          this.subscriptionIds.push({
            eventName,
            subscriptionId: EventBus.addSubscription(eventName, this.makeEventHandler(handler)),
          })
        }
      }
    }

    componentWillUnmount() {
      this.subscriptionIds.forEach((subscription) => {
        EventBus.removeSubscription(subscription.eventName, subscription.subscriptionId)
      })
    }

    private onRaiseEvent(eventName: string, eventPayload: any): void {
      if (!this.props.outgoingEventMap) {
        return
      }
      console.log(`EventManager: Component raised event ${eventName}`, eventPayload)
      const eventMapItem: EventMapItem = this.props.outgoingEventMap[eventName]
      let mappedEventName: string, mappedEventPayload: any
      if (eventMapItem.type === "none") {
        return
      } else if (eventMapItem.type === "simple") {
        mappedEventName = eventMapItem.simpleMapValue
        mappedEventPayload = eventPayload
        console.log(
          `EventManager: Component raised event ${eventName} has been simple mapped to ${mappedEventName}`,
          eventPayload
        )
      } else {
        console.log(`EventManager: Invoking eventMapper for event ${eventName}`, eventPayload)
        // TODO: Add lazy LBM caching
        const { loadById } = this.context as AdminUserInterfaceContextManager
        const mapperSrc = loadRemoteLBM(loadById, eventMapItem.lbmId)
        const mapper = utils.parseLBM<EventMapper>(mapperSrc)
        if (mapper) {
          const { outgoingEventMap, incomingEventHandlers, ...passThroughProps } = this.props
          const { mappedEventName: lbmMappedEventName, mappedEventPayload: lbmMappedEventPayload } = mapper(
            passThroughProps as T,
            eventName,
            eventPayload,
            eventMapItem.lbmParameters
          )
          mappedEventName = lbmMappedEventName
          mappedEventPayload = lbmMappedEventPayload
          console.log(
            `EventManager: EventMapper mapped event ${eventName} to ${lbmMappedEventName}`,
            lbmMappedEventPayload
          )
        } else {
          throw "Could not load mapper LBM"
        }
      }
      console.log("EventManager: calling EventBus")
      EventBus.raiseEvent(mappedEventName, mappedEventPayload)
    }

    private makeEventHandler(eventHandler: EventHandler): EventBusEventHandler {
      return (eventName: string, eventPayload: any) => {
        console.log(`EventManager: Handling event ${eventName}`, eventPayload)
        const { outgoingEventMap, incomingEventHandlers, ...passThroughProps } = this.props
        const mutatedProps = eventHandler(passThroughProps as T, eventName, eventPayload)
        this.mutatedProps = { ...this.mutatedProps, ...mutatedProps }
      }
    }

    render() {
      const { outgoingEventMap, incomingEventHandlers, ...passThroughProps } = this.props
      const mergedProps = { ...passThroughProps, ...this.mutatedProps }
      return (
        <WrappedComponent
          {...mergedProps}
          onRaiseEvent={(eventName: string, eventPayload: any) => this.onRaiseEvent(eventName, eventPayload)}
        />
      )
    }
  }

  hoistNonReactStatic(ComponentWithEvents, WrappedComponent, { manageForm: true })

  return ComponentWithEvents
}

function getDisplayName(WrappedComponent: { displayName: string; name: string }) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component"
}

function getManageForm(WrappedComponent: any): any {
  const wrappedForm = WrappedComponent.manageForm()
  const mergedForm = [...wrappedForm]
  const eventManagerTabs: any = cloneDeep(eventManagerManageFormDefinition)

  eventManagerTabs[0].components[0].tabs[0].components = getOutgoingEventsForm(WrappedComponent)

  mergedForm[0].components[0].tabs = mergedForm[0].components[0].tabs.concat(eventManagerTabs)

  return mergedForm
}

function getOutgoingEventsForm(WrappedComponent: any): Partial<ComponentDefinition>[] {
  let outgoingEventComponents: Partial<ComponentDefinition>[] = []
  WrappedComponent.availableEvents &&
    WrappedComponent.availableEvents.forEach((availableEvent: string) => {
      outgoingEventComponents = outgoingEventComponents.concat([
        {
          key: `outgoingEventMap.${availableEvent}.type`,
          valueKey: `outgoingEventMap.${availableEvent}.type`,
          component: "select",
          label: availableEvent,
          dataHandlerType: "local",
          defaultValue: "none",
          data: {
            values: [
              {
                label: "None",
                value: "none",
              },
              {
                label: "Simple",
                value: "simple",
              },
              {
                label: "Function",
                value: "lbm",
              },
            ],
          },
        },
        {
          key: `outgoingEventMap.${availableEvent}.simpleMapValue`,
          valueKey: `outgoingEventMap.${availableEvent}.simpleMapValue`,
          component: "input",
          label: "Mapped Event Name",
          defaultValue: availableEvent,
          visibilityConditions: {
            "===": [
              {
                var: [`outgoingEventMap.${availableEvent}.type`],
              },
              "simple",
            ],
          },
        },
        {
          key: `outgoingEventMap.${availableEvent}.lbmId`,
          valueKey: `outgoingEventMap.${availableEvent}.lbmId`,
          label: "Event Mapper Function",
          component: "select",
          dataHandlerType: "remote-config",
          remoteConfigType: "Components.EventMapper.EventMapperFunction",
          visibilityConditions: {
            "===": [
              {
                var: [`outgoingEventMap.${availableEvent}.type`],
              },
              "lbm",
            ],
          },
        },
        {
          key: `outgoingEventMap.${availableEvent}.lbmParameters`,
          valueKey: `outgoingEventMap.${availableEvent}.lbmParameters`,
          label: "Mapper Function Parameters",
          help: "Give additional properties to the event mapper function",
          component: "data-dictionary",
          keyLabel: "Property Name",
          valueComponent: [
            {
              hidden: false,
              maxRows: null,
              minRows: 1,
              autosize: true,
              maxLength: null,
              valueKey: "value",
              label: "Value",
              hideLabel: false,
              component: "input",
            },
          ],
          defaultValue: [],
          multiple: true,
          visibilityConditions: {
            "===": [
              {
                var: [`outgoingEventMap.${availableEvent}.type`],
              },
              "lbm",
            ],
          },
        },
      ])
    })

  return outgoingEventComponents
}
