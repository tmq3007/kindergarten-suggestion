import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, baseQuery } from "./config/baseQuery";
import { RegisterDTO } from "./types";

export const registerApi = createApi({
    reducerPath: "registerApi",
    baseQuery: baseQuery,
    tagTypes: ["Register"],
    endpoints: (builder) => ({
        register: builder.mutation<ApiResponse<string>, RegisterDTO>({
            query: (RegisterDTO) => ({
                url: "/user/register",
                method: "POST",
                body: RegisterDTO,
            }),
        }),
    }),
});
export const { useRegisterMutation } = registerApi;