import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ParentManagementState {
    pendingRequestsCount: number;
}

const initialState: ParentManagementState = {
    pendingRequestsCount: 0,
};

const parentSlice = createSlice({
    name: 'parentManagement',
    initialState,
    reducers: {
        setPendingRequestsCount(state, action: PayloadAction<number>) {
            state.pendingRequestsCount = action.payload;
        },
        decrementPendingRequestsCount(state) {
            state.pendingRequestsCount = Math.max(0, state.pendingRequestsCount - 1);
        },
    },
});

export const { setPendingRequestsCount, decrementPendingRequestsCount } = parentSlice.actions;
export default parentSlice.reducer;