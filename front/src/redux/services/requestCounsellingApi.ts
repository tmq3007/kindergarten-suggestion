import {ApiResponse, baseQueryWithReauth} from "./config/baseQuery";
import {createApi} from "@reduxjs/toolkit/query/react";
import { DateTime } from "luxon";


export type RequestCounsellingReminderVO = {
     title: string,
      description: string
}
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

export type RequestCounsellingVO = {
    schoolVO: any;
    inquiry: string;
    status: number;
    email: string;
    phone: string;
    name: string;
    dueDate: string;
};
export const requestCounsellingApi = createApi({
    reducerPath: "requestCounsellingApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["RequestCounselling"],
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
            invalidatesTags: ["RequestCounselling"],
        }),
    }),

});

export const{useAlertReminderQuery,useCreateRequestCounsellingMutation} = requestCounsellingApi;
