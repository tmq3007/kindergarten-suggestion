import {createApi} from "@reduxjs/toolkit/query/react";
import {ApiResponse, baseQueryWithReauth} from "@/redux/services/config/baseQuery";

interface ChangePasswordDTO{
    oldPassword: string;
    newPassword: string
}
export type ParentDTO = {
    id: number;
    username?: string;
    email: string;
    status?: Boolean;
    fullname: string;
    phone: string;
    dob: string; // Because TypeScript does not have LocalDate, use string to represent ISO date
    district: string;
    ward: string;
    province: string;
    street: string;
    role: "ROLE_PARENT"; // Define fixed value of role
};
export const parentApi = createApi({
    reducerPath: "parentApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Parent"],
    endpoints: (build) => ({
        createParent: build.mutation<ApiResponse<ParentDTO>, ParentDTO>({
            query: (parentData) => ({
                url: "admin/parents",
                method: "POST",
                body: parentData, // Data sent to API
            }),
            invalidatesTags: ["Parent"], // Clear cache when creation is successful
        }),
        getParentById: build.query<ApiResponse<ParentDTO>, number>({
            query: (parentId) => ({
                url:`parent/${parentId}`,
                method:"GET",
            }) , // API endpoint to get Parent by ID
            transformErrorResponse: (response: { status: string | number }, meta, arg) => response.status,
            providesTags: ["Parent"], // Update cache data when there are changes
        }),
        editParent: build.mutation<ApiResponse<ParentDTO>, { parentId: string; data: ParentDTO }>({
            query: ({ parentId, data }) => ({
                url: `parent/edit/${Number(parentId)}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Parent"],
        }),

        changePassword: build.mutation<ApiResponse<void>, { parentId: number; data: ChangePasswordDTO }>({
            query: ({ parentId, data }) => ({
                url: `parent/${parentId}/change-password`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Parent"],
        }),
    }),
});

export const { useCreateParentMutation, useGetParentByIdQuery, useEditParentMutation, useChangePasswordMutation } = parentApi;
