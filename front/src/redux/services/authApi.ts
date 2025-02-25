import {createApi} from "@reduxjs/toolkit/query/react";
import {ApiResponse, baseQuery} from "@/redux/services/config/baseQuery";
import exp from "node:constants";

export type LoginDTO = {
    username: string,
    password: string,
}

export type LoginVO = {
    accessToken: string,
    csrfToken: string,
}

export type ForgotPasswordDTO = {
    email: string;
}

export type ForgotPasswordVO = {
    fpToken: string;
    username: string;
}

export type ResetPasswordDTO = {
    password: string;
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
        }),
        forgotPassword: build.mutation<ApiResponse<ForgotPasswordVO>, ForgotPasswordDTO>({
            query: (forgotPasswordDTO) => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body: forgotPasswordDTO, // Gửi dữ liệu forgotPasswordDTO trong body của request
            }),
        }),
        resetPassword: build.mutation<ApiResponse<null>, ResetPasswordDTO>({
            query: (resetPasswordDTO) => ({
                url: '/auth/reset-password',
                method: 'POST',
                body: resetPasswordDTO, // Gửi dữ liệu resetPasswordDTO trong body của request
            }),
        }),
        logout: build.mutation<ApiResponse<undefined>, undefined>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            })
        })

    }),
})

export const {useLoginMutation, useForgotPasswordMutation, useResetPasswordMutation, useLogoutMutation} = authApi

