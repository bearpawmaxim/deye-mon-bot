import { createAsyncThunk } from "@reduxjs/toolkit";
import { LookupSchema, LookupValue } from "../../types";
import { getErrorMessage } from "../../utils";
import apiClient from "../../utils/apiClient";

type FetchLookupResult = {
  schema: LookupSchema;
  items: LookupValue[];
};

export const fetchLookupValues = createAsyncThunk<
  FetchLookupResult,
  LookupSchema
>(
  'lookupValues/fetchLookupVvalues',
  async (schema, { fulfillWithValue, rejectWithValue }) => {
    try {
      const items = await apiClient.get<LookupValue[]>(`/lookup/${schema}`);
      return fulfillWithValue({ schema, items: items.data } as FetchLookupResult);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Error fetching lookup values'));
    }
  }
);
