import { configureStore } from "@reduxjs/toolkit";
import authorizationHeaderSlice from "./reducer/authorizationHeaderSlice";
import userDetailsSlice from "./reducer/userDetailsSlice";

export default configureStore({
  reducer: {
    userDetails: userDetailsSlice,
    authorizationHeader: authorizationHeaderSlice,
  },
});
