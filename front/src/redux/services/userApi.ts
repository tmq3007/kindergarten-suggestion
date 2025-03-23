import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, baseQueryWithReauth } from "@/redux/services/config/baseQuery";

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

export type UserVO = {
    id: string;
    fullname: string;
    email: string;
    phoneNo: string;
    dob: string;
    address: string;
    role: string;
    status: string;
};

export type Pageable = {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
};

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["User", "UserDetail"],
    endpoints: (build) => ({
        getUserList: build.query<
            ApiResponse<{ content: UserVO[]; page: Pageable }>,
            { page?: number; size?: number; searchBy?: string; keyword?:string  }
        >({
            query: ({ page = 1, size, searchBy, keyword }) => ({
                url: `/user`,
                method: "GET",
                params: {
                    page,
                    size,
                    searchBy,
                    keyword,
                },
            }),
            providesTags: ["User"],
        }),

        getUserDetail: build.query<ApiResponse<UserDetailDTO>, number>({
            query: (userId) => ({
                url: `/user/detail?userId=${userId}`,
                method: "GET",
            }),
            providesTags: ["UserDetail"],
        }),

        updateUser: build.mutation<ApiResponse<UserDetailDTO>, UserUpdateDTO>({
            query: (userUpdateDTO) => ({
                url: '/user/update',
                method: 'POST',
                body: userUpdateDTO,
            }),
            invalidatesTags: ["UserDetail", "User"],
        }),

        toggleUserStatus: build.mutation<ApiResponse<UserDetailDTO>, number>({
            query: (userId) => ({
                url: `/user/toggle?userId=${userId}`,
                method: 'PUT',
            }),
            invalidatesTags: ["UserDetail", "User"],
        }),
    }),
});

export const {
    useGetUserListQuery,
    useGetUserDetailQuery,
    useUpdateUserMutation,
    useToggleUserStatusMutation
} = userApi;