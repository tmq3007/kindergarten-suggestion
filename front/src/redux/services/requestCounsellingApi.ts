import {baseQueryWithReauth} from "./config/baseQuery";
import {createApi} from "@reduxjs/toolkit/query/react";
import { DateTime } from "luxon";


// Types for RequestCounsellingReminderVO (from requestCounsellingApi)
export type RequestCounsellingReminderVO = {
  title: string;
  description: string;
};

// Types for RequestCounsellingDTO (from requestCounsellingApi)
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

export type RequestCounsellingUpdateDTO = {
  requestCounsellingId?: number,
  response?: string,
}

// Types for RequestCounsellingVO (merged from both files)
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
  response: string | null;
}

// Types for Pageable (from requestApi)
export interface Pageable {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

// Types for ApiResponse (from requestApi)
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export const requestCounsellingApi = createApi({
  reducerPath: "requestCounsellingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["RequestCounselling", "RequestList"], // Combined tagTypes from both APIs
  endpoints: (builder) => ({
    // Endpoint: alertReminder (from requestCounsellingApi)
    alertReminder: builder.query<ApiResponse<RequestCounsellingReminderVO>, number>({
      query: (userId) => ({
        url: `counselling/alert-reminder?userId=${userId}`,
        method: "GET",
      }),
      transformErrorResponse: (response: { status: string | number }) => response.status,
      providesTags: ["RequestCounselling"],
    }),

    // Endpoint: createRequestCounselling (from requestCounsellingApi)
    createRequestCounselling: builder.mutation<
        ApiResponse<RequestCounsellingVO>,
        RequestCounsellingDTO
    >({
      query: (data) => ({
        url: "counselling/request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RequestCounselling", "RequestList"], // Invalidate both tags to refresh lists
    }),

    // Endpoint: getAllRequests (from requestApi)
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
        console.log("Original Server Response:", response); // Log phản hồi gốc từ server
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
    updateRequestCounselling: builder.mutation<ApiResponse<undefined>, RequestCounsellingUpdateDTO>({
      query: (data) => ({
        url: `/counselling/update-request-counselling`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["RequestCounselling", "RequestList"],
    }),
  }),
});

// Export hooks for all endpoints
export const {
  useAlertReminderQuery,
  useCreateRequestCounsellingMutation,
  useGetAllRequestsQuery,
  useGetRequestCounsellingQuery,
  useUpdateRequestCounsellingMutation
} = requestCounsellingApi;