import { createSlice } from '@reduxjs/toolkit';

const getInitialUser = () => {
  if (typeof window !== 'undefined') {
    try {
      const savedUser = localStorage.getItem('kingsmart_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

const initialState = {
  userInfo: getInitialUser(),
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.userInfo = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('kingsmart_user', JSON.stringify(action.payload));
      }
    },
    loginFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.userInfo = null;
      state.loading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kingsmart_user');
      }
    },
    updateProfileSuccess: (state, action) => {
      state.loading = false;
      // Merge new profile data but preserve access/refresh tokens
      const updatedUser = {
        ...state.userInfo,
        ...action.payload
      };
      state.userInfo = updatedUser;
      if (typeof window !== 'undefined') {
        localStorage.setItem('kingsmart_user', JSON.stringify(updatedUser));
      }
    },
    setAddresses: (state, action) => {
      if (state.userInfo) {
        state.userInfo.addresses = action.payload;
        if (typeof window !== 'undefined') {
          localStorage.setItem('kingsmart_user', JSON.stringify(state.userInfo));
        }
      }
    },
    setWishlistIds: (state, action) => {
      if (state.userInfo) {
        state.userInfo.wishlist = action.payload;
        if (typeof window !== 'undefined') {
          localStorage.setItem('kingsmart_user', JSON.stringify(state.userInfo));
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  loginRequest,
  loginSuccess,
  loginFail,
  logout,
  updateProfileSuccess,
  setAddresses,
  setWishlistIds,
  clearError
} = authSlice.actions;

export default authSlice.reducer;
