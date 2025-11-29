import { LookupSchema, LookupValue } from "../../types";

export type LookupValuesState = {
  items: Record<LookupSchema, LookupValue[]>;
  loading: Record<LookupSchema, boolean>;
  error: Record<LookupSchema, string | null>;
};
