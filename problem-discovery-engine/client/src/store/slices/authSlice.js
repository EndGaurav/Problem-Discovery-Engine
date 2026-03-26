import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isAuthModalOpen: false,
  authModalMode: 'login', // login, register, verify, forgot, reset
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.isAuthModalOpen = false;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    },
    openAuthModal: (state, action) => {
      state.isAuthModalOpen = true;
      state.authModalMode = action.payload || 'login';
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  },
});

export const { setCredentials, logout, updateUser, openAuthModal, closeAuthModal } = authSlice.actions;
export default authSlice.reducer;
