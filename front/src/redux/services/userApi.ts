import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, baseQueryWithReauth } from "@/redux/services/config/baseQuery";

export type UserDetailDTO = {
    id: number;
    username: string;
    fullname: string;
    email: string;
    dob: string | null;
    phone: string;
    role: string;
    status: string;
};

export type UserUpdateDTO = {
    id: number;
    username: string;
    fullname: string;
    email: string;
    dob: string;
    phone: string;
    role: string;
    status: string;
};

export type UserVO = {
    id: string;
    fullname: string;
    email: string;
    phoneNo: string;
    dob: string;
    address: string;
    role: string;
    status: string;
};

export type Pageable = {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
};

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

export type MediaVO = {
    url: string;
    filename: string;
    cloudId: string;
};


export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["User", "UserDetail","Admin"],
    endpoints: (build) => ({
        getUserList: build.query<
            ApiResponse<{ content: UserVO[]; page: Pageable }>,
            { page?: number; size?: number; role?: string; email?: string; name?: string; phone?: string }
        >({
            query: ({ page = 1, size, role, email, name, phone }) => ({
                url: `/user`,
                method: "GET",
                params: {
                    page,
                    size,
                    ...(role && { role }),
                    ...(email && { email }),
                    ...(name && { name }),
                    ...(phone && { phone }),
                },
            }),
            providesTags: ["User"],
        }),

        getUserDetail: build.query<ApiResponse<UserDetailDTO>, number>({
            query: (userId) => ({
                url: `/user/detail?userId=${userId}`,
                method: "GET",
            }),
            providesTags: ["UserDetail"],
        }),

        updateUser: build.mutation<ApiResponse<UserDetailDTO>, UserUpdateDTO>({
            query: (userUpdateDTO) => ({
                url: '/user/update',
                method: 'POST',
                body: userUpdateDTO,
            }),
            invalidatesTags: ["UserDetail", "User"],
        }),

        toggleUserStatus: build.mutation<ApiResponse<UserDetailDTO>, number>({
            query: (userId) => ({
                url: `/user/toggle?userId=${userId}`,
                method: 'PUT',
            }),
            invalidatesTags: ["UserDetail", "User"],
        }),
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
                    url: "/user/create",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["Admin"],
        }),
    }),
});

export const {
    useGetUserListQuery,
    useGetUserDetailQuery,
    useUpdateUserMutation,
    useToggleUserStatusMutation,
    useCreateUserMutation
} = userApi;