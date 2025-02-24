import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, baseQuery } from "@/redux/services/config/baseQuery";
import { SchoolOwnerDTO } from "@/redux/services/types";

export const schoolOwnerApi = createApi({
    reducerPath: "schoolOwnerApi",
    baseQuery: baseQuery,
    tagTypes: ["SchoolOwner"],
    endpoints: (build) => ({
        createSchoolOwner: build.mutation<ApiResponse<SchoolOwnerDTO>, SchoolOwnerDTO>({
            query: (schoolOwnerData) => ({
                url: "admin/school-owners/create",
                method: "POST",
                body: schoolOwnerData, // Dữ liệu gửi lên API
            }),
            invalidatesTags: ["SchoolOwner"], // Xóa cache khi tạo mới thành công
        }),
    }),
});

// Export hook để sử dụng trong component
export const { useCreateSchoolOwnerMutation } = schoolOwnerApi;
