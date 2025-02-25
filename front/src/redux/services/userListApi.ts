import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, baseQuery } from "./config/baseQuery";
import { Pageable, UserVO } from "./types";

export const userListApi = createApi({
    reducerPath: "userListApi",
    baseQuery: baseQuery,
    tagTypes: ["User"],
    endpoints: (build) => ({
        getUserList: build.query<
            ApiResponse<{ content: UserVO[]; pageable: Pageable }>,
            number
            >({
            query: (page = 0) => ({
                url: `/user`,
                method: "GET",
                params: { page, size: 10 },
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
