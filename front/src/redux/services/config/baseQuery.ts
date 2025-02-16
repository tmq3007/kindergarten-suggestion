import {BaseQueryApi, FetchArgs, fetchBaseQuery, FetchBaseQueryMeta} from "@reduxjs/toolkit/query/react";

// BASE_URL của server
export const BASE_URL = 'http://localhost:8080';

export const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    // Chỉnh sử header để gắn token vào request trước khi được gửi đi
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        headers.set('Accept', 'application/json');
        return headers;
    },
    // Để bảo mật hơn, ta nên lưu token trong Cookie với httpOnly >> không cần gắn token vào header
});

export const baseQueryWithReauth = async (
    args: FetchArgs,
    api: BaseQueryApi,
    extraOptions: FetchBaseQueryMeta | any
) => {
    let result = await baseQuery(args, api, extraOptions);
    // Nếu lỗi 401 Unauthorized thì gửi lại request bằng PUT method
    if (result.error && result.error.status === 401) {
        interface RefreshResponse {
            accessToken: string;
            refreshToken: string;
        }

        const refreshResult = await baseQuery(
            {
                url: '/refreshToken',
                method: 'PUT',
                body: {
                    // Đính kèm Refresh Token được lưu trong local storage trong body của request
                    // ** Để bảo mật thì không nên lưu token trong local  **
                    refreshToken: localStorage.getItem('refresh_token'),
                },
            },
            api,
            extraOptions,
        ) as { data: RefreshResponse };

        if (refreshResult.data) {
            // Lưu token mới vào local storage
            localStorage.setItem('access_token', refreshResult.data.accessToken);
            localStorage.setItem('access_token', refreshResult.data.refreshToken);

            // Cập nhật token mới vào Redux state nếu cần

            // Gửi lại request với header đã được cập nhật token mới
            result = await baseQuery(
                {
                    ...args,
                    headers: {
                        ...args.headers,
                        Authorization: `Bearer ${refreshResult.data.accessToken}`,
                    },
                },
                api,
                extraOptions,
            );
        } else {
            // Nếu không thể refresh token thì đăng xuất người dùng
        }
    }
    return result;
};