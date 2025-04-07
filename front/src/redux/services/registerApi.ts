import {createApi} from "@reduxjs/toolkit/query/react";
import {ApiResponse, baseQueryWithReauth} from "./config/baseQuery";
import countriesData from "./localApi/countries.json"; // Import file JSON trực tiếp
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
        checkEmail: builder.query<ApiResponse<boolean>, string>({
            query: (email) => ({
                url: "/auth/check-email",
                method: "GET",
                params: { email: email },
            }),
            keepUnusedDataFor: 0,
        }),
        getCountries: builder.query<Country[], void>({
            // Trả về dữ liệu tĩnh và biến đổi nó
            async queryFn() {
                try {
                    const response = countriesData; // Dữ liệu từ file JSON
                    const transformedData = response
                        .map((country: any) => ({
                            code: country.cca2,
                            label: country.name.common,
                            dialCode: country.idd.root
                                ? `${country.idd.root}${country.idd.suffixes ? country.idd.suffixes[0] : ""}`
                                : "",
                            flag: country.flags?.png || country.flags?.svg || "",
                        }))
                        .filter((country: Country) => country.dialCode);
                    return { data: transformedData };
                } catch (error) {
                    return { error: { status: "FETCH_ERROR", error: String(error) } };
                }
            },
        }),
    }),
})
export const {useRegisterMutation, useLazyCheckEmailQuery, useGetCountriesQuery} = registerApi;