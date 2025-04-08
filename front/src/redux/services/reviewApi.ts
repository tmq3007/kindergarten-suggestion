import {createApi} from "@reduxjs/toolkit/query/react";
import {ApiResponse, baseQueryWithReauth} from "@/redux/services/config/baseQuery";
import {Pageable} from "@/redux/services/userApi";
import {SchoolVO} from "@/redux/services/schoolApi";


export type RatingStats = {
    averageRating: number;
    totalRatings: number;
    ratingsByStarRange: {
        "1": number; // Count of reviews with average >= 1 and < 2
        "2": number; // Count of reviews with average >= 2 and < 3
        "3": number; // Count of reviews with average >= 3 and < 4
        "4": number; // Count of reviews with average >= 4 and < 5
        "5": number; // Count of reviews with average = 5
    };
    categoryRatings: {
        learningProgram: number;
        facilitiesAndUtilities: number;
        extracurricularActivities: number;
        teachersAndStaff: number;
        hygieneAndNutrition: number;
    };
}

export type ReviewVO = {
    id: number;
    schoolId?: number;
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
    report?: string;
    status: number;
};

type ReviewRequest = {
    schoolId?: number;
    fromDate?: string; // Chuỗi ISO date, ví dụ: "2024-01-01"
    toDate?: string;   // Chuỗi ISO date
    status?: string;
};

export type ReviewReportDTO = {
    id: number,
    reason: string
};

export type ReviewAcceptDenyDTO = {
    id: number,
    decision: boolean
}

export type ReviewReportReminderVO = {
    schoolId: number,
    schoolName: string,
    total: number
}

export const reviewApi = createApi({
    reducerPath: "reviewApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Review','ReviewStats'],
    endpoints: (build) => ({
        getReviewBySchoolId: build.query<ApiResponse<ReviewVO[]>, ReviewRequest>({
            query: ({schoolId, fromDate, toDate, status}) => {
                const params = new URLSearchParams();
                if (fromDate) params.append("fromDate", fromDate);
                if (toDate) params.append("toDate", toDate);
                if (status) params.append("status", status);
                return {
                    url: `/school/review/${schoolId}${params.toString() ? `?${params.toString()}` : ''}`,
                    method: "GET",
                };
            },
            providesTags: ["Review"],
        }),

        getReviewBySchoolOwner: build.query<ApiResponse<ReviewVO[]>, ReviewRequest>({
            query: ({fromDate, toDate, status}) => {
                const params = new URLSearchParams();
                if (fromDate) params.append("fromDate", fromDate);
                if (toDate) params.append("toDate", toDate);
                if (status) params.append("status", status);
                const queryString = params.toString();
                return {
                    url: `/school/review/${queryString ? `?${queryString}` : ''}`,
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

        reportReview: build.mutation<ApiResponse<ReviewVO>, ReviewReportDTO>({
            query: (ReviewReportDTO) => ({
                url: `/school/review/report`,
                method: 'PUT',
                body: ReviewReportDTO
            }),
            invalidatesTags: ['Review'],
        }),

        reportDecision: build.mutation<ApiResponse<ReviewVO>, ReviewAcceptDenyDTO>({
            query: (ReviewAcceptDenyDTO) => ({
                url: `/school/review/report/decision`,
                method: 'PUT',
                body: ReviewAcceptDenyDTO
            }),
            invalidatesTags: ['Review'],
        }),

        getReviewReportReminders: build.query<ApiResponse<ReviewReportReminderVO[]>, void>({
            query: () => ({
                url: `/school/review/count`,
                method: 'GET',
            }),
            providesTags: ['Review'],
        }),

        getReviewBySchoolForPublic: build.query<ApiResponse<{ content: ReviewVO[]; page: Pageable }>, {schoolId: number, page?: number, size?:number, star?: number}>({
            query: ({schoolId, page=1, size, star}) => ({
                url: `/school/review/public/${schoolId}`,
                method: "GET",
                params: {
                    page,
                    size,
                    star
                }
            }),
            providesTags: ["Review"],
        }),

        getReviewStatsBySchool: build.query<ApiResponse<RatingStats>, number>({
            query: (schoolId) => ({
                url: `/school/review/public/${schoolId}/stats`,
                method: "GET",
            }),
            providesTags: ["ReviewStats"],
        }),
    }),
});

export const {
    useGetReviewBySchoolIdQuery,
    useGetTop4ReviewsQuery,
    useGetReviewBySchoolOwnerQuery,
    useReportReviewMutation,
    useReportDecisionMutation,
    useGetReviewReportRemindersQuery,
    useGetReviewBySchoolForPublicQuery,
    useGetReviewStatsBySchoolQuery
} = reviewApi;