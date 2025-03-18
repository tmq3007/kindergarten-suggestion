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
        // Get school list
        getSchoolOfSchoolOwner: build.query<ApiResponse<SchoolVO>, void>({
            query: () => ({
                url: `/school-owner/school-info`,
                method: "GET",
            }),
            providesTags: ["School"],
        }),
    }),
});

export const {useGetSchoolOfSchoolOwnerQuery} = schoolOwnerApi