import {createApi} from "@reduxjs/toolkit/query/react";
import {ApiResponse, baseQueryWithReauth} from "@/redux/services/config/baseQuery";
import {SchoolVO} from "@/redux/services/schoolApi";

export type SchoolOwnerVO = {
    id: number;
    userId: number,
    fullname: string;
    username: string;
    email: string;
    phone: string;
};

export const schoolOwnerApi = createApi({
    reducerPath: "schoolOwnerApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["School"],
    endpoints: (build) => ({
        getSchoolOfSchoolOwner: build.query<ApiResponse<SchoolVO>, void>({
            query: () => ({
                url: `/school-owner/school-info`,
                method: "GET",
            }),
            providesTags: ["School"],
        }),

        getDraftOfSchoolOwner: build.query<ApiResponse<SchoolVO>, void>({
            query: () => ({
                url: `/school-owner/draft-info`,
                method: "GET",
            }),
            providesTags: ["School"],
        }),
        getSchoolDraftOfSchoolOwner: build.query<ApiResponse<SchoolVO>, number>({
            query: (userId  ) => ({
                url: `/school-owner/draft/${userId}`,
                method: "GET",
            }),
            providesTags: ["School"],
        }),
    }),
});

export const {
    useGetSchoolOfSchoolOwnerQuery,
    useGetDraftOfSchoolOwnerQuery,
    useGetSchoolDraftOfSchoolOwnerQuery
} = schoolOwnerApi