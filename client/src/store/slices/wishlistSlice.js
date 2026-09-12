import { createSlice } from '@reduxjs/toolkit';

const getInitialWishlist = () => {
  if (typeof window !== 'undefined') {
    try {
      const savedWishlist = localStorage.getItem('kingsmart_wishlist');
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

const syncWishlistToStorage = (items) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kingsmart_wishlist', JSON.stringify(items));
  }
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    wishlistItems: getInitialWishlist()
  },
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload; // Full product object: { _id, name, price, images, rating, stock, etc. }
      const exists = state.wishlistItems.find((x) => x._id === product._id);

      if (exists) {
        state.wishlistItems = state.wishlistItems.filter((x) => x._id !== product._id);
      } else {
        state.wishlistItems.push(product);
      }

      syncWishlistToStorage(state.wishlistItems);
    },
    removeFromWishlist: (state, action) => {
      const productId = action.payload;
      state.wishlistItems = state.wishlistItems.filter((x) => x._id !== productId);
      syncWishlistToStorage(state.wishlistItems);
    },
    setWishlist: (state, action) => {
      state.wishlistItems = action.payload;
      syncWishlistToStorage(state.wishlistItems);
    },
    clearWishlist: (state) => {
      state.wishlistItems = [];
      syncWishlistToStorage([]);
    }
  }
});

export const { toggleWishlist, removeFromWishlist, setWishlist, clearWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
