import {createApi} from "@reduxjs/toolkit/query/react";
import {ApiResponse, baseQueryWithReauth} from "@/redux/services/config/baseQuery";

interface AdminDTO{
    id: string,
    fullName: string,
    email: string,
    phone: string,
    dob: string,
    address: string,
    role: string,
    status: string,
}
export const adminApi = createApi({
    reducerPath: "adminApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Admin"],
    endpoints: (build) => ({
        createAdmin: build.mutation<ApiResponse<AdminDTO>, AdminDTO>({
            query: (adminData) => ({
                url: "admin/create",
                method: "POST",
                body: adminData, // Dữ liệu gửi lên API
            }),
            invalidatesTags: ["Admin"], // Xóa cache khi tạo mới thành công
        }),
    }),
});

// Export hook để sử dụng trong component
export const { useCreateAdminMutation } = adminApi;
