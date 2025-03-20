import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface UsersState {
    username: string,
    id: string,
    role: string,
    hasSchool: boolean,
    hasDraft: boolean,
}

const initialState: UsersState = {
    username: '',
    id: '',
    role: '',
    hasSchool: false,
    hasDraft: false,
}

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateUser: (state,
                     action: PayloadAction<{
                         username: string,
                         id: string,
                         role: string,
                         hasSchool: boolean,
                         hasDraft: boolean
                     }>) => {
            state.username = action.payload.username;
            state.id = action.payload.id;
            state.role = action.payload.role;
            state.hasSchool = action.payload.hasSchool;
            state.hasDraft = action.payload.hasDraft;
        },
        resetUser: () => initialState,
        updateHasDraft: (state, action: PayloadAction<boolean>) => {
            state.hasDraft = action.payload
        },
    }
})

export const {updateUser, resetUser, updateHasDraft} = userSlice.actions;

export default userSlice.reducer;