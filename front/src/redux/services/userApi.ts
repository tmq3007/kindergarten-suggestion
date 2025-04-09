import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, baseQueryWithReauth } from "@/redux/services/config/baseQuery";

export type UserDetailDTO = {
    id: number;
    username: string;
    fullname: string;
    email: string;
    dob: string;
    phone: string;
    role: string;
    status: boolean;
    expectedSchool?: string;
    business_registration_number?: string;
    imageList?: MediaVO[];
};

export type UserUpdateDTO = {
    id: number;
    username: string;
    fullname: string;
    email: string;
    dob: string;
    phone: string;
    role: string;
    status: boolean;
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
    tagTypes: ["User", "UserDetail","UserList","Admin"],
    endpoints: (build) => ({

        getUserList: build.query<
            ApiResponse<{ content: UserVO[]; page: Pageable }>,
            { page?: number; size?: number; searchBy?: string; keyword?:string  }
        >({
            query: ({ page = 1, size, searchBy, keyword }) => ({
                url: `/user`,
                method: "GET",
                params: {
                    page,
                    size,
                    searchBy,
                    keyword,
                },
            }),
            providesTags: ["UserList"],
        }),

        getUserDetail: build.query<ApiResponse<UserDetailDTO>, number>({
            query: (userId) => ({
                url: `/user/detail?userId=${userId}`,
                method: "GET",
            }),
            providesTags: ["UserDetail"],
        }),

        updateUser: build.mutation<ApiResponse<UserDetailDTO>, { data: UserUpdateDTO; imageList?: File[] }>({
            query: ({ data, imageList }) => {
                const formData = new FormData();
                formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
                if (imageList && imageList.length > 0) {
                    imageList.forEach((file) => {
                        formData.append("images", file);
                    });
                }
                return {
                    url: "/user/update",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["UserDetail", "User"],
        }),

        toggleUserStatus: build.mutation<ApiResponse<UserDetailDTO>, number>({
            query: (userId) => ({
                url: `/user/toggle?userId=${userId}`,
                method: 'PUT',
            }),
            invalidatesTags: ["UserList", "User"],
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

        checkPhone: build.query<ApiResponse<boolean>, string>({
            query: (phone) => ({
                url: "/user/check-phone-exist",
                method: "GET",
                params: { phone: phone },
            }),
            keepUnusedDataFor: 0,
        }),

        checkPhoneExceptMe: build.query<ApiResponse<boolean>, { phone: string; id: number }>({
            query: ({phone, id}) => ({
                url: "/user/check-phone-exist-except",
                method: "GET",
                params: { phone: phone , userId: id },
            }),
            keepUnusedDataFor: 0,
        }),

        checkEmail: build.query<ApiResponse<boolean>, string>({
            query: (email) => ({
                url: "/user/check-email-exist",
                method: "GET",
                params: { email: email },
            }),
            keepUnusedDataFor: 0,
        }),

        checkEmailExceptMe: build.query<ApiResponse<boolean>, { email: string; id: number }>({
            query: ({email, id}) => {
                console.log('Checking email existence except for user:', { email, id });
                return {
                    url: "/user/check-email-exist-except",
                    method: "GET",
                    params: { email: email, userId: id },
                };
            },
            keepUnusedDataFor: 0,
        }),

    }),
});

export const {
    useGetUserListQuery,
    useGetUserDetailQuery,
    useUpdateUserMutation,
    useToggleUserStatusMutation,
    useCreateUserMutation,
    useLazyCheckPhoneQuery,
    useLazyCheckPhoneExceptMeQuery,
    useLazyCheckEmailExceptMeQuery,
} = userApi;