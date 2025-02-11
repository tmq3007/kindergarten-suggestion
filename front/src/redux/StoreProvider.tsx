'use client'

import React, {useRef} from "react";
import {AppStore, makeStore} from "@/redux/store";
import {Provider} from "react-redux";
import {Persistor} from "redux-persist/es/types";
import {persistStore} from "redux-persist";
import {PersistGate} from "redux-persist/integration/react";
import {setupListeners} from "@reduxjs/toolkit/query";

export interface Props {
    children: React.ReactNode;
    params: { [key: string]: any };
}

export default function StoreProvider({children, params}: Props) {
    const storeRef = useRef<AppStore>(undefined);
    const persistorRef = useRef<Persistor>({} as Persistor)
    if (!storeRef.current) {
        // Khởi tạo store khi render lần đầu
        storeRef.current = makeStore();
        //xt- setupListeners để tự động xử lý trạng thái của query (loading, success, error)
        setupListeners(storeRef.current.dispatch);
        // Khởi long Redux
        persistorRef.current = persistStore(storeRef.current);
    }
    // Trả về toàn bộ app được bọc trong Provider với store
    return <Provider store={storeRef.current}>
        <PersistGate persistor={persistorRef.current} loading={null}>
            {children}
        </PersistGate>
    </Provider>;
}