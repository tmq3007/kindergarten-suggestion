import { createApi } from "@reduxjs/toolkit/query/react";
import {ApiResponse, baseQuery, baseQueryWithReauth} from "./config/baseQuery";

export enum UserRole {
    ADMIN = 'ROLE_ADMIN',
    SCHOOL_OWNER = 'ROLE_SCHOOL_OWNER',
    PARENT = 'ROLE_PARENT',
}

export type UserVO = {
    id: string,
    fullname: string,
    email: string,
    phoneNo: string,
    dob: string,
    address: string,
    role: string,
    status: string,
}

export type Pageable = {
    pageNumber: number,
    pageSize: number,
    totalElements: number,
    totalPages: number,
}

export const userListApi = createApi({
    reducerPath: "userListApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["User"],
    endpoints: (build) => ({
        getUserList: build.query<
            ApiResponse<{ content: UserVO[]; pageable: Pageable }>,
            { page?: number,size?:number; role?: string; email?: string; name?: string; phone?: string }
        >({
            query: ({ page = 1,size, role, email, name, phone }) => ({
                url: `/user`,
                method: "GET",
                params: {
                    page,
                    size,
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
