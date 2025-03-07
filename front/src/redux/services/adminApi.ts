import {createApi} from "@reduxjs/toolkit/query/react";
import {ApiResponse, baseQueryWithReauth} from "@/redux/services/config/baseQuery";

interface AdminDTO{
    id: string,
    fullname: string,
    email: string,
    phone: string,
    dob: string,
    address: string,
    role: string,
    status: string,
}

export type UserDTO = {
    id: number;
    username?: string;
    email: string;
    status: Boolean;
    fullname: string;
    phone: string;
    dob: string; // Because TypeScript does not have LocalDate, use string to represent ISO date
    role: string
}
export const adminApi = createApi({
    reducerPath: "adminApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Admin"],
    endpoints: (build) => ({
        createUser: build.mutation<ApiResponse<UserDTO>, UserDTO>({
            query: (adminData) => ({
                url: "admin/user",
                method: "POST",
                body: adminData, // Load data to API
            }),
            invalidatesTags: ["Admin"], // delete cache when creation is successful
        }),
    }),
});

// Export hook để sử dụng trong component
export const { useCreateUserMutation } = adminApi;
