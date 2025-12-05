import { createSlice } from "@reduxjs/toolkit";
import { LookupValuesState } from "../types";
import { fetchLookupValues } from "../thunks/lookupValues";

const initialState: LookupValuesState = {
  items: {
    building: [],
    message: [],
    station: [],
    user: [],
    reporter_user: [],
  },
  loading: {
    building: false,
    message: false,
    station: false,
    user: false,
    reporter_user: false,
  },
  error: {
    building: null,
    message: null,
    station: null,
    user: null,
    reporter_user: null,
  },
};

const lookupValuesSlice = createSlice({
  name: 'lookupValues',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLookupValues.pending, (state, action) => {
        const schema = action.meta.arg;
        state.loading[schema] = true;
        state.error[schema] = null;
        state.items[schema] = [];
      })
      .addCase(fetchLookupValues.fulfilled, (state, action) => {
        const { schema, items } = action.payload;
        state.items[schema] = items;
        state.loading[schema] = false;
      })
      .addCase(fetchLookupValues.rejected, (state, action) => {
        const schema = action.meta.arg;
        state.loading[schema] = false;
        state.error[schema] = action.error.message || 'Unknown error';
      });
  },
});

export const lookupValuesReducer = lookupValuesSlice.reducer;