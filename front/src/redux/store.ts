import {combineReducers, configureStore} from "@reduxjs/toolkit";
import counterReducer from '@/redux/features/counterSlice'
import storage from "@/redux/ssr-safe-storage";
import {persistReducer} from 'redux-persist';
import {FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER} from "redux-persist/es/constants";


// Tạo rootReducer bao gồm reducers quản lý API và reducers quản lý state
const rootReducer = combineReducers({
    // Reducers quản lý state
    counter: counterReducer,
})

// Cấu hình Redux Persist
export const persistConfig = {
    key: 'kss',
    storage,
    // Những reducer được đăng ký trong whitelist sẽ được lưu trữ trong local storage
    blacklist: ['counter']
}

// Cấu hình persist cho rootReducer để nó có thể lưu trữ dài hạn
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
    return configureStore({
        reducer: persistedReducer,
        devTools: process.env.NODE_ENV !== "production",
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                },
            }),
    });
};

// Xuất kiểu dữ liệu của AppStore, RootState và AppDispatch để sử dụng trong các module khác
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
