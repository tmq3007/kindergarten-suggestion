import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, baseQueryWithReauth } from "@/redux/services/config/baseQuery";

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
        addSchool: build.mutation<ApiResponse<SchoolVO>, SchoolDTO>({
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
                    console.log("Appending images:", image);
                    image.forEach((file, index) => {
                        if (file instanceof File) {
                            formData.append("image", file);
                            console.log(`Appended file ${index}: ${file.name}, ${file.size} bytes`);
                        } else {
                            console.error(`Item ${index} is not a File:`, file);
                        }
                    });
                } else {
                    console.log("No images to append or image is not an array:", image);
                }

                // Debug FormData contents
                console.log("FormData entries:", [...formData.entries()]);
                return {
                    url: "/school/add",
                    method: "POST",
                    body: formData,
                    formData: true,
                };
            },
        }),
    }),
});

export const { useGetSchoolQuery, useAddSchoolMutation } = schoolApi;