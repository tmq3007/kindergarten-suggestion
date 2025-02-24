import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, baseQuery } from "@/redux/services/config/baseQuery";
import { ParentDTO } from "@/redux/services/types";

export const parentApi = createApi({
    reducerPath: "parentApi",
    baseQuery: baseQuery,
    tagTypes: ["Parent"],
    endpoints: (build) => ({
        createParent: build.mutation<ApiResponse<ParentDTO>, ParentDTO>({
            query: (parentData) => ({
                url: "admin/parents",
                method: "POST",
                body: parentData, // Dữ liệu gửi lên API
            }),
            invalidatesTags: ["Parent"], // Xóa cache khi tạo mới thành công
        }),
    }),
});

// Export hook để sử dụng trong component
export const { useCreateParentMutation } = parentApi;
