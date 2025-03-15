import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, baseQueryWithReauth } from "@/redux/services/config/baseQuery";

interface ChangePasswordDTO {
    oldPassword: string;
    newPassword: string;
}

export type ParentUpdateDTO = {
    id?: number;
    username?: string;
    email: string;
    status?: boolean;
    fullname: string;
    phone: string;
    dob: string;
    district: string | null;
    ward: string| null;
    province: string| null;
    street: string| null;
    role: string;
    media?: File;
};

export type ParentVO = {
    username?: string;
    email: string;
    status?: boolean;
    fullname: string;
    phone: string;
    dob: string;
    district: string | null;
    ward: string| null;
    province: string| null;
    street: string| null;
    role: string;
    media?: MediaVO;
};
export type MediaVO = {
    url: string;
    filename: string;
    cloudId: string;
};
export const parentApi = createApi({
    reducerPath: "parentApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Parent"],
    endpoints: (build) => ({
        getParentById: build.query<ApiResponse<ParentVO>, number>({
            query: (userId) => ({
                url: `parent/${userId}`,
                method: "GET",
            }),
            transformErrorResponse: (response: { status: string | number }) => response.status,
            providesTags: ["Parent"],
        }),
        editParent: build.mutation<
            ApiResponse<ParentVO>,
            { parentId: string; data: ParentUpdateDTO; image?: File }
        >({
            query: ({ parentId, data, image }) => {
                const formData = new FormData();

                const { media, ...parentDataWithoutImage } = data;

                formData.append(
                    "data",
                    new Blob([JSON.stringify(parentDataWithoutImage)], { type: "application/json" })
                );

                if (image instanceof File) {
                    formData.append("image", image);
                }

                return {
                    url: `parent/edit/${Number(parentId)}`,
                    method: "PUT",
                    body: formData,
                    // Không cần set header Content-Type, browser sẽ tự động set multipart/form-data
                };
            },
            invalidatesTags: ["Parent"],
        }),
        changePassword: build.mutation<
            ApiResponse<void>,
            { parentId: number; data: ChangePasswordDTO }
        >({
            query: ({ parentId, data }) => ({
                url: `parent/${parentId}/change-password`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Parent"],
        }),
    }),
});

export const { useGetParentByIdQuery, useEditParentMutation, useChangePasswordMutation } = parentApi;