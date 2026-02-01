import { EventItem } from "../types";

type Listener = (event: EventItem) => void;

class EventsService {
  private evt?: EventSource;
  private listeners = new Set<Listener>();
  private url: string;

  private retryAttempt = 0;
  private maxDelay = 15000;
  private reconnectTimeout?: number;

  private token?: string;
  private subscribersCount = 0;

  constructor(url: string) {
    this.url = url;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    this.subscribersCount++;

    if (this.subscribersCount === 1) {
      this.connect(this.token);
    }

    return () => {
      this.unsubscribe(listener);
    };
  }

  unsubscribe(listener: Listener) {
    if (!this.listeners.has(listener)) return;

    this.listeners.delete(listener);
    this.subscribersCount--;

    if (this.subscribersCount === 0) {
      this.disconnect();
    }
  }

  private scheduleReconnect(token?: string) {
    const delay = Math.min(this.maxDelay, 1000 * Math.pow(2, this.retryAttempt));
    console.warn(
      `[Events] Reconnecting in ${delay}ms... (attempt ${this.retryAttempt})`
    );

    this.reconnectTimeout = window.setTimeout(() => {
      this.connect(token);
    }, delay);
  }

  connect(token?: string) {
    this.token = token;

    if (this.subscribersCount === 0) {
      return;
    }

    if (this.evt) {
      this.evt.close();
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const fullUrl = token ? `${this.url}?token=${token}` : this.url;
    console.log("[Events] Connecting to:", fullUrl);

    const evt = new EventSource(fullUrl);
    this.evt = evt;

    evt.onopen = () => {
      console.log("[Events] connected");
      this.retryAttempt = 0;
    };

    evt.onmessage = (e) => {
      try {
        const data: EventItem = JSON.parse(e.data);
        this.listeners.forEach(listener => listener(data));
      } catch (err) {
        console.error("[Events] error parsing message", err);
      }
    };

    evt.onerror = () => {
      console.warn("[Events] connection lost");
      evt.close();
      this.evt = undefined;

      this.retryAttempt++;
      this.scheduleReconnect(this.token);
    };
  }

  reconnect(token?: string) {
    this.token = token;
    this.disconnect();

    if (this.subscribersCount > 0) {
      this.connect(this.token);
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }

    if (this.evt) {
      this.evt.close();
      this.evt = undefined;
    }
  }

  setToken(token?: string) {
    this.token = token;
  }
}

export const eventsService = new EventsService("/api/events");
