import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, baseQueryWithReauth } from "@/redux/services/config/baseQuery";

export interface Facility {
    fid: number;
    name: string;
}

export interface Utility {
    uid: number;
    name: string;
}

export type SchoolDetailVO = {
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
    website: string;
    facilities: Facility[];
    utilities: Utility[];
    posted_date: Date | null;
};

export type SchoolDTO = {

    name: string;
    schoolType: number;
    website?: string;
    status: number;
    // Address Fields
    province: string;
    district: string;
    ward: string;
    street?: string;
    email: string;
    phone: string;
    receivingAge: number;
    educationMethod: number;
    // Fee Range
    feeFrom: number;
    feeTo: number;
    // Facilities and Utilities (Checkbox Groups)
    facilities?: number[];
    utilities?: number[];
    description?: string; // School introduction
    // File Upload
    image?: File[];
}

export interface SchoolUpdateDTO extends SchoolDTO {
    id: number;
}

export interface SchoolCreateDTO extends SchoolDTO{
    userId: number;
}

export const schoolApi = createApi({
    reducerPath: "schoolApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["School"],
    endpoints: (build) => ({
        getSchool: build.query<ApiResponse<SchoolDetailVO>, number>({
            query: (schoolId) => ({
                url: `/school/${schoolId}`,
                method: 'GET',
            }),
            providesTags: ["School"],
        }),
        checkSchoolEmail: build.query<ApiResponse<string>, string>({
            query: (email) => ({
                url: `/school/check-email/${email}`,
                method: "GET",
            }),
            keepUnusedDataFor: 0,
        }),
        checkSchoolPhone: build.query<ApiResponse<string>, string>({
            query: (phone) => ({
                url: `/school/check-phone/${phone}`,
                method: "GET",
            }),
            keepUnusedDataFor: 0,
        }),
        addSchool: build.mutation<ApiResponse<SchoolDetailVO>, SchoolCreateDTO>({
            query: (schoolDTO) => {
                const formData = new FormData();
                const { image, ...schoolDataWithoutImage } = schoolDTO;
                formData.append("data", new Blob([JSON.stringify(schoolDataWithoutImage)], { type: "application/json" }));
                // Append JSON data
                formData.append(
                    "data",
                    new Blob([JSON.stringify(schoolDataWithoutImage)], { type: "application/json" })
                );
                // Append images with validation
                if (image && Array.isArray(image)) {
                    image.forEach((file, index) => {
                        if (file instanceof File) {
                            formData.append("image", file);
                        } else {
                            console.error(`Item ${index} is not a File:`, file);
                        }
                    });
                }
                return {
                    url: "/school/add",
                    method: "POST",
                    body: formData,
                    formData: true,
                };
            },
        }),
        updateSchoolByAdmin: build.mutation<ApiResponse<SchoolDetailVO>, SchoolUpdateDTO>({
            query: (schoolUpdateDTO) => {
                console.log('schoolUpdateDTO', schoolUpdateDTO);
                const formData = new FormData();
                const { image, ...schoolDataWithoutImage } = schoolUpdateDTO;
                formData.append("data", new Blob([JSON.stringify(schoolDataWithoutImage)], { type: "application/json" }));
                // Append JSON data
                formData.append(
                    "data",
                    new Blob([JSON.stringify(schoolDataWithoutImage)], { type: "application/json" })
                );
                // Append images with validation
                if (image && Array.isArray(image)) {
                    image.forEach((file, index) => {
                        if (file instanceof File) {
                            formData.append("image", file);
                        } else {
                            console.error(`Item ${index} is not a File:`, file);
                        }
                    });
                }
                return {
                    url: "/school/update/by-admin",
                    method: "POST",
                    body: formData,
                    formData: true,
                };
            },
        }),
    }),
});

export const {
    useGetSchoolQuery,
    useAddSchoolMutation,
    useLazyCheckSchoolEmailQuery,
    useLazyCheckSchoolPhoneQuery,
    useUpdateSchoolByAdminMutation
} = schoolApi;