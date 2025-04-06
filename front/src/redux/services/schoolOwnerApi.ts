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
    tagTypes: ["SchoolOwner"],
    endpoints: (build) => ({
        getSchoolOfSchoolOwner: build.query<ApiResponse<SchoolVO>, void>({
            query: () => ({
                url: `/school-owner/school-info`,
                method: "GET",
            }),
            providesTags: ["SchoolOwner"],
        }),

        getDraftOfSchoolOwner: build.query<ApiResponse<SchoolVO>, void>({
            query: () => ({
                url: `/school-owner/draft-info`,
                method: "GET",
            }),
            providesTags: ["SchoolOwner"],
        }),

        getSchoolOwnersFromDraft: build.query<ApiResponse<SchoolOwnerVO[]>, number>({
            query: (schoolId) => ({
                url: `/school-owner/school-owners-from-draft/${schoolId}`,
                method: "GET",
            }),
            providesTags: ["SchoolOwner"],
        }),

    }),
});

export const {
    useGetSchoolOfSchoolOwnerQuery,
    useGetDraftOfSchoolOwnerQuery,
    useGetSchoolOwnersFromDraftQuery
} = schoolOwnerApi