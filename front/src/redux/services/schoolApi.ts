import {createApi} from "@reduxjs/toolkit/query/react";
import {ApiResponse, baseQueryWithReauth} from "@/redux/services/config/baseQuery";
import {SchoolOwnerDTO} from "@/redux/services/types";

export type SchoolVO = {
    status: number;
    name: string;
    schoolType: number;
    district: string;
    ward: string;
    province: string;
    street: string;
    email: string;
    phone: string;
    receivingAge: number;
    educationMethod: number;
    feeFrom: number;
    feeTo: number;
    description: string;
    facilities: [];
    utilities: [];
};


export const schoolApi = createApi({
    reducerPath: "schoolApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["School"],
    endpoints: (build) => ({
        getSchool: build.query<ApiResponse<SchoolVO>, number>({
            query: (schoolId) => ({
                url: `/school/${schoolId}`,
                method: 'GET',
            }),
            providesTags: ["School"],
        }),
    }),
});

export const { useGetSchoolQuery } = schoolApi;