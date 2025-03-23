import {combineReducers, configureStore} from "@reduxjs/toolkit";
import counterReducer from '@/redux/features/counterSlice'
import authReducer from '@/redux/features/authSlice';
import userReducer from '@/redux/features/userSlice'
import storage from "@/redux/ssr-safe-storage";
import {persistReducer} from 'redux-persist';
import {FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE} from "redux-persist/es/constants";
import apiMiddlewares from "@/redux/middleware/apiMiddleware";
import {authApi} from "@/redux/services/authApi";
import {registerApi} from "./services/registerApi";
import {addressApi} from "@/redux/services/addressApi";
import {parentApi} from "@/redux/services/parentApi";
import {userApi} from "@/redux/services/userApi";
import {reviewApi} from "@/redux/services/reviewApi";
import {schoolApi} from "@/redux/services/schoolApi";
import {testApi} from "./services/testApi";
import {schoolOwnerApi} from "@/redux/services/schoolOwnerApi";
import {requestCounsellingApi} from "@/redux/services/requestCounsellingApi";


// Create a rootReducer that includes reducers for managing the API and state management.
const rootReducer = combineReducers({
    // Reducer managing api
    [authApi.reducerPath]: authApi.reducer,
    [parentApi.reducerPath]: parentApi.reducer,
    [registerApi.reducerPath]: registerApi.reducer,
    [addressApi.reducerPath]: addressApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [schoolApi.reducerPath]: schoolApi.reducer,
    [testApi.reducerPath]: testApi.reducer,
    [schoolOwnerApi.reducerPath]: schoolOwnerApi.reducer,
    [requestCounsellingApi.reducerPath]: requestCounsellingApi.reducer,
    // Reducers managing state
    counter: counterReducer,
    auth: authReducer,
    user: userReducer,
})

// Config Redux Persist
export const persistConfig = {
    key: 'kss',
    storage,
    // Những reducer được đăng ký trong whitelist sẽ được lưu trữ trong local storage
    whitelist: ['user', 'auth']
}
// Configure persist for rootReducer to enable long-term storage.
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
            }).concat(...apiMiddlewares) // Middlewares help update the state when data is returned.
    });
};

// Export the data types of AppStore, RootState, and AppDispatch for use in other modules.
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
