import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/redux/services/config/baseQuery";

// Types (as defined above)
export interface RequestCounsellingVO {
  id: number;
  parentName: string | null;
  schoolName: string | null;
  inquiry: string | null;
  status: number;
  email: string;
  phone: string;
  name: string;
  dueDate: string | null;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export const requestApi = createApi({
  reducerPath: "requestApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["RequestList"],
  endpoints: (build) => ({
    // Get request list with pagination and filtering
    getAllRequests: build.query<
        ApiResponse<{ content: RequestCounsellingVO[]; pageable: Pageable }>,
        {
          page?: number;
          size?: number;
          status?: number;
          email?: string;
          name?: string;
          phone?: string;
          parentName?: string;
          schoolName?: string;
          dueDate?: string;
        }
    >({
      query: ({ page = 1, size, status, email, name, phone, parentName, schoolName, dueDate }) => ({
        url: "/all",
        method: "GET",
        params: {
          page,
          size,
          ...(status !== undefined && { status }),
          ...(email && { email }),
          ...(name && { name }),
          ...(phone && { phone }),
          ...(parentName && { parentName }),
          ...(schoolName && { schoolName }),
          ...(dueDate && { dueDate }),
        },
      }),
      transformResponse: (
          response: ApiResponse<{ content: RequestCounsellingVO[]; pageable: Pageable; totalElements: number }>
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
      providesTags: ["RequestList"],
    }),
  }),
});

export const { useGetAllRequestsQuery } = requestApi;