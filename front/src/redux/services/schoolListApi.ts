import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, baseQuery, baseQueryWithReauth } from "./config/baseQuery";

export type SchoolVO = {
  id: number;
  status: number; // Byte trong Java => number trong TS
  name: string;
  schoolType: number; // Byte
  district: string;
  ward: string;
  province: string;
  street: string;
  email: string;
  phone: string;
  receivingAge: number; // Byte
  educationMethod: number; // Byte
  feeFrom: number; // Integer
  feeTo: number; // Integer
  description: string;
  posted_date: string; // Date trong Java => string (ISO format) trong TS
  facilities?: { fid: number }[]; // Thêm facilities (giả sử cấu trúc này)
  utilities?: { uid: number }[]; // Thêm utilities (giả sử cấu trúc này)
  imageList?: MediaVO[];
};

export type MediaVO = {
  url: string;
  filename: string;
  cloudId: string;
};

export type Pageable = {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
};

export const schoolListApi = createApi({
  reducerPath: "schoolListApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["School"],
  endpoints: (build) => ({
    // Lấy danh sách trường học
    getSchoolList: build.query<
        ApiResponse<{ content: SchoolVO[]; pageable: Pageable }>,
        {
          page?: number;
          size?: number;
          name?: string;
          province?: string;
          district?: string;
          email?: string;
          phone?: string;
        }
    >({
      query: ({ page = 1, size, name, province, district, email, phone }) => ({
        url: `/school/all`,
        method: "GET",
        params: {
          page,
          size,
          ...(name && { name }),
          ...(province && { province }),
          ...(district && { district }),
          ...(email && { email }),
          ...(phone && { phone }),
        },
      }),
      transformResponse: (
          response: ApiResponse<{ content: SchoolVO[]; pageable: Pageable; totalElements: number }>
      ) => ({
        ...response,
        data: {
          ...response.data,
          pageable: {
            ...response.data.pageable,
            totalElements: response.data.totalElements,
          },
        },
      }),
    }),

    // Lấy danh sách trường học theo userId
    getSchoolListByUserId: build.query<
        ApiResponse<{ content: SchoolVO[]; pageable: Pageable }>,
        {
          page?: number;
          size?: number;
          name?: string;
          userId: number;
        }
    >({
      query: ({ page = 1, size, name, userId }) => ({
        url: `/school/by-user/${userId}`,
        method: "GET",
        params: {
          page,
          size,
          ...(name && { name }),
        },
      }),
      transformResponse: (
          response: ApiResponse<{ content: SchoolVO[]; pageable: Pageable; totalElements: number }>
      ) => ({
        ...response,
        data: {
          ...response.data,
          pageable: {
            ...response.data.pageable,
            totalElements: response.data.totalElements,
          },
        },
      }),
    }),

    // Lấy chi tiết một trường học theo ID
    getSchoolById: build.query<ApiResponse<SchoolVO>, number>({
      query: (schoolId) => ({
        url: `/school/${schoolId}`,
        method: "GET",
      }),
      providesTags: ["School"], // Để refetch khi dữ liệu thay đổi
    }),

    // Mutation để xử lý approve
    approveSchool: build.mutation<ApiResponse<SchoolVO>, number>({
      query: (schoolId) => ({
        url: `/school/${schoolId}/approve`,
        method: "PUT",
      }),
      invalidatesTags: ["School"], // Làm mới dữ liệu sau khi approve
    }),
  }),
});

export const {
  useGetSchoolListQuery,
  useGetSchoolListByUserIdQuery,
  useGetSchoolByIdQuery,
  useApproveSchoolMutation, // Chỉ giữ lại mutation này
} = schoolListApi;