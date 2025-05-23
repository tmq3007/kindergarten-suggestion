import {createApi} from "@reduxjs/toolkit/query/react";
import {ApiResponse, baseQueryWithReauth} from "@/redux/services/config/baseQuery";
import {SchoolVO} from "@/redux/services/schoolApi";
import {Pageable, UserDetailDTO} from "@/redux/services/userApi";

interface ChangePasswordDTO {
    oldPassword: string;
    newPassword: string;
}

export type ParentUpdateDTO = {
    id?: number;
    username?: string;
    email: string;
    status?: boolean;
    fullname: string;
    phone: string;
    dob: string;
    district: string | null;
    ward: string | null;
    province: string | null;
    street: string | null;
    role: string;
    media?: File;
};

export type ParentVO = {
    id: number;
    username?: string;
    email: string;
    status?: boolean;
    fullname: string;
    phone: string;
    dob?: string;
    district: string | null;
    ward: string | null;
    province: string | null;
    street: string | null;
    role?: string;
    userId: number;
    media?: MediaVO;
    pis?: ParentInSchoolVO;
};

export type ParentInSchoolVO = {
    id: number;
    parent?: ParentVO;
    school?: SchoolVO;
    fromDate: Date;
    toDate?: Date;
    status: number,
    providedRating?: number;
    comment?: string;
}

export type ParentInSchoolDetailVO = {
    id: number;
    school: SchoolVO;
    fromDate: Date;
    toDate?: Date;
    status: number,
    providedRating?: number;
    comment?: string;
    hasEditCommentPermission: boolean
    totalSchoolReview: number | 0;
    averageSchoolRating: number | 0.0;
}

