export type EventPayloadType = object
export type EventBusEventHandler = (eventName: string, eventPayload: EventPayloadType, source: any) => void

export class EventBus {
  private static subscriptions: { [key: string]: Map<number, EventBusEventHandler> } = {}
  private static subscriptionId = 0

  static addSubscription(eventName: string, handler: EventBusEventHandler): number {
    console.log(`EventBus: adding subscription for event ${eventName}`)
    const subscriptionId = this.subscriptionId++
    this.subscriptions[eventName] = this.subscriptions[eventName] || new Map<number, EventBusEventHandler>()
    this.subscriptions[eventName].set(subscriptionId, handler)
    return subscriptionId
  }

  static removeSubscription(eventName: string, subscriptionId: number): boolean {
    console.log(`EventBus: removing subscription for event ${eventName} with subscriptionId ${subscriptionId}`)
    const handlers = this.subscriptions[eventName]
    if (handlers) {
      if (handlers.delete(subscriptionId)) {
        return true
      }
      console.log(`EventBus: no subscription found for ${eventName} with subscriptionId ${subscriptionId}`)
    } else {
      console.log(`EventBus: no subscriptions found for ${eventName}`)
    }
    return false
  }

  static raiseEvent(eventName: string, eventPayload: EventPayloadType, source?: any): void {
    console.log(`EventBus: raising event ${eventName}`, eventPayload)
    const handlers = this.subscriptions[eventName]
    if (handlers) {
      console.log(`EventBus ${eventName} has ${handlers} subscriptions`)
      for (const [subscriptionId, handler] of handlers) {
        console.log(`EventBus ${eventName} invoking subscriptionId ${subscriptionId}`)
        handler(eventName, eventPayload, source)
      }
    }
  }
}
