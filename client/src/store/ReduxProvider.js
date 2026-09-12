'use client';

import { Provider } from 'react-redux';
import { store } from './index.js';

export function ReduxProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}

export default ReduxProvider;