export type MediaVO = {
    url: string;
    filename: string;
    cloudId: string;
};
export const parentApi = createApi({
    reducerPath: "parentApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Parent", "ParentsList", "AcademicHistory"],
    endpoints: (build) => ({

        getParentById: build.query<ApiResponse<ParentVO>, number>({
            query: (userId) => ({
                url: `parent/${userId}`,
                method: "GET",
            }),
            transformErrorResponse: (response: { status: string | number }) => response.status,
            providesTags: ["Parent"],
        }),

        editParent: build.mutation<
            ApiResponse<ParentVO>,
            { parentId: string; data: ParentUpdateDTO; image?: File }
        >({
            query: ({parentId, data, image}) => {
                const formData = new FormData();

                const {media, ...parentDataWithoutImage} = data;

                formData.append(
                    "data",
                    new Blob([JSON.stringify(parentDataWithoutImage)], {type: "application/json"})
                );

                if (image instanceof File) {
                    formData.append("image", image);
                }

                return {
                    url: `parent/edit/${Number(parentId)}`,
                    method: "PUT",
                    body: formData,
                };
            },
            invalidatesTags: ["Parent"],
        }),

        changePassword: build.mutation<
            ApiResponse<void>,
            { parentId: number; data: ChangePasswordDTO }
        >({
            query: ({parentId, data}) => ({
                url: `parent/${parentId}/change-password`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Parent"],
        }),

        listAllParentWithFilter: build.query<
            ApiResponse<{ content: ParentVO[]; page: Pageable }>,
            { page?: number; size?: number; searchBy?: string; keyword?: string; status?: boolean }
        >({
            query: ({ page = 1, size = 15, searchBy, keyword, status }) => ({
                url: `parent/get-all-parents`,
                method: "GET",
                params: {
                    page,
                    size,
                    searchBy,
                    keyword,
                    status,
                },
            }),
            providesTags: ["ParentsList"],
        }),

        listParentBySchoolWithFilter: build.query<
            ApiResponse<{ content: ParentVO[]; page: Pageable }>,
            { page?: number; size?: number; searchBy?: string; keyword?: string }
        >({
            query: ({page = 1, size = 15, searchBy, keyword}) => ({
                url: `parent/get-parent-by-school`,
                method: "GET",
                params: {
                    page,
                    size,
                    searchBy,
                    keyword,
                },
            }),
            providesTags: ["ParentsList"],
        }),

        listEnrollRequestBySchoolWithFilter: build.query<
            ApiResponse<{ content: ParentVO[]; page: Pageable }>,
            { page?: number; size?: number; searchBy?: string; keyword?: string }
        >({
            query: ({page = 1, size = 15, searchBy, keyword}) => ({
                url: `parent/get-enroll-request-by-school`,
                method: "GET",
                params: {
                    page,
                    size,
                    searchBy,
                    keyword,
                },
            }),
            providesTags: ["ParentsList"],
        }),

        getCountEnrollRequestBySchool: build.query<ApiResponse<number>, void>({
            query: () => ({
                url: "parent/get-school-request-count",
                method: "GET",
            }),
            providesTags: ["ParentsList"],
        }),

        toggleParentStatus: build.mutation<ApiResponse<UserDetailDTO>, number>({
            query: (userId) => ({
                url: `/user/toggle?userId=${userId}`,
                method: 'PUT',
            }),
            invalidatesTags: ["ParentsList"],
        }),

        getAcademicHistoryByParent: build.query<ApiResponse<ParentInSchoolVO []>, { parentId: number }>({
            query: ({parentId}) => ({
                url: `parent/get-academic-history/${parentId}`,
                method: "GET",
            }),
            providesTags: ["AcademicHistory"],
        }),

        enrollParent: build.mutation({
            query: (parentInSchoolId:number) => ({
                url: `/parent/enroll/${parentInSchoolId}`,
                method: 'PUT',
            }),
            invalidatesTags: ["ParentsList"],
        }),

        unEnrollParent: build.mutation({
            query: (parentInSchoolId:number) => ({
                url: `/parent/un-enroll/${parentInSchoolId}`,
                method: 'PUT',
            }),
            invalidatesTags: ["ParentsList"],
        }),

        rejectParent: build.mutation({
            query: (parentInSchoolId:number) => ({
                url: `/parent/reject/${parentInSchoolId}`,
                method: 'PUT',
            }),
            invalidatesTags: ["ParentsList"],
        }),

        changeAvatar: build.mutation<any, { userId: number | undefined; image: File }>({
            query: ({ userId, image }) => {
                const formData = new FormData();
                formData.append('image', image);

                return {
                    url: `parent/change-avatar/${userId}`,
                    method: 'PUT',
                    body: formData,
                };
            },
            invalidatesTags: ['Parent'],
        }),

        getPresentAcademicHistoryByParent: build.query<
            ApiResponse<{ content: ParentInSchoolDetailVO[]; page: Pageable }> | undefined,
            { page?: number; size?: number; }
        >({
            query: ({page = 1, size = 2}) => ({
                url: "parent/get-present-academic-history",
                method: "GET",
                params: {
                    page,
                    size,
                },
            }),
            providesTags: ["AcademicHistory"],
        }),

        getPreviousAcademicHistoryByParent: build.query<
            ApiResponse<{ content: ParentInSchoolDetailVO[]; page: Pageable }> | undefined,
            { page?: number; size?: number; }
        >({
            query: ({page = 1, size = 2}) => ({
                url: "parent/get-previous-academic-history",
                method: "GET",
                params: {
                    page,
                    size,
                },
            }),
            providesTags: ["AcademicHistory"],
        }),

        requestEnrollingSchool: build.mutation({
            query: (schoolId:number) => ({
                url: `/parent/request-enroll/${schoolId}`,
                method: 'POST',
            }),
        }),

    }),
});

export const {
    useGetParentByIdQuery,
    useEditParentMutation,
    useListAllParentWithFilterQuery,
    useChangePasswordMutation,
    useListParentBySchoolWithFilterQuery,
    useListEnrollRequestBySchoolWithFilterQuery,
    useGetCountEnrollRequestBySchoolQuery,//SO
    useGetAcademicHistoryByParentQuery,
    useToggleParentStatusMutation,
    useEnrollParentMutation,
    useUnEnrollParentMutation,
    useRejectParentMutation,
    useChangeAvatarMutation,
    useGetPresentAcademicHistoryByParentQuery,
    useGetPreviousAcademicHistoryByParentQuery,
    useRequestEnrollingSchoolMutation
} = parentApi;