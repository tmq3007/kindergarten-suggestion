import {ApiResponse, baseQueryWithReauth} from "./config/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { DateTime } from "luxon";
import {Pageable} from "@/redux/services/userApi";

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

// Types for RequestCounsellingUpdateDTO
export type RequestCounsellingUpdateDTO = {
  requestCounsellingId?: number,
  response?: string,
}

// Types for RequestCounsellingVO
export interface RequestCounsellingVO {
  id: number;
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
        ApiResponse<{ content: RequestCounsellingVO[]; page: Pageable }> | undefined,
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
      providesTags: ["RequestList"],
    }),

      getRequestCounsellingByAdmin: builder.query<ApiResponse<RequestCounsellingVO>, number>({
          query: (requestCounsellingId) => ({
              url: `counselling/get-by-admin/${requestCounsellingId}`,
              method: "GET",
          }),
          transformErrorResponse: (response: { status: string | number }) => response.status,
          providesTags: ["RequestCounselling"],
      }),
      getRequestCounsellingBySchoolOwner: builder.query<ApiResponse<RequestCounsellingVO>, number>({
          query: (requestCounsellingId) => ({
              url: `counselling/get-by-school-owner/${requestCounsellingId}`,
              method: "GET",
          }),
          transformErrorResponse: (response: { status: string | number }) => response.status,
          providesTags: ["RequestCounselling"],
      }),
      updateRequestCounsellingByAdmin: builder.mutation<ApiResponse<undefined>, RequestCounsellingUpdateDTO>({
          query: (data) => ({
              url: `/counselling/update-request-counselling-by-admin`,
              method: "PUT",
              body: data,
          }),
          invalidatesTags: ["RequestCounselling", "RequestList"],
      }),
      updateRequestCounsellingBySchoolOwner: builder.mutation<ApiResponse<undefined>, RequestCounsellingUpdateDTO>({
          query: (data) => ({
              url: `/counselling/update-request-counselling-by-school-owner`,
              method: "PUT",
              body: data,
          }),
          invalidatesTags: ["RequestCounselling", "RequestList"],
      }),

    getAllReminder: builder.query<
        ApiResponse<{ content: RequestCounsellingVO[]; page: Pageable }> | undefined,
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
      providesTags: ["RequestList"],
    }),
    getRemindersBySchoolOwner: builder.query<
        ApiResponse<{ content: RequestCounsellingVO[]; page: Pageable }> | undefined,
        { page?: number; size?: number; schoolOwnerId: number }
    >({
      query: ({ page = 1, size = 10, schoolOwnerId }) => ({
        url: "counselling/school-owner-reminders",
        method: "GET",
        headers: {
          "School-Owner-Id": String(schoolOwnerId),
        },
        params: {
          page,
          size,
        },
      }),
      providesTags: ["RequestList"],
    }),
  }),
});

// Export hooks for all endpoints
export const {
  useAlertReminderQuery,
  useCreateRequestCounsellingMutation,
  useGetAllRequestsQuery,
  useGetAllReminderQuery,
  useGetRemindersBySchoolOwnerQuery,
  useGetRequestCounsellingByAdminQuery,
  useGetRequestCounsellingBySchoolOwnerQuery,
  useUpdateRequestCounsellingByAdminMutation,
  useUpdateRequestCounsellingBySchoolOwnerMutation
} = requestCounsellingApi;