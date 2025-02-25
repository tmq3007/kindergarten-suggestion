import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {SchoolDTO} from "@/redux/services/types";



export interface SchoolOwnerState {
    id: number | null;
    username: string | null;
    email: string | null;
    role: string | null;
    status: boolean | null;
    gender: boolean | null;
    fullName: string | null;
    phone: string | null;
    dob: string | null;
    school: SchoolDTO | null;
}

// Giá trị mặc định ban đầu
const initialState: SchoolOwnerState = {
    id: null,
    username: null,
    email: null,
    role: null,
    status: null,
    gender: null,
    fullName: null,
    phone: null,
    dob: null,
    school: null,
};

export const schoolOwnerSlice = createSlice({
    name: "schoolOwner",
    initialState,
    reducers: {
        setSchoolOwner: (state, action: PayloadAction<SchoolOwnerState>) => {
            return { ...state, ...action.payload };
        },
        clearSchoolOwner: () => initialState,
    },
});

// Export actions
export const { setSchoolOwner, clearSchoolOwner } = schoolOwnerSlice.actions;

// Export reducer
export default schoolOwnerSlice.reducer;
