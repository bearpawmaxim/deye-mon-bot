import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExtDataItem, ExtDataState } from "../types";
import { createExtData, deleteExtData, fetchExtData } from "../thunks";
import { PageableResponse } from "../../types";

const initialState: ExtDataState = {
  items: [],
  loading: false,
  error: null,
  paging: {
    page: 0,
    pageSize: 10,
    total: 0,
  },
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
      .addCase(fetchExtData.fulfilled, (state, { payload }: PayloadAction<PageableResponse<ExtDataItem>>) => {
        state.items = payload.data;
        state.paging = payload.paging;
        state.loading = false;
      })
      .addCase(fetchExtData.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createExtData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExtData.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createExtData.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteExtData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExtData.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteExtData.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const extDataReducer = extDataSlice.reducer;
