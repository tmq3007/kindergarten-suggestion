import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Province {
    code: number;
    name: string;
    // Add other properties as needed based on the API response
}

export interface District {
    code: number;
    name: string;
    province_code: number;
    // Add other properties as needed
}

export interface Ward {
    code: number;
    name: string;
    district_code: number;
    // Add other properties as needed
}

export const addressApi = createApi({
    reducerPath: 'addressApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'https://provinces.open-api.vn/api/' }),
    endpoints: (builder) => ({
        getProvinces: builder.query<Province[], void>({
            query: () => 'p/',
        }),
        getDistricts: builder.query<District[], number>({
            query: (provinceCode) => `p/${provinceCode}?depth=2`,
            transformResponse: (response: { districts: District[] }) => response.districts || [],
        }),
        getWards: builder.query<Ward[], number>({
            query: (districtCode) => `d/${districtCode}?depth=2`,
            transformResponse: (response: { wards: Ward[] }) => response.wards || [],
        }),
    }),
});

export const {
    useGetProvincesQuery,
    useGetDistrictsQuery,
    useGetWardsQuery,
} = addressApi;