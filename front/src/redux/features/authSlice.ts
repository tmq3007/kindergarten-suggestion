import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface AuthState {
    current_page: string;
}

const initialState: AuthState = {
    current_page: '',
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setPreviousPage: (state, action: PayloadAction<string>) => {
            state.current_page = action.payload;
        },
    }
});

export const { setPreviousPage } = authSlice.actions;
export default authSlice.reducer;