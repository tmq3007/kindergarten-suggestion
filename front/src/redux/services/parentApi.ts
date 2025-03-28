import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, baseQueryWithReauth } from "@/redux/services/config/baseQuery";
import {SchoolVO} from "@/redux/services/schoolApi";
import {Pageable, UserDetailDTO} from "@/redux/services/userApi";

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
    id: number;
    username?: string;
    email: string;
    status?: boolean;
    fullname: string;
    phone: string;
    dob?: string;
    district: string | null;
    ward: string| null;
    province: string| null;
    street: string| null;
    role?: string;
    userId: number;
    media?: MediaVO;
    pis?: ParentInSchoolVO;
    pisList?: ParentInSchoolVO[];
};

export type ParentInSchoolVO = {
    id: number;
    parent?: ParentVO;
    School?: SchoolVO;
    fromDate: Date;
    toDate?: Date;
    status: boolean,
}

export type MediaVO = {
    url: string;
    filename: string;
    cloudId: string;
};
export const parentApi = createApi({
    reducerPath: "parentApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Parent","ParentsList"],
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
        listAllParentWithFilter: build.query<
            ApiResponse<{ content: ParentVO[]; page: Pageable }>,
            {page?: number; size?: number; searchBy?: string; keyword?: string}
        >({
            query: ({ page = 1, size = 15, searchBy, keyword }) => ({
                url: `parent/get-all-parents`,
                method: "GET",
                params: {
                    page,
                    size,
                    searchBy,
                    keyword
                },
            }),
            providesTags: ["ParentsList"],
        }),
        listParentBySchoolWithFilter: build.query<
            ApiResponse<{ content: ParentVO[]; page: Pageable }>,
            {page?: number; size?: number; searchBy?: string; keyword?: string}
        >({
            query: ({ page = 1, size = 15, searchBy, keyword}) => ({
                url: `parent/get-parent-by-school`,
                method: "GET",
                params: {
                    page,
                    size,
                    searchBy,
                    keyword,
                },
            }),
            providesTags: ["ParentsList"],
        }),
        listEnrollRequestBySchoolWithFilter: build.query<
            ApiResponse<{ content: ParentVO[]; page: Pageable }>,
            {page?: number; size?: number; searchBy?: string; keyword?: string}
        >({
            query: ({ page = 1, size = 15, searchBy, keyword}) => ({
                url: `parent/get-enroll-request-by-school`,
                method: "GET",
                params: {
                    page,
                    size,
                    searchBy,
                    keyword,
                },
            }),
            providesTags: ["ParentsList"],
        }),
        deleteParentRequest: build.mutation({
            query: (id:number) => ({
                url: `/parent/delete/${id}`,
                method: 'DELETE',
            }),
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                await queryFulfilled;
                setTimeout(() => {
                    dispatch(parentApi.util.invalidateTags(['ParentsList']))
                }, 300)
            },
        }),
        getCountEnrollRequestBySchool: build.query<ApiResponse<number>, void>({
            query: () => ({
                url: "parent/get-school-request-count",
                method: "GET",
            }),
            providesTags: ["ParentsList"],
        }),
        toggleParentStatus: build.mutation<ApiResponse<UserDetailDTO>, number>({
            query: (userId) => ({
                url: `/user/toggle?userId=${userId}`,
                method: 'PUT',
            }),
            invalidatesTags: ["ParentsList"],
        }),
    }),
});

export const {
    useGetParentByIdQuery,
    useEditParentMutation,
    useListAllParentWithFilterQuery,
    useChangePasswordMutation,
    useListParentBySchoolWithFilterQuery,
    useListEnrollRequestBySchoolWithFilterQuery,
    useDeleteParentRequestMutation,
    useGetCountEnrollRequestBySchoolQuery,
    useToggleParentStatusMutation
} = parentApi;