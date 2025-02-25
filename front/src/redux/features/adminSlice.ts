// Định nghĩa kiểu dữ liệu dựa trên AdminDTO
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {ParentState} from "@/redux/features/parentSlice";

export interface AdminState {
    id: number | null;
    fullName: string | null;
    phone: string | null;
    dob: string | null;
    role: "ROLE_ADMIN" | null;
}

// Giá trị mặc định ban đầu
const initialState: AdminState = {
    id: null,
    fullName: null,
    phone: null,
    dob: null,
    role: null,
};

export const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        setAdmin: (state, action: PayloadAction<AdminState>) => {
            return { ...state, ...action.payload };
        },

    }
});

// Export actions
export const { setAdmin    } = adminSlice.actions;

// Export reducer
export default adminSlice.reducer;