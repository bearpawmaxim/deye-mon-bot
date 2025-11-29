export type EventItem = {
  type: string;
  data: Record<string, string>;
  private: boolean;
  user?: string;
};

type Listener = (event: EventItem) => void;

class EventsService {
  private evt?: EventSource;
  private listeners = new Set<Listener>();
  private url: string;

  private retryAttempt = 0;
  private maxDelay = 15000;
  private reconnectTimeout?: number;

  constructor(url: string) {
    this.url = url;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
  }

  unsubscribe(listener: Listener) {
    this.listeners.delete(listener);
  }

  private scheduleReconnect(token?: string) {
    const delay = Math.min(this.maxDelay, 1000 * Math.pow(2, this.retryAttempt));
    console.warn(`[Events] Reconnecting in ${delay}ms... (attempt ${this.retryAttempt})`);

    this.reconnectTimeout = window.setTimeout(() => {
      this.connect(token);
    }, delay);
  }

  connect(token?: string) {
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
        const data = JSON.parse(e.data);
        this.listeners.forEach(listener => listener(data));
      } catch (err: unknown) {
        console.error("[Events] error", err);
      }
    };

    evt.onerror = () => {
      console.warn("[Events] connection lost");
      evt.close();

      this.retryAttempt++;
      this.scheduleReconnect(token);
    };
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.evt?.close();
  }
}

export const eventsService = new EventsService("/api/events");
