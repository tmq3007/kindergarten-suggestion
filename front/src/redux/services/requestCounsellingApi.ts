import { baseQueryWithReauth } from "./config/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { DateTime } from "luxon";

// Types for RequestCounsellingReminderVO
export type RequestCounsellingReminderVO = {
  title: string;
  description: string;
};

// Types for RequestCounsellingDTO
export type RequestCounsellingDTO = {
  userId?: number;
  schoolId: number;
  inquiry?: string;
  status: number;
  email: string;
  phone: string;
  name: string;
  dueDate: DateTime;
};

// Types for RequestCounsellingVO
export interface RequestCounsellingVO {
  id?: number;
  schoolName?: string | null;
  inquiry: string | null;
  status: number;
  email: string;
  phone: string;
  name: string;
  dueDate: string;
  address: string;
}

// Types for Pageable
export interface Pageable {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

// Types for ApiResponse
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export const requestCounsellingApi = createApi({
  reducerPath: "requestCounsellingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["RequestCounselling", "RequestList"],
  endpoints: (builder) => ({
    alertReminder: builder.query<ApiResponse<RequestCounsellingReminderVO>, number>({
      query: (userId) => ({
        url: `counselling/alert-reminder?userId=${userId}`,
        method: "GET",
      }),
      transformErrorResponse: (response: { status: string | number }) => response.status,
      providesTags: ["RequestCounselling"],
    }),

    createRequestCounselling: builder.mutation<
        ApiResponse<RequestCounsellingVO>,
        RequestCounsellingDTO
    >({
      query: (data) => ({
        url: "counselling/request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RequestCounselling", "RequestList"],
    }),

    getAllRequests: builder.query<
        ApiResponse<{ content: RequestCounsellingVO[]; pageable: Pageable }>,
        {
          page?: number;
          size?: number;
          status?: number;
          email?: string;
          name?: string;
          phone?: string;
          schoolName?: string;
          dueDate?: string;
        }
    >({
      query: ({ page = 1, size, status, email, name, phone, schoolName, dueDate }) => ({
        url: "counselling/all",
        method: "GET",
        params: {
          page,
          size,
          ...(status !== undefined && { status }),
          ...(email && { email }),
          ...(name && { name }),
          ...(phone && { phone }),
          ...(schoolName && { schoolName }),
          ...(dueDate && { dueDate }),
        },
      }),
      transformResponse: (response: any) => {
        console.log("Original Server Response:", response);
        if (!response) {
          console.warn("Empty API response:", response);
          return {
            status: 500,
            message: "No data returned from API",
            data: {
              content: [],
              pageable: { pageNumber: 1, pageSize: 10, totalElements: 0, totalPages: 0 },
            },
          };
        }

        const responseData = response.data || response;
        if (!responseData.content) {
          console.warn("No content in response:", responseData);
          return {
            status: 500,
            message: "No content returned from API",
            data: {
              content: [],
              pageable: { pageNumber: 1, pageSize: 10, totalElements: 0, totalPages: 0 },
            },
          };
        }

        return {
          status: response.status || 200,
          message: response.message,
          data: {
            content: responseData.content,
            pageable: {
              pageNumber: responseData.pageable?.pageNumber || 0,
              pageSize: responseData.pageable?.pageSize || 10,
              totalElements: responseData.totalElements || 0,
              totalPages: responseData.pageable?.totalPages || 0,
            },
          },
        };
      },
      providesTags: ["RequestList"],
    }),

    getRequestCounselling: builder.query<ApiResponse<RequestCounsellingVO>, number>({
      query: (requestCounsellingId) => ({
        url: `counselling/${requestCounsellingId}`,
        method: "GET",
      }),
      transformErrorResponse: (response: { status: string | number }) => response.status,
      providesTags: ["RequestCounselling"],
    }),

    getAllReminder: builder.query<
        ApiResponse<{ content: RequestCounsellingVO[]; pageable: Pageable }>,
        { page?: number; size?: number; statuses?: number[] }
    >({
      query: ({ page = 1, size = 10, statuses }) => ({
        url: "counselling/all-reminder",
        method: "GET",
        params: {
          page,
          size,
          ...(statuses && statuses.length > 0 && { statuses }),
        },
      }),
      transformResponse: (response: any) => {
        console.log("Original Server Response for getAllReminder:", response);
        if (!response) {
          console.warn("Empty API response:", response);
          return {
            status: 500,
            message: "No data returned from API",
            data: {
              content: [],
              pageable: { pageNumber: 1, pageSize: 10, totalElements: 0, totalPages: 0 },
            },
          };
        }

        const responseData = response.data || response;
        if (!responseData.content) {
          console.warn("No content in response:", responseData);
          return {
            status: 500,
            message: "No content returned from API",
            data: {
              content: [],
              pageable: { pageNumber: 1, pageSize: 10, totalElements: 0, totalPages: 0 },
            },
          };
        }

        return {
          status: response.status || 200,
          message: response.message,
          data: {
            content: responseData.content,
            pageable: {
              pageNumber: responseData.pageable?.pageNumber || 0,
              pageSize: responseData.pageable?.pageSize || 10,
              totalElements: responseData.totalElements || 0,
              totalPages: responseData.pageable?.totalPages || 0,
            },
          },
        };
      },
      providesTags: ["RequestList"],
    }),
  }),
});

export const {
  useAlertReminderQuery,
  useCreateRequestCounsellingMutation,
  useGetAllRequestsQuery,
  useGetRequestCounsellingQuery,
  useGetAllReminderQuery,
} = requestCounsellingApi;