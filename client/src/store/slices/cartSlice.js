import { createSlice } from '@reduxjs/toolkit';

const getInitialCart = () => {
  if (typeof window !== 'undefined') {
    try {
      const savedCart = localStorage.getItem('kingsmart_cart');
      return savedCart ? JSON.parse(savedCart) : {
        cartItems: [],
        promoCode: null,
        itemsPrice: 0,
        shippingPrice: 0,
        discountPrice: 0,
        totalPrice: 0
      };
    } catch (e) {
      return {
        cartItems: [],
        promoCode: null,
        itemsPrice: 0,
        shippingPrice: 0,
        discountPrice: 0,
        totalPrice: 0
      };
    }
  }
  return {
    cartItems: [],
    promoCode: null,
    itemsPrice: 0,
    shippingPrice: 0,
    discountPrice: 0,
    totalPrice: 0
  };
};

const updateCartTotals = (state) => {
  // 1. Calculate items price (subtotal)
  state.itemsPrice = state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  // 2. Calculate shipping price (Free above ₦150,000, else ₦15,000)
  if (state.itemsPrice === 0) {
    state.shippingPrice = 0;
  } else {
    state.shippingPrice = state.itemsPrice >= 150000 ? 0 : 15000;
  }

  // 3. Calculate discount price
  if (state.promoCode) {
    if (state.promoCode.discountType === 'percentage') {
      state.discountPrice = state.itemsPrice * (state.promoCode.discountValue / 100);
    } else if (state.promoCode.discountType === 'fixed') {
      state.discountPrice = Math.min(state.promoCode.discountValue, state.itemsPrice);
    }
  } else {
    state.discountPrice = 0;
  }

  // 4. Calculate total price
  state.totalPrice = Math.max(0, state.itemsPrice - state.discountPrice + state.shippingPrice);

  // 5. Sync to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('kingsmart_cart', JSON.stringify({
      cartItems: state.cartItems,
      promoCode: state.promoCode,
      itemsPrice: state.itemsPrice,
      shippingPrice: state.shippingPrice,
      discountPrice: state.discountPrice,
      totalPrice: state.totalPrice
    }));
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: getInitialCart(),
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload; // { product (id), name, price, image, size, color, qty, stock }
      
      // Match key: product ID + size + color
      const existItem = state.cartItems.find(
        (x) => x.product === item.product && x.size === item.size && x.color === item.color
      );

      if (existItem) {
        existItem.qty = Math.min(existItem.qty + item.qty, item.stock);
      } else {
        state.cartItems.push(item);
      }

      updateCartTotals(state);
    },
    removeFromCart: (state, action) => {
      const { product, size, color } = action.payload;
      state.cartItems = state.cartItems.filter(
        (x) => !(x.product === product && x.size === size && x.color === color)
      );
      updateCartTotals(state);
    },
    updateCartQty: (state, action) => {
      const { product, size, color, qty } = action.payload;
      const item = state.cartItems.find(
        (x) => x.product === product && x.size === size && x.color === color
      );
      if (item) {
        item.qty = qty;
      }
      updateCartTotals(state);
    },
    applyPromoCode: (state, action) => {
      state.promoCode = action.payload; // { code, discountType, discountValue }
      updateCartTotals(state);
    },
    removePromoCode: (state) => {
      state.promoCode = null;
      updateCartTotals(state);
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.promoCode = null;
      updateCartTotals(state);
    }
  }
});

export const {
  addToCart,
  removeFromCart,
  updateCartQty,
  applyPromoCode,
  removePromoCode,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
