import { createSlice } from "@reduxjs/toolkit";

export const authorizationHeaderSlice = createSlice({
  name: "authorizationHeader",
  initialState: {
    value: "",
  },
  reducers: {
    setAuthorizationHeader: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setAuthorizationHeader } = authorizationHeaderSlice.actions;
export default authorizationHeaderSlice.reducer;
