import { DependencyList, EffectCallback, useEffect } from "react"
import i18n from "../i18n";

export function useLocalizedEffect(effect: EffectCallback, deps: DependencyList = []): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useEffect(effect, [...deps, i18n.language]);
}