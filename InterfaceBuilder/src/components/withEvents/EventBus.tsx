import { EventBusEventHandler, EventPayloadType } from "./types"

export class EventBus {
  private static subscriptions: { [key: string]: Map<number, EventBusEventHandler> } = {}
  private static subscriptionId = 0

  static addSubscription = (eventName: string, handler: EventBusEventHandler): number => {
    console.log(`EventBus: Adding subscription for event "${eventName}"`)
    const subscriptionId = EventBus.subscriptionId++
    EventBus.subscriptions[eventName] = EventBus.subscriptions[eventName] || new Map<number, EventBusEventHandler>()
    EventBus.subscriptions[eventName].set(subscriptionId, handler)
    return subscriptionId
  }

  static removeSubscription = (eventName: string, subscriptionId: number): boolean => {
    console.log(`EventBus: Removing subscription for event "${eventName}" with subscriptionId ${subscriptionId}`)
    const handlers = EventBus.subscriptions[eventName]
    if (handlers) {
      if (handlers.delete(subscriptionId)) {
        return true
      }
      console.log(`EventBus: No subscription found for "${eventName}" with subscriptionId ${subscriptionId}`)
    } else {
      console.log(`EventBus: No subscriptions found for "${eventName}"`)
    }
    return false
  }

  static raiseEvent = (eventName: string, eventPayload: EventPayloadType, source?: any): void => {
    console.log(`EventBus: raising event "${eventName}"`, eventPayload)
    const handlers = EventBus.subscriptions[eventName]
    if (handlers) {
      console.log(`EventBus "${eventName}" has ${handlers.size} subscriptions`)
      for (const [subscriptionId, handler] of handlers) {
        console.log(`EventBus "${eventName}" invoking subscriptionId ${subscriptionId}`)
        handler(eventName, eventPayload, source)
      }
    }
  }
}
