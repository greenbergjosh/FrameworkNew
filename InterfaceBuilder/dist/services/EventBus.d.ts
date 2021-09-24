export declare type EventPayloadType = Record<string, unknown>;
export declare type EventBusEventHandler = (eventName: string, eventPayload: EventPayloadType, source: any) => void;
export declare class EventBus {
    private static subscriptions;
    private static subscriptionId;
    static addSubscription(eventName: string, handler: EventBusEventHandler): number;
    static removeSubscription(eventName: string, subscriptionId: number): boolean;
    static raiseEvent(eventName: string, eventPayload: EventPayloadType, source?: any): void;
}
//# sourceMappingURL=EventBus.d.ts.map