import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import storage from "@/redux/ssr-safe-storage";

export interface CounterState {
    value: number;
}

const initialState: CounterState = {
    value: 0,
};

export const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        increment: (state) => {
            state.value += 1;
        },
        decrement: (state) => {
            state.value -= 1;
        },
        incrementByAmount: (state, action: PayloadAction<number>) => {
            state.value += action.payload;
        },
        reset: (state) => {
            state.value = 0;
            storage.removeItem("persist:counter");
        }
    }
});

// Dùng slice.actions để tạo ra các actionCreator
export const {
    increment,
    decrement,
    incrementByAmount,
    reset
} = counterSlice.actions;

// Dùng slice.reducer để tạo ra reducer để đăng ký với store
export default counterSlice.reducer;