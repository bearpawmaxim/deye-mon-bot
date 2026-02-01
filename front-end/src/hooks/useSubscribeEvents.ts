import { useEffect } from "react";
import { eventsService } from "../services";
import { EventItem } from "../types";

export function useSubscribeEvents(callback: (event: EventItem) => void) {
  useEffect(() => {
    const unsubscribe = eventsService.subscribe(callback);

    return () => {
      unsubscribe();
    };
  }, [callback]);
}
