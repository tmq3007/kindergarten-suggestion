import {createApi} from "@reduxjs/toolkit/query/react";
import {ApiResponse, baseQueryWithReauth} from "./config/baseQuery";
import {Pageable, UserVO} from "./types";

export enum UserRole {
    ADMIN = 'ROLE_ADMIN',
    SCHOOL_OWNER = 'ROLE_SCHOOL_OWNER',
    PARENT = 'ROLE_PARENT',
}
export const userListApi = createApi({
    reducerPath: "userListApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["User"],
    endpoints: (build) => ({
        getUserList: build.query<
            ApiResponse<{ content: UserVO[]; pageable: Pageable }>,
            { page?: number; role?: string; email?: string; name?: string; phone?: string }
        >({
            query: ({ page = 0, role, email, name, phone }) => ({
                url: `/user`,
                method: "GET",
                params: {
                    page,
                    size: 10,
                    ...(role && { role: role }),
                    ...(email && { email }),
                    ...(name && { name }),
                    ...(phone && { phone })
                },
            }),
            transformResponse: (
                response: ApiResponse<{ content: UserVO[]; pageable: Pageable; totalElements: number }>
            ) => ({
                ...response,
                data: {
                    ...response.data,
                    pageable: {
                        ...response.data.pageable,
                        totalElements: response.data.totalElements,
                    },
                },
            }),
        }),
    }),
});

export const { useGetUserListQuery } = userListApi;
