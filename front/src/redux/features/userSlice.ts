import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface UsersState {
    username: string,
}

const initialState: UsersState = {
    username: '',
}

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateUsername: (state, action: PayloadAction<string>) => {
            state.username = action.payload;
        }
    }
})

export const {updateUsername} = userSlice.actions;

export default userSlice.reducer;