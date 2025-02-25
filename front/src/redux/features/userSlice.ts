import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface UsersState {
    username: string,
    id: string,
}

const initialState: UsersState = {
    username: '',
    id: ''
}

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateUser: (state, action: PayloadAction<{ username: string, id: string }>) => {
            state.username = action.payload.username;
            state.id = action.payload.id;
        },
        resetUser: (state) => {
            state.username = initialState.username;
            state.id = initialState.id;
        },
    }
})

export const {updateUser, resetUser} = userSlice.actions;

export default userSlice.reducer;