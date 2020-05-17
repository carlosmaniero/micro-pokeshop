export type EventBusListener<T> = (detail: T) => void;

export interface EventSubscription {
    unsubscribe: () => void;
}

export type EventPublisher = <T>(eventName: string, detail?: T) => void;

export type EventSubscriber = <T>(eventName: string, listener: EventBusListener<T>) => EventSubscription;

export const publishEvent: EventPublisher = <T>(eventName: string, detail?: T) => {
    const event = new CustomEvent<T>(eventName, {
        bubbles: true,
        detail: detail
    });

    document.dispatchEvent(event);
}

export const subscribeToEvent = <T>(eventName: string, listener: EventBusListener<T>): EventSubscription => {
    const listenerWrapped = (event: CustomEvent) => {
        listener(event.detail);
    };

    document.addEventListener(eventName, listenerWrapped as any);

    return createSubscription(eventName, listenerWrapped as any);
}

const createSubscription = (eventName: string, listener: EventListener): EventSubscription => ({
    unsubscribe: () => {
        document.removeEventListener(eventName, listener);
    },
})