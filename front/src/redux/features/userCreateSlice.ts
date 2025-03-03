import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import storage from "@/redux/ssr-safe-storage";

// Define data type based on ParentDTO
export interface ParentState {
    id: number | null;
    fullname: string | null;
    email:string | null;
    status?:boolean;
    username?:string;
    phone: string | null;
    dob: string | null;
    role: string | null;
}

// Default value
const initialState: ParentState = {
    id: null,
    fullname: null,
    email: "",
    phone: null,
    dob: null,
    role: null,
};

export const userCreateSlice = createSlice({
    name: 'parent',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<ParentState>) => {
            return { ...state, ...action.payload };
        },

    }
});

// Export actions
export const { setUser    } = userCreateSlice.actions;

// Export reducer
export default userCreateSlice.reducer;
