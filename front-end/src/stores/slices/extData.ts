import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExtDataItem, ExtDataState } from "../types";
import { fetchExtData } from "../thunks";

const initialState: ExtDataState = {
  extData: [],
  loading: false,
  error: null,
};

export const extDataSlice = createSlice({
  name: 'extData',
  initialState: initialState,
  reducers: {

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExtData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExtData.fulfilled, (state, action: PayloadAction<Array<ExtDataItem>>) => {
        state.extData = action.payload;
        state.loading = false;
      })
      .addCase(fetchExtData.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const extDataReducer = extDataSlice.reducer;

