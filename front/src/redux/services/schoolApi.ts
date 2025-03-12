import{createApi}from"@reduxjs/toolkit/query/react";
import {ApiResponse, baseQueryWithReauth }from "@/redux/services/config/baseQuery";

export interface Facility {
fid: number;
name: string;
}

export interface Utility {
uid: number;
name: string;
}

export type SchoolDetailVO = {
fileList: any;
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
imageList: MediaVO[];
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
// School introduction
description?: string;
// File Upload
image?: File[];

schoolOwners?: number[]
}

export type ChangeSchoolStatusDTO = {
status: number;
}

export interface SchoolUpdateDTO extends SchoolDTO {
id: number;
}

export type SchoolVO = {
id: number;
status: number; // Byte in Java = = number in TS
name: string;
schoolType: number; // Byte
district: string;
ward: string;
province: string;
street: string;
email: string;
phone: string;
website: string;
receivingAge: number; // Byte
educationMethod: number; // Byte
feeFrom: number; // Integer
feeTo: number; // Integer
description: string;
posted_date: string; // Date in Java = > string (ISO format) in TS
facilities?: {fid: number}[]; // Add facilities(assuming this structure)
    utilities?: { uid: number }[]; // Add utilities (assuming this structure)
    imageList?: MediaVO[];
};

export type MediaVO = {
    url: string;
    filename: string;
    cloudId: string;
};

export type Pageable = {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
};

export type ExpectedSchool = {
    expectedSchool: string
}

// Utility function to handle FormData creation
const createSchoolFormData = (schoolData: SchoolDTO | SchoolUpdateDTO): FormData => {
    const formData = new FormData();
    const {image, ...schoolDataWithoutImage} = schoolData;

    // Append JSON data
    formData.append("data", new Blob([JSON.stringify(schoolDataWithoutImage)], {type: "application/json"}));

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

    return formData;
};

export interface SchoolCreateDTO extends SchoolDTO{
    userId: number,
    
    //TODO: Change to number[]
    schoolOwners?: any[];
}

const formatPhoneNumber = (phone: string | undefined): string => {
    if (phone && phone.startsWith('+84') && /^\+84\d{9,10}$/.test(phone)) {
        return phone.substring(3);
    }
    return 'Invalid phone number';
};


export const schoolApi = createApi({
    reducerPath: "schoolApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["School", "SchoolList"],
    endpoints: (build) => ({
        // Get school list
        getSchoolList: build.query<
            ApiResponse<{ content: SchoolVO[]; pageable: Pageable }>,
            {
                page?: number;
                size?: number;
                name?: string;
                province?: string;
                district?: string;
                email?: string;
                phone?: string;
            }
        >({
            query: ({page = 1, size, name, province, district, email, phone}) => ({
                url: `/school/all`,
                method: "GET",
                params: {
                    page,
                    size,
                    ...(name && {name}),
                    ...(province && {province}),
                    ...(district && {district}),
                    ...(email && {email}),
                    ...(phone && {phone}),
                },
            }),
            transformResponse: (
                response: ApiResponse<{ content: SchoolVO[]; pageable: Pageable; totalElements: number }>
            ) => ({
                ...response,
                data: {
                    ...response.data,
                    pageable: {
                        ...response.data.pageable,
                        totalElements: response.data.totalElements,
                    },
                },
            }),
            providesTags: ["SchoolList"],
        }),

        // Lấy danh sách trường học theo userId
        getSchoolByUserId: build.query<ApiResponse<SchoolVO>, { name?: string }>({
            query: ({ name }) => ({
                url: `/school/by-user`,
                method: "GET",
                params: name ? { name } : undefined,
            }),
            providesTags: ["School"],
        }),

        // Get school detail by ID
        getSchoolById: build.query<ApiResponse<SchoolVO>, number>({
            query: (schoolId) => ({
                url: `/school/${schoolId}`,
                method: "GET",
            }),
            providesTags: ["SchoolList"], // refetch data after changing
        }),

        // Mutation to handle approve
        approveSchool: build.mutation<ApiResponse<SchoolVO>, number>({
            query: (schoolId) => ({
                url: `/school/${schoolId}/approve`,
                method: "PUT",
            }),
            invalidatesTags: ["SchoolList"], // refetch data after approving
        }),

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

        addSchool: build.mutation<ApiResponse<SchoolDetailVO>, SchoolDTO>({
            query: (schoolDTO) => {
                const formData = createSchoolFormData(schoolDTO); // Sử dụng hàm utility
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
                const formData = createSchoolFormData(schoolUpdateDTO); // Sử dụng hàm utility
                return {
                    url: "/school/update/by-admin",
                    method: "POST",
                    body: formData,
                    formData: true,
                };
            },
            invalidatesTags: ["School"],
        }),

        updateSchoolStatusByAdmin: build.mutation<ApiResponse<void>, {
            schoolId: number;
            changeSchoolStatusDTO: ChangeSchoolStatusDTO
        }>({
            query: ({schoolId, changeSchoolStatusDTO}) => ({
                url: `/school/change-status/by-admin/${schoolId}`,
                method: 'PUT',
                body: changeSchoolStatusDTO,
            }),
            invalidatesTags: ["School", "SchoolList"],
        }),

        updateSchoolStatusBySchoolOwner: build.mutation<ApiResponse<void>, {
            schoolId: number;
            changeSchoolStatusDTO: ChangeSchoolStatusDTO
        }>({
            query: ({schoolId, changeSchoolStatusDTO}) => ({
                url: `/school/change-status/by-school-owner/${schoolId}`,
                method: 'PUT',
                body: changeSchoolStatusDTO,
            }),
            invalidatesTags: ["School"],
        }),

        searchExpectedSchool: build.query<ApiResponse<ExpectedSchool[]>, void>({
            query: () => ({
                url: "school/search-expected-school"
            }),
        }),
    }),
});

export const {
    useGetSchoolQuery,
    useAddSchoolMutation,
    useLazyCheckSchoolEmailQuery,
    useLazyCheckSchoolPhoneQuery,
    useUpdateSchoolByAdminMutation,
    useUpdateSchoolStatusByAdminMutation,
    useUpdateSchoolStatusBySchoolOwnerMutation,
    useGetSchoolListQuery,
    useGetSchoolByUserIdQuery,
    useGetSchoolByIdQuery,
    useApproveSchoolMutation,
    useSearchExpectedSchoolQuery,
} = schoolApi;