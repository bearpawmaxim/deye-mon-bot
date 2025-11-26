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

  constructor(url: string) {
    this.url = url;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
  }

  unsubscribe(listener: Listener) {
    this.listeners.delete(listener);
  }

  connect(token?: string) {
    if (this.evt) {
      this.evt.close();
    }

    const fullUrl = token ? `${this.url}?token=${token}` : this.url;
    console.log("[Events] Connecting to:", fullUrl);

    const evt = new EventSource(fullUrl);
    this.evt = evt;

    evt.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        this.listeners.forEach(listener => listener(data));
      } catch (err: unknown) {
        console.error("[Events] error", err);
      }
    };

    evt.onerror = (err) => {
      console.warn("[Events] error", err);
    };
  }

  disconnect() {
    this.evt?.close();
  }
}

export const eventsService = new EventsService("/api/events");
