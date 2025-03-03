import {createApi} from "@reduxjs/toolkit/query/react";
import {ApiResponse, baseQueryWithReauth} from "@/redux/services/config/baseQuery";

export type UserDetailDTO = {
    id: number;
    username: string;
    fullname: string;
    email: string;
    dob: string | null;
    phone: string;
    role: string;
    status: string;
};

export type UserUpdateDTO = {
    id: number;
    username: string;
    fullname: string;
    email: string;
    dob: string;
    phone: string;
    role: string;
    status: string;
};

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ['UserDetail'],
    endpoints: (build) => ({
        getUserDetail: build.query<ApiResponse<UserDetailDTO>, number>({
            query: (userId) => ({
                url: `/user/detail?userId=${userId}`,
                method: 'GET',
            }),
            providesTags: ['UserDetail'],
        }),
        updateUser: build.mutation<ApiResponse<UserDetailDTO>, UserUpdateDTO>({
            query: (userUpdateDTO) => ({
                url: '/user/update',
                method: 'POST',
                body: userUpdateDTO,
            }),
            invalidatesTags: ['UserDetail'],
        }),
        toggleUserStatus: build.mutation<ApiResponse<UserDetailDTO>, number>({
            query: (userId) => ({
                url: `/user/toggle?userId=${userId}`,
                method: 'PUT',
            }),
            invalidatesTags: ['UserDetail'],
        }),
    }),
});

export const {
    useGetUserDetailQuery,
    useUpdateUserMutation,
    useToggleUserStatusMutation
} = userApi;
