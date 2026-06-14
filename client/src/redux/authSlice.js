import { createSlice } from "@reduxjs/toolkit";

const saved = (() => {
  try { return JSON.parse(localStorage.getItem("rc_auth") || "null"); }
  catch { return null; }
})();

const initialState = {
  user:  saved?.user  || null,
  token: saved?.token || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, { payload }) {
      state.user  = payload.user;
      state.token = payload.token;
      localStorage.setItem("rc_auth", JSON.stringify(payload));
    },
    updateUser(state, { payload }) {
      state.user = payload;
      const stored = JSON.parse(localStorage.getItem("rc_auth") || "{}");
      localStorage.setItem("rc_auth", JSON.stringify({ ...stored, user: payload }));
    },
    logout(state) {
      state.user  = null;
      state.token = null;
      localStorage.removeItem("rc_auth");
    },
  },
});

export const { setAuth, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
