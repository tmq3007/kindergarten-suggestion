import {createApi} from "@reduxjs/toolkit/query/react";
import {ApiResponse, baseQueryWithReauth} from "@/redux/services/config/baseQuery";
import {Dayjs} from "dayjs";

export type ReviewVO = {
    id: number
    schoolId: number
    schoolName: string
    parentId: number
    parentName: string
    learningProgram: number
    facilitiesAndUtilities: number
    extracurricularActivities: number
    teacherAndStaff: number
    hygieneAndNutrition: number
    feedback: string
    average: number
    receiveDate:   Dayjs
}

export const reviewApi = createApi({
    reducerPath: "reviewApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Review'],
    endpoints: (build) => ({
        getReviewBySchoolId: build.query<ApiResponse<ReviewVO[]>, number>({
            query: (schoolId) => ({
                url: `/school/review/${schoolId}`,
                method: 'GET',
            }),
            providesTags: ['Review'],
        }),
        getTop4Reviews: build.query<ApiResponse<ReviewVO[]>,void>({
            query: () => ({
                url: `/school/review/top4`,
                method: 'GET',
            }),
            providesTags: ['Review'],
        }),
    }),
});

export const { useGetReviewBySchoolIdQuery } = reviewApi;