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
    district: string | null;
    ward: string | null;
    province: string | null;
    street: string | null;
    role: "ROLE_PARENT" | null;
}

// Default value
const initialState: ParentState = {
    id: null,
    fullname: null,
    email: "",
    phone: null,
    dob: null,
    district: null,
    ward: null,
    province: null,
    street: null,
    role: "ROLE_PARENT",
};

export const parentSlice = createSlice({
    name: 'parent',
    initialState,
    reducers: {
        setParent: (state, action: PayloadAction<ParentState>) => {
            return { ...state, ...action.payload };
        },

    }
});

// Export actions
export const { setParent    } = parentSlice.actions;

// Export reducer
export default parentSlice.reducer;
