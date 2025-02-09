import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Post } from "@/redux/services/types";
import {baseQuery, baseQueryWithReauth} from "@/redux/services/config/baseQuery";

export const postApi = createApi({
    reducerPath: 'postApi',
    baseQuery: baseQueryWithReauth,
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
