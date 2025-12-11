import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExtDataItem, ExtDataState } from "../types";
import { createExtData, deleteExtData, fetchExtData } from "../thunks";
import { ObjectId } from "../../schemas";

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
      .addCase(deleteExtData.fulfilled, (state, action: PayloadAction<ObjectId>) => {
        state.extData = state.extData.filter(item => item.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteExtData.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const extDataReducer = extDataSlice.reducer;

