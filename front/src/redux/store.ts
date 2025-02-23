import {combineReducers, configureStore} from "@reduxjs/toolkit";
import counterReducer from '@/redux/features/counterSlice'
import storage from "@/redux/ssr-safe-storage";
import {persistReducer} from 'redux-persist';
import {FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE} from "redux-persist/es/constants";
import {pokemonApi} from "@/redux/services/pokemonApi";
import apiMiddlewares from "@/middleware/apiMiddleware";
import {postApi} from "@/redux/services/postApi";
import {authApi} from "@/redux/services/authApi";
import { userListApi } from "./services/userListAppi";
import {parentApi} from "@/redux/services/User/parentApi";


// Tạo rootReducer bao gồm reducers quản lý API và reducers quản lý state
const rootReducer = combineReducers({
    // Reducer quản lý api
    [pokemonApi.reducerPath]: pokemonApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [parentApi.reducerPath]:parentApi.reducer,
    [userListApi.reducerPath]: userListApi.reducer,
    // Reducers quản lý state
    counter: counterReducer,
})

// Cấu hình Redux Persist
export const persistConfig = {
    key: 'kss',
    storage,
    // Những reducer được đăng ký trong whitelist sẽ được lưu trữ trong local storage
    whitelist: ['']
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
            }).concat(...apiMiddlewares) // middlewares giúp cập nhật trạng thái khi dữ liệu trả
    });
};

// Xuất kiểu dữ liệu của AppStore, RootState và AppDispatch để sử dụng trong các module khác
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
