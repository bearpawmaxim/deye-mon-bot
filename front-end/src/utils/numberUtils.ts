import { NumberRange } from "../types";

export function parseNumberRange(value: string): NumberRange {
  if (!value) {
    return { from: null, to: null };
  }

  const parts = value.split(",").map(p => p.trim()).filter(Boolean);

  if (parts.length === 1) {
    const num = Number(parts[0]);
    if (isNaN(num)) {
      return { from: null, to: null };
    }
    return { from: num, to: num };
  }

  if (parts.length === 2) {
    const from = Number(parts[0]);
    const to = Number(parts[1]);
    if (isNaN(from) || isNaN(to)) {
      return { from: null, to: null };
    }
    return { from, to };
  }

  return { from: null, to: null };
}

export function formatNumberRange(range: NumberRange): string | null {
  const { from, to } = range;

  if (from != null && to != null) {
    return from === to ? `${from}` : `${from}, ${to}`;
  }

  if (from != null) {
    return `${from}`;
  }

  return null;
}
