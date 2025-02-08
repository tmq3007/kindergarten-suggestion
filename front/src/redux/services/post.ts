import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Post } from "@/redux/services/types";

export const postApi = createApi({
    reducerPath: 'postApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5000/',
    }),
    tagTypes: ['Post'],
    endpoints: (build) => ({
        getPost: build.query<Post, number>({
            query: (id) => ({ url: `posts/${id}` }),
            // Thay đổi kết quả trả về
            // transformResponse: (response: { data: Post }, meta, arg) => response.data,
            transformErrorResponse: (response: { status: string | number }, meta, arg) => response.status,
            providesTags: (result, error, id) => [{ type: 'Post', id }],
        }),
    }),
});

export const { useGetPostQuery } = postApi;
