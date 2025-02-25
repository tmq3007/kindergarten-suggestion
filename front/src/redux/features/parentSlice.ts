import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import storage from "@/redux/ssr-safe-storage";

// Định nghĩa kiểu dữ liệu dựa trên ParentDTO
export interface ParentState {
    id: number | null;
    fullName: string | null;
    email?:string ;
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

// Giá trị mặc định ban đầu
const initialState: ParentState = {
    id: null,
    fullName: null,
    phone: null,
    dob: null,
    district: null,
    ward: null,
    province: null,
    street: null,
    role: null,
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
