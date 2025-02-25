import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, baseQuery } from "@/redux/services/config/baseQuery";
import { ParentDTO } from "@/redux/services/types";
interface ChangePasswordDTO{
    oldPassword: string;
    newPassword: string
}
export const parentApi = createApi({
    reducerPath: "parentApi",
    baseQuery: baseQuery,
    tagTypes: ["Parent"],
    endpoints: (build) => ({
        createParent: build.mutation<ApiResponse<ParentDTO>, ParentDTO>({
            query: (parentData) => ({
                url: "admin/parents",
                method: "POST",
                body: parentData, // Dữ liệu gửi lên API
            }),
            invalidatesTags: ["Parent"], // Xóa cache khi tạo mới thành công
        }),
        getParentById: build.query<ApiResponse<ParentDTO>, number>({
            query: (parentId) => ({
                url:`parent/${parentId}`,
                method:"GET",
            }) , // Endpoint API để lấy Parent theo ID
            transformErrorResponse: (response: { status: string | number }, meta, arg) => response.status,
            providesTags: ["Parent"], // Cập nhật dữ liệu cache khi có thay đổi
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

// Export hook để sử dụng trong component
export const { useCreateParentMutation, useGetParentByIdQuery, useEditParentMutation, useChangePasswordMutation } = parentApi;
