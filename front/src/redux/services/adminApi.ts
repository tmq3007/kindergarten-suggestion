import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, baseQueryWithReauth } from "@/redux/services/config/baseQuery";
import {MediaVO} from "@/redux/services/parentApi";

export type UserCreateDTO = {
    id: number;
    username?: string;
    email: string;
    status: boolean; // Changed Boolean to boolean (lowercase - TypeScript primitive type)
    fullname: string;
    phone: string;
    dob: string; // Because TypeScript does not have LocalDate, use string to represent ISO date
    role: string;
    expectedSchool?: string;
    imageList?: MediaVO[];
    business_registration_number?: string;
}

export const adminApi = createApi({
    reducerPath: "adminApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Admin"],
    endpoints: (build) => ({
        createUser: build.mutation<ApiResponse<UserCreateDTO>, { data: UserCreateDTO; imageList?: File[] }>({
            query: ({ data, imageList }) => {
                const formData = new FormData();
                // No need to destructure imageFile since it doesn't exist in UserCreateDTO
                // Simply use the data object as is
                formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));

                // Handle the optional imageList parameter
                if (imageList && imageList.length > 0) {
                    imageList.forEach((file, index) => {
                        formData.append("images", file); // Append each file
                    });
                }

                return {
                    url: "admin/user",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["Admin"],
        }),
    }),
});

export const { useCreateUserMutation } = adminApi;