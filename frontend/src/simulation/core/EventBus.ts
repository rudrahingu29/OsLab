import type { SystemEvent } from '../../types/simulation';

type EventHandler = (event: SystemEvent) => void;

export class EventBus {
  private listeners: Map<string, EventHandler[]> = new Map();

  public subscribe(eventType: string, handler: EventHandler): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(handler);
  }

  public unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      this.listeners.set(eventType, handlers.filter(h => h !== handler));
    }
  }

  public emit(event: SystemEvent): void {
    const handlers = this.listeners.get(event.type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }
}
