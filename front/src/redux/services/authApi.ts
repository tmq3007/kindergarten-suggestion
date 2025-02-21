import {createApi} from "@reduxjs/toolkit/query/react";
import {ApiResponse, baseQuery} from "@/redux/services/config/baseQuery";

export type LoginDTO = {
    username: string,
    password: string,
}

export type LoginVO = {
    accessToken: string,
    csrfToken: string,
}

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: baseQuery,
    tagTypes: ['Auth'],
    endpoints: (build) => ({
        login: build.mutation<ApiResponse<LoginVO>, LoginDTO>({
            query: (loginDTO) => ({
                url: '/auth/login',
                method: 'POST',
                body: loginDTO, // Gửi dữ liệu loginDTO trong body của request
            }),
        })
    }),
})

export const {useLoginMutation} = authApi

