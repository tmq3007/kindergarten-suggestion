import {combineReducers, configureStore} from "@reduxjs/toolkit";
import counterReducer from '@/redux/features/counterSlice'
import authReducer from '@/redux/features/authSlice';
import userReducer from '@/redux/features/userSlice'
import storage from "@/redux/ssr-safe-storage";
import {persistReducer} from 'redux-persist';
import {FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE} from "redux-persist/es/constants";
import {pokemonApi} from "@/redux/services/pokemonApi";
import apiMiddlewares from "@/redux/middleware/apiMiddleware";
import {postApi} from "@/redux/services/postApi";
import {authApi} from "@/redux/services/authApi";
import { userListApi } from "./services/userListApi";
import {parentApi} from "@/redux/services/User/parentApi";
import { registerApi } from "./services/registerApi";
import {addressApi} from "@/redux/services/addressApi";
import {userApi} from "@/redux/services/User/userApi";


// Tạo rootReducer bao gồm reducers quản lý API và reducers quản lý state
const rootReducer = combineReducers({
    // Reducer quản lý api
    [pokemonApi.reducerPath]: pokemonApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [parentApi.reducerPath]: parentApi.reducer,
    [userListApi.reducerPath]: userListApi.reducer,
    [registerApi.reducerPath]: registerApi.reducer,
    [addressApi.reducerPath]: addressApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    // Reducers quản lý state
    counter: counterReducer,
    auth: authReducer,
    user: userReducer,
})

// Cấu hình Redux Persist
export const persistConfig = {
    key: 'kss',
    storage,
    // Những reducer được đăng ký trong whitelist sẽ được lưu trữ trong local storage
    whitelist: ['user', 'auth']
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
