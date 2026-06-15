import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import checkinReducer from './slices/checkinSlice';
import friendReducer from './slices/friendSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    checkin: checkinReducer,
    friend: friendReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
