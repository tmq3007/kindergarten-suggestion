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
            { page?: number; size?: number; role?: string; email?: string; name?: string; phone?: string }
        >({
            query: ({ page = 1, size, role, email, name, phone }) => ({
                url: `/user`,
                method: "GET",
                params: {
                    page,
                    size,
                    ...(role && { role }),
                    ...(email && { email }),
                    ...(name && { name }),
                    ...(phone && { phone }),
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