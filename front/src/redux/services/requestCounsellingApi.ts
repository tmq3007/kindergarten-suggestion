import {ApiResponse, baseQueryWithReauth} from "./config/baseQuery";
import {createApi} from "@reduxjs/toolkit/query/react";


export type RequestCounsellingReminderVO = {
     title: string,
      description: string
}

export const requestCounsellingApi = createApi({
    reducerPath: "requestCounsellingApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["RequestCounselling"],
    endpoints: (builder) => ({
        alertReminder: builder.query<ApiResponse<RequestCounsellingReminderVO>, number>({
            query: (userId) => ({
                url: `reminders/alert-reminder?userId=${userId}`,
                method: "GET",
             }),
            transformErrorResponse: (response: { status: string | number }) => response.status,
            providesTags: ["RequestCounselling"],
        }),
    }),
});

export const{useAlertReminderQuery} = requestCounsellingApi;
