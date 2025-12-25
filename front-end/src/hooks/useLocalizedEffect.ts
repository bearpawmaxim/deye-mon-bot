/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import { DependencyList, EffectCallback, useEffect } from "react"
import i18n from "../i18n";

export function useLocalizedEffect(effect: EffectCallback, deps?: DependencyList): void {
  return deps
    ? useEffect(effect, [...deps, i18n.language])
    : useEffect(effect, [i18n.language]);
}