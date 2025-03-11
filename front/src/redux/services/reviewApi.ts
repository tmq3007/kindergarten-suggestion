import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, baseQueryWithReauth } from "@/redux/services/config/baseQuery";

export type ReviewVO = {
    id: number;
    schoolId: number;
    schoolName: string;
    parentId: number;
    parentName: string;
    parentImage: string;
    learningProgram: number;
    facilitiesAndUtilities: number;
    extracurricularActivities: number;
    teacherAndStaff: number;
    hygieneAndNutrition: number;
    feedback: string;
    average: number;
    receiveDate: string;
};

type ReviewRequest = {
    schoolId: number;
    fromDate?: string; // Chuỗi ISO date, ví dụ: "2024-01-01"
    toDate?: string;   // Chuỗi ISO date
};

export const reviewApi = createApi({
    reducerPath: "reviewApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Review'],
    endpoints: (build) => ({
        getReviewBySchoolId: build.query<ApiResponse<ReviewVO[]>, ReviewRequest>({
            query: ({ schoolId, fromDate, toDate }) => {
                const params = new URLSearchParams();
                if (fromDate) params.append("fromDate", fromDate);
                if (toDate) params.append("toDate", toDate);
                return {
                    url: `/school/review/${schoolId}${params.toString() ? `?${params.toString()}` : ''}`,
                    method: "GET",
                };
            },
            providesTags: ["Review"],
        }),

        getTop4Reviews: build.query<ApiResponse<ReviewVO[]>, void>({
            query: () => ({
                url: `/school/review/top4`,
                method: 'GET',
            }),
            providesTags: ['Review'],
        }),
    }),
});

export const { useGetReviewBySchoolIdQuery, useGetTop4ReviewsQuery } = reviewApi;