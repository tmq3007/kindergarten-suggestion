import {createApi} from "@reduxjs/toolkit/query/react";
import {ApiResponse, baseQueryWithReauth} from "./config/baseQuery";

export type RegisterDTO = {
    fullname: string,
    email: string,
    phone: string,
    password: string,
}
export type Country = {
    cca2?: any;
    idd?: any;
    code: string;
    label: string;
    dialCode: string;
    flag: string;
}

export const registerApi = createApi({
    reducerPath: "registerApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Register"],
    endpoints: (builder) => ({
        register: builder.mutation<ApiResponse<string>, RegisterDTO>({
            query: (RegisterDTO) => ({
                url: "/parent/register",
                method: "POST",
                body: RegisterDTO,
            }),
        }),
        checkEmail: builder.query<ApiResponse<string>, string>({
            query: (email) => ({
                url: "/auth/check-email",
                method: "GET",
                params: {email: email},
            }),
            keepUnusedDataFor: 0,
        }),
        getCountries: builder.query<Country[], void>({
            query: () => ({
                url: "https://restcountries.com/v3.1/all",
            }),
            transformResponse: (response: any[]): Country[] =>
                response
                    .map((country) => ({
                        code: country.cca2,
                        label: country.name.common,
                        dialCode: country.idd.root
                            ? `${country.idd.root}${country.idd.suffixes ? country.idd.suffixes[0] : ""}`
                            : "",
                        flag: country.flags?.png || country.flags?.svg || "",
                    }))
                    .filter(country => country.dialCode), // Remove countries without a dial code
        }),
    }),
})
export const {useRegisterMutation, useLazyCheckEmailQuery, useGetCountriesQuery} = registerApi;